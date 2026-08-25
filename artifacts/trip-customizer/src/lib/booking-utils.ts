/** Generates pre-filled deep links to major booking platforms */

function fmt(date: string) {
  // returns YYYY-MM-DD as-is, already correct for most platforms
  return date?.slice(0, 10) ?? "";
}

function slug(str: string) {
  return encodeURIComponent(str.trim());
}

// ─── Flights ──────────────────────────────────────────────────────────────────

export function googleFlightsUrl(from: string, to: string, depart: string, returnDate: string) {
  const q = `round trip flights from ${from} to ${to} departing ${fmt(depart)} returning ${fmt(returnDate)}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}&hl=en`;
}

export function skyscannerFlightsUrl(from: string, to: string, depart: string, returnDate: string, adults: number) {
  const d = fmt(depart).replace(/-/g, "");
  const r = fmt(returnDate).replace(/-/g, "");
  const f = from.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z-]/g, "");
  const t = to.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z-]/g, "");
  return `https://www.skyscanner.com/transport/flights/${f}/${t}/${d}/${r}/?adults=${adults}`;
}

export function kayakFlightsUrl(from: string, to: string, depart: string, returnDate: string, adults: number) {
  const f = from.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z-]/g, "");
  const t = to.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z-]/g, "");
  return `https://www.kayak.com/flights/${f}-${t}/${fmt(depart)}/${fmt(returnDate)}/${adults}adults`;
}

export function expediaFlightsUrl(from: string, to: string, depart: string, returnDate: string, adults: number) {
  const params = new URLSearchParams({
    trip: "roundtrip",
    leg1: `from:${from},to:${to},departure:${fmt(depart)}TANYT`,
    leg2: `from:${to},to:${from},departure:${fmt(returnDate)}TANYT`,
    passengers: `adults:${adults}`,
    mode: "search",
  });
  return `https://www.expedia.com/Flights-Search?${params}`;
}

// ─── Hotels ───────────────────────────────────────────────────────────────────

export function bookingComUrl(destination: string, checkin: string, checkout: string, adults: number, hotelName?: string) {
  const params = new URLSearchParams({
    ss: hotelName ? `${hotelName}, ${destination}` : destination,
    checkin: fmt(checkin),
    checkout: fmt(checkout),
    group_adults: String(adults),
    no_rooms: "1",
  });
  return `https://www.booking.com/search.html?${params}`;
}

export function airbnbHotelsUrl(destination: string, checkin: string, checkout: string, adults: number, hotelName?: string) {
  const loc = slug(hotelName ? `${hotelName}, ${destination}` : destination);
  return `https://www.airbnb.com/s/${loc}/homes?checkin=${fmt(checkin)}&checkout=${fmt(checkout)}&adults=${adults}`;
}

export function hotelsComUrl(destination: string, checkin: string, checkout: string, adults: number, hotelName?: string) {
  const params = new URLSearchParams({
    destination: hotelName ? `${hotelName}, ${destination}` : destination,
    startDate: fmt(checkin),
    endDate: fmt(checkout),
    adults: String(adults),
  });
  return `https://www.hotels.com/search?${params}`;
}

export function expediaHotelsUrl(destination: string, checkin: string, checkout: string, adults: number, hotelName?: string) {
  const params = new URLSearchParams({
    destination: hotelName ? `${hotelName}, ${destination}` : destination,
    "startDate": fmt(checkin),
    "endDate": fmt(checkout),
    adults: String(adults),
  });
  return `https://www.expedia.com/Hotel-Search?${params}`;
}

// ─── Restaurants / Cafes ──────────────────────────────────────────────────────

export function yelpRestaurantsUrl(destination: string, category = "restaurants") {
  return `https://www.yelp.com/search?find_desc=${encodeURIComponent(category)}&find_loc=${slug(destination)}`;
}

export function tripadvisorRestaurantsUrl(destination: string, restaurantName?: string) {
  return `https://www.tripadvisor.com/Search?q=${slug(`${restaurantName ? restaurantName + " " : ""}restaurants in ${destination}`)}`;
}

export function openTableUrl(destination: string, date: string, covers: number, restaurantName?: string) {
  const params = new URLSearchParams({
    covers: String(covers),
    dateTime: `${fmt(date)} 19:00`,
    term: restaurantName ? `${restaurantName}, ${destination}` : destination,
  });
  return `https://www.opentable.com/s?${params}`;
}

export function googleMapsRestaurantsUrl(destination: string, query = "restaurants") {
  return `https://www.google.com/maps/search/${encodeURIComponent(query + " in " + destination)}`;
}

// ─── Experiences / Activities ─────────────────────────────────────────────────

export function viatorUrl(destination: string, startDate: string, experienceName?: string) {
  return `https://www.viator.com/searchResults/all?text=${slug(`${experienceName ? experienceName + " in " : ""}${destination}`)}&startDate=${fmt(startDate)}`;
}

export function getYourGuideUrl(destination: string, startDate: string, endDate: string, travelers: number, experienceName?: string) {
  const params = new URLSearchParams({
    q: experienceName ? `${experienceName} in ${destination}` : destination,
    date_from: fmt(startDate),
    date_to: fmt(endDate),
    number_of_travelers: String(travelers),
  });
  return `https://www.getyourguide.com/s/?${params}`;
}

export function airbnbExperiencesUrl(destination: string, checkin: string, checkout: string, experienceName?: string) {
  const loc = slug(destination);
  return `https://www.airbnb.com/experiences?location=${loc}&checkin=${fmt(checkin)}&checkout=${fmt(checkout)}`;
}

export function klookUrl(destination: string, experienceName?: string) {
  return `https://www.klook.com/en-US/search-results/?query=${slug(experienceName ? `${experienceName} ${destination}` : destination)}`;
}

// ─── Attractions ──────────────────────────────────────────────────────────────

export function tripadvisorAttractionsUrl(destination: string, attractionName?: string) {
  return `https://www.tripadvisor.com/Search?q=${slug(`${attractionName ? attractionName + " " : ""}attractions in ${destination}`)}`;
}

export function googleMapsAttractionsUrl(destination: string, attractionName?: string) {
  return `https://www.google.com/maps/search/${encodeURIComponent(`${attractionName ? attractionName + " in " : "tourist attractions in "}${destination}`)}`;
}

export function lonelyPlanetUrl(destination: string, attractionName?: string) {
  return `https://www.lonelyplanet.com/search?q=${slug(attractionName ? `${attractionName} ${destination}` : destination)}`;
}

// ─── Activity-level quick links ───────────────────────────────────────────────

export function googleMapsSearchUrl(query: string, location: string) {
  return `https://www.google.com/maps/search/${encodeURIComponent(query + " " + location)}`;
}

export function yelpSearchUrl(query: string, location: string) {
  return `https://www.yelp.com/search?find_desc=${encodeURIComponent(query)}&find_loc=${slug(location)}`;
}

export function viatorActivityUrl(activity: string, destination: string) {
  return `https://www.viator.com/searchResults/all?text=${slug(activity + " " + destination)}`;
}
