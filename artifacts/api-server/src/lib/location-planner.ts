import type { AirportOption, RouteOptionsResponse } from "@workspace/api-zod";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type GeocodingResult = {
  lat: string;
  lon: string;
};

type AirportDatasetEntry = {
  name: string;
  latitude: number;
  longitude: number;
  iataCode: string | null;
};

type OsrmResponse = {
  code: string;
  routes?: Array<{ distance: number; duration: number }>;
};

const GEOCODE_TTL_MS = 60 * 60 * 1000;
const AIRPORT_TTL_MS = 24 * 60 * 60 * 1000;
const geocodeCache = new Map<string, { value: Coordinates | null; expiresAt: number }>();
const airportCache = new Map<string, { value: AirportOption[]; expiresAt: number }>();
const geocodeRequests = new Map<string, Promise<Coordinates | null>>();
let geocodeQueue: Promise<void> = Promise.resolve();
let lastGeocodeRequestAt = 0;
let airportDataset: AirportDatasetEntry[] | null = null;
let airportDatasetExpiresAt = 0;
let airportDatasetRequest: Promise<AirportDatasetEntry[]> | null = null;

async function fetchJson<T>(url: string, options?: RequestInit, timeoutMs = 18_000): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers = new Headers(options?.headers);
    headers.set("User-Agent", "TripCustomizer/1.0 (travel planning location lookup)");
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers,
    });
    if (!response.ok) {
      throw new Error(`Location provider returned ${response.status}`);
    }
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchText(url: string, timeoutMs = 25_000): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "TripCustomizer/1.0 (travel planning location lookup)",
        Accept: "text/csv",
      },
    });
    if (!response.ok) {
      throw new Error(`Airport data provider returned ${response.status}`);
    }
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function parseScheduledAirports(csv: string): AirportDatasetEntry[] {
  const airports: AirportDatasetEntry[] = [];
  let headers: string[] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const finishRow = () => {
    row.push(field);
    field = "";

    if (!headers.length) {
      headers = row;
      row = [];
      return;
    }

    const value = (name: string) => row[headers.indexOf(name)] ?? "";
    const type = value("type");
    const latitude = Number(value("latitude_deg"));
    const longitude = Number(value("longitude_deg"));
    if (
      value("scheduled_service") === "yes" &&
      type !== "closed" &&
      type !== "heliport" &&
      value("name") &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      const iataCode = value("iata_code").toUpperCase();
      airports.push({
        name: value("name"),
        latitude,
        longitude,
        iataCode: /^[A-Z0-9]{3}$/.test(iataCode) ? iataCode : null,
      });
    }
    row = [];
  };

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    if (inQuotes) {
      if (character === '"') {
        if (csv[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += character;
      }
    } else if (character === '"') {
      inQuotes = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      finishRow();
    } else if (character !== "\r") {
      field += character;
    }
  }

  if (field || row.length) finishRow();
  return airports;
}

async function loadAirportDataset(): Promise<AirportDatasetEntry[]> {
  if (airportDataset && airportDatasetExpiresAt > Date.now()) return airportDataset;
  if (airportDatasetRequest) return airportDatasetRequest;

  airportDatasetRequest = fetchText(
    "https://raw.githubusercontent.com/davidmegginson/ourairports-data/main/airports.csv",
  )
    .then((csv) => {
      const parsed = parseScheduledAirports(csv);
      if (parsed.length === 0) throw new Error("Airport dataset did not contain scheduled airports");
      airportDataset = parsed;
      airportDatasetExpiresAt = Date.now() + AIRPORT_TTL_MS;
      return parsed;
    })
    .finally(() => {
      airportDatasetRequest = null;
    });

  return airportDatasetRequest;
}

function keepCacheBounded<T>(cache: Map<string, T>, maxEntries = 300): void {
  while (cache.size > maxEntries) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey === undefined) return;
    cache.delete(oldestKey);
  }
}

function geocodeLocation(place: string): Promise<Coordinates | null> {
  const key = place.trim().toLocaleLowerCase();
  const cached = geocodeCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.value);

  const pending = geocodeRequests.get(key);
  if (pending) return pending;

  const request = geocodeQueue.then(async (): Promise<Coordinates | null> => {
    const waitMs = Math.max(0, 1_100 - (Date.now() - lastGeocodeRequestAt));
    if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
    lastGeocodeRequestAt = Date.now();

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("q", place.trim());

    const results = await fetchJson<GeocodingResult[]>(url.toString(), {
      headers: { "Accept-Language": "en" },
    });
    const first = results[0];
    const value = first
      ? { latitude: Number(first.lat), longitude: Number(first.lon) }
      : null;
    geocodeCache.set(key, { value, expiresAt: Date.now() + GEOCODE_TTL_MS });
    keepCacheBounded(geocodeCache);
    return value;
  });

  geocodeQueue = request.then(() => undefined, () => undefined);
  geocodeRequests.set(key, request);
  void request.then(
    () => geocodeRequests.delete(key),
    () => geocodeRequests.delete(key),
  );
  return request;
}

function haversineKm(a: Coordinates, b: Coordinates): number {
  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(b.latitude - a.latitude);
  const longitudeDelta = radians(b.longitude - a.longitude);
  const startLatitude = radians(a.latitude);
  const endLatitude = radians(b.latitude);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return 6_371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

async function findNearbyAirports(destination: Coordinates): Promise<AirportOption[]> {
  const cacheKey = `${destination.latitude.toFixed(2)},${destination.longitude.toFixed(2)}`;
  const cached = airportCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const dataset = await loadAirportDataset();
  const airportsByKey = new Map<string, AirportOption>();
  for (const entry of dataset) {
    const airport: AirportOption = {
      name: entry.name,
      iataCode: entry.iataCode,
      distanceKm: Number(
        haversineKm(destination, {
          latitude: entry.latitude,
          longitude: entry.longitude,
        }).toFixed(1),
      ),
    };
    const key = airport.iataCode ?? airport.name.trim().toLocaleLowerCase();
    const current = airportsByKey.get(key);
    if (!current || airport.distanceKm < current.distanceKm) {
      airportsByKey.set(key, airport);
    }
  }

  const airports = [...airportsByKey.values()]
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 10);
  airportCache.set(cacheKey, { value: airports, expiresAt: Date.now() + AIRPORT_TTL_MS });
  keepCacheBounded(airportCache);
  return airports;
}

function unavailableRoadRoute(message: string): RouteOptionsResponse["roadRoute"] {
  return { status: "unavailable", distanceKm: null, durationMinutes: null, message };
}

async function findRoadRoute(
  origin: Coordinates,
  destination: Coordinates,
): Promise<RouteOptionsResponse["roadRoute"]> {
  const url = new URL(
    `https://router.project-osrm.org/route/v1/driving/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`,
  );
  url.searchParams.set("overview", "false");
  url.searchParams.set("steps", "false");

  try {
    const result = await fetchJson<OsrmResponse>(url.toString(), undefined, 15_000);
    const route = result.routes?.[0];
    if (result.code !== "Ok" || !route) {
      return unavailableRoadRoute(
        "No continuous driving route was found. The journey may cross water or a border without a road connection.",
      );
    }

    const distanceKm = Number((route.distance / 1_000).toFixed(1));
    const durationMinutes = Math.round(route.duration / 60);
    const status =
      distanceKm <= 500 ? "drivable" : distanceKm <= 1_000 ? "long_drive" : "not_recommended";
    const driveHours = Math.floor(durationMinutes / 60);
    const driveMinutes = durationMinutes % 60;
    const durationLabel = driveHours
      ? `${driveHours} hr${driveHours === 1 ? "" : "s"}${driveMinutes ? ` ${driveMinutes} min` : ""}`
      : `${driveMinutes} min`;
    const message =
      status === "drivable"
        ? `Driving is a practical option: about ${distanceKm.toLocaleString()} km and ${durationLabel} without long stops.`
        : status === "long_drive"
          ? `Driving is possible but long: about ${distanceKm.toLocaleString()} km and ${durationLabel}. Compare it with flying.`
          : `The road route is about ${distanceKm.toLocaleString()} km and ${durationLabel}; flying is likely more practical.`;

    return { status, distanceKm, durationMinutes, message };
  } catch {
    return unavailableRoadRoute("Driving-route estimates are temporarily unavailable. Try again shortly.");
  }
}

export async function getLocationRouteOptions(
  destinationName: string,
  originName: string,
): Promise<RouteOptionsResponse> {
  const [destination, origin] = await Promise.all([
    geocodeLocation(destinationName),
    geocodeLocation(originName),
  ]);

  if (!destination) {
    return {
      airports: [],
      airportMessage: "The destination could not be located. Check its spelling and include the country.",
      roadRoute: unavailableRoadRoute(
        "The destination could not be located. Check its spelling and include the country.",
      ),
    };
  }

  const [airportsResult, roadRoute] = await Promise.all([
    findNearbyAirports(destination).then(
      (airports) => ({ airports, error: null as string | null }),
      () => ({
        airports: [] as AirportOption[],
        error: "Nearby airport data is temporarily unavailable. Try again shortly.",
      }),
    ),
    origin
      ? findRoadRoute(origin, destination)
      : Promise.resolve(
          unavailableRoadRoute(
            "The starting location could not be located, so a driving route could not be estimated.",
          ),
        ),
  ]);

  return {
    airports: airportsResult.airports,
    airportMessage:
      airportsResult.error ??
      (airportsResult.airports.length === 0
        ? "No nearby airports with listed passenger service were found."
        : null),
    roadRoute,
  };
}
