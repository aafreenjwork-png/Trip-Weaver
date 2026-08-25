import type { Trip } from "@workspace/db";

interface Activity {
  time: string;
  title: string;
  description: string;
  type: "attraction" | "restaurant" | "hotel" | "transport" | "activity" | "shopping";
  estimatedCost: number;
  duration: string;
  address: string | null;
  tips: string | null;
  imageUrl: string | null;
}

// Curated Unsplash photo IDs by activity category
const ACTIVITY_IMAGES = {
  hotel: "photo-1631049307264-da0ec9d70304",        // hotel room
  restaurant: "photo-1414235077428-338989a2e8c0",    // restaurant/dinner
  breakfast: "photo-1533089860892-a7c6f0a88566",     // breakfast
  lunch: "photo-1568901346375-23c9450c58cd",         // lunch/food
  attraction: "photo-1488085061387-422e29b40080",    // generic sightseeing
  transport: "photo-1436491865332-7a61a109cc05",     // airplane window
  activity: "photo-1551918120-9739cb430c6d",         // outdoor activity
  shopping: "photo-1441986300917-64674bd600d8",      // shopping
};

function activityImage(type: Activity["type"], title?: string): string {
  const t = title?.toLowerCase() ?? "";
  const base = "https://images.unsplash.com";
  const q = "?w=800&q=75&fit=crop";
  if (type === "hotel") return `${base}/${ACTIVITY_IMAGES.hotel}${q}`;
  if (type === "transport") return `${base}/${ACTIVITY_IMAGES.transport}${q}`;
  if (type === "shopping") return `${base}/${ACTIVITY_IMAGES.shopping}${q}`;
  if (type === "activity") return `${base}/${ACTIVITY_IMAGES.activity}${q}`;
  if (type === "restaurant") {
    if (t.includes("breakfast") || t.includes("morning")) return `${base}/${ACTIVITY_IMAGES.breakfast}${q}`;
    if (t.includes("lunch") || t.includes("midday")) return `${base}/${ACTIVITY_IMAGES.lunch}${q}`;
    return `${base}/${ACTIVITY_IMAGES.restaurant}${q}`;
  }
  return `${base}/${ACTIVITY_IMAGES.attraction}${q}`;
}

interface DaySchedule {
  day: number;
  date: string;
  activities: Activity[];
  estimatedCost: number;
  notes: string | null;
}

interface HotelRecommendation {
  name: string;
  description: string;
  priceRange: string;
  rating: number;
  highlights: string[];
  address: string | null;
}

interface RestaurantRecommendation {
  name: string;
  cuisine: string;
  description: string;
  priceRange: string;
  mustTry: string[];
  address: string | null;
}

interface AlternativeOption {
  title: string;
  description: string;
  reason: string;
}

interface SuggestedExperience {
  title: string;
  description: string;
  category: string;
  estimatedCost: number;
  duration: string;
  imageUrl: string;
  tips: string | null;
}

interface ItineraryData {
  days: DaySchedule[];
  totalEstimatedCost: number;
  hotels: HotelRecommendation[];
  restaurants: RestaurantRecommendation[];
  packingSuggestions: string[];
  transportationPlan: string;
  alternativeOptions: AlternativeOption[];
  suggestedExperiences: SuggestedExperience[];
}

const DESTINATION_DATA: Record<string, {
  attractions: string[];
  restaurants: { name: string; cuisine: string; dish: string }[];
  hotels: { name: string; description: string; tier: string }[];
  transport: string;
  packing: string[];
  activities: { name: string; description: string; type: "activity" | "shopping" }[];
}> = {
  "Paris": {
    attractions: ["Eiffel Tower", "The Louvre", "Notre-Dame Cathedral", "Musée d'Orsay", "Versailles Palace", "Sainte-Chapelle", "Centre Pompidou", "Père Lachaise Cemetery"],
    restaurants: [
      { name: "Café de Flore", cuisine: "French Bistro", dish: "Croque-monsieur & café au lait" },
      { name: "Le Comptoir du Relais", cuisine: "Modern French", dish: "Seasonal prix-fixe menu" },
      { name: "L'As du Fallafel", cuisine: "Middle Eastern", dish: "Falafel sandwich" },
      { name: "Septime", cuisine: "Contemporary French", dish: "Tasting menu" },
      { name: "Brasserie Lipp", cuisine: "Traditional Brasserie", dish: "Choucroute garnie" },
    ],
    hotels: [
      { name: "Hôtel Plaza Athénée", description: "Iconic luxury hotel on Avenue Montaigne with Eiffel Tower views", tier: "luxury" },
      { name: "Hôtel du Petit Moulin", description: "Boutique hotel in Le Marais designed by Christian Lacroix", tier: "moderate" },
      { name: "Generator Paris", description: "Stylish hostel near Canal Saint-Martin with vibrant social scene", tier: "budget" },
    ],
    transport: "Paris is best explored via the excellent Métro system (€1.90/ticket or €16.90 for a carnet of 10). The RER connects to Versailles and CDG airport. Walking is ideal in central arrondissements, and Vélib' bike-share is great for riverside cycling. Taxis and Uber are readily available but expensive during peak hours.",
    packing: ["Comfortable walking shoes", "Light layers for variable weather", "Universal power adapter (Type E)", "Metro carnet for cost savings", "Pocket French phrasebook", "Compact umbrella", "Small day backpack", "Reusable shopping bag for markets"],
    activities: [
      { name: "Seine River Cruise", description: "Bateaux Mouches cruise past illuminated monuments at dusk", type: "activity" },
      { name: "Montmartre Art Walk", description: "Wander the cobblestone streets of the artist's quarter to Sacré-Cœur", type: "activity" },
      { name: "Galeries Lafayette", description: "Iconic department store with stunning Art Nouveau dome and rooftop views", type: "shopping" },
    ],
  },
  "Tokyo": {
    attractions: ["Senso-ji Temple", "Shibuya Crossing", "Meiji Shrine", "Tokyo Skytree", "Shinjuku Gyoen", "teamLab Borderless", "Akihabara Electric Town", "Tsukiji Outer Market"],
    restaurants: [
      { name: "Sushi Saito", cuisine: "Omakase Sushi", dish: "Chef's selection omakase" },
      { name: "Ichiran Ramen", cuisine: "Japanese Ramen", dish: "Tonkotsu ramen" },
      { name: "Gonpachi Nishi-Azabu", cuisine: "Izakaya", dish: "Yakitori skewers" },
      { name: "Tsuta Ramen", cuisine: "Modern Ramen", dish: "Truffle soy ramen" },
      { name: "Uobei Shibuya", cuisine: "Conveyor Belt Sushi", dish: "Fresh nigiri selection" },
    ],
    hotels: [
      { name: "Aman Tokyo", description: "Ultra-luxury urban sanctuary with panoramic city views and Japanese zen design", tier: "luxury" },
      { name: "The b Akasaka", description: "Sleek boutique hotel perfectly positioned between Roppongi and Ginza", tier: "moderate" },
      { name: "Nui. Hostel & Bar Lounge", description: "Trendy Asakusa hostel with a lively rooftop bar and craft beers", tier: "budget" },
    ],
    transport: "Tokyo's rail network is the world's most efficient. Get a Suica or Pasmo IC card (¥500 deposit) for seamless travel on metro, JR lines, and even convenience stores. The 24/48/72-hour metro passes offer unlimited rides. Taxis are expensive but spotless. Walking is best in neighborhoods like Harajuku and Yanaka.",
    packing: ["Comfortable walking shoes", "Cash in yen (many places cash-only)", "Portable Wi-Fi or SIM card", "Suica card for transit", "Light layers (humidity varies)", "Handkerchief (no paper towels in bathrooms)", "Small day bag", "Power bank for navigation"],
    activities: [
      { name: "teamLab Planets Digital Art Museum", description: "Immersive borderless digital art experience in Toyosu", type: "activity" },
      { name: "Harajuku Takeshita Street", description: "Tokyo's most vibrant youth fashion street with crepe shops and quirky boutiques", type: "shopping" },
      { name: "Sumo Morning Practice", description: "Watch sumo wrestlers train at a Tokyo stable — a rare cultural privilege", type: "activity" },
    ],
  },
  "New York": {
    attractions: ["Central Park", "Metropolitan Museum of Art", "Times Square", "Brooklyn Bridge", "Statue of Liberty", "High Line", "The MoMA", "One World Observatory"],
    restaurants: [
      { name: "Katz's Delicatessen", cuisine: "Jewish Deli", dish: "Pastrami on rye" },
      { name: "Peter Luger Steak House", cuisine: "American Steakhouse", dish: "Porterhouse steak" },
      { name: "Carbone", cuisine: "Italian-American", dish: "Rigatoni vodka" },
      { name: "Di Fara Pizza", cuisine: "New York Pizza", dish: "Classic slice" },
      { name: "Le Bernardin", cuisine: "French Seafood", dish: "Tasting menu" },
    ],
    hotels: [
      { name: "The Mark Hotel", description: "Upper East Side landmark with Jean-Georges restaurant and steps from the Met", tier: "luxury" },
      { name: "The Williamsburg Hotel", description: "Industrial-chic Brooklyn hotel with rooftop pool and Manhattan views", tier: "moderate" },
      { name: "HI NYC Hostel", description: "Historic Upper West Side mansion offering great value and community events", tier: "budget" },
    ],
    transport: "The NYC Subway runs 24/7 and is the fastest way to get around ($2.90/ride). Get an OMNY card for tap-to-pay convenience. Walking is essential in Manhattan. The PATH train connects to Jersey City/Newark. Yellow cabs and Ubers are plentiful. The free Staten Island Ferry offers stunning Statue of Liberty views.",
    packing: ["Comfortable walking shoes (you'll walk 10+ miles/day)", "Layers for unpredictable weather", "MetroCard or credit card for OMNY", "Portable charger", "Small day bag", "Sunscreen", "Light rain jacket", "Earplugs (it's a loud city)"],
    activities: [
      { name: "Brooklyn Flea Market", description: "Weekend market in DUMBO with vintage treasures, artisan food, and skyline views", type: "shopping" },
      { name: "Broadway Show", description: "Catch a world-class musical or play in the Theater District", type: "activity" },
      { name: "Chelsea Market", description: "Iconic food hall in a converted factory with global cuisine vendors", type: "activity" },
    ],
  },
  "Bali": {
    attractions: ["Tanah Lot Temple", "Ubud Sacred Monkey Forest", "Tegalalang Rice Terrace", "Uluwatu Temple", "Tirta Empul Holy Springs", "Mount Batur Volcano", "Seminyak Beach", "Nusa Penida Island"],
    restaurants: [
      { name: "Locavore", cuisine: "Modern Indonesian", dish: "Chef's tasting menu with local ingredients" },
      { name: "Merah Putih", cuisine: "Contemporary Balinese", dish: "Balinese duck confit" },
      { name: "Warung Babi Guling Ibu Oka", cuisine: "Traditional Balinese", dish: "Babi guling (suckling pig)" },
      { name: "Swept Away at COMO Shambhala", cuisine: "Health-conscious", dish: "Nasi goreng with organic eggs" },
      { name: "Sarong Restaurant", cuisine: "Asian Fusion", dish: "Sambal tiger prawns" },
    ],
    hotels: [
      { name: "COMO Shambhala Estate", description: "Legendary wellness retreat in the Ubud jungle with holistic spa and yoga", tier: "luxury" },
      { name: "Alaya Resort Ubud", description: "Intimate resort with infinity pool overlooking rice paddies", tier: "moderate" },
      { name: "Puri Garden Hotel", description: "Charming family-run guesthouse in central Ubud with breakfast included", tier: "budget" },
    ],
    transport: "Bali has no public transit, so transportation is key. Grab (ride-hailing app) is cheap and reliable for short trips. Rent a scooter ($5-8/day) for flexibility if you're confident riding. Hire a private driver ($35-50/day) for day trips — the most comfortable option. Metered taxis exist but negotiate beforehand.",
    packing: ["Lightweight, breathable clothing", "Sarong (required for temple visits)", "Strong sunscreen (SPF 50+)", "Reef-safe sunscreen", "Mosquito repellent", "Flip-flops and walking sandals", "Stomach tablets (Bali belly is real)", "Waterproof bag for boat trips"],
    activities: [
      { name: "Sunrise Hike on Mount Batur", description: "Trek an active volcano to watch sunrise over the caldera with a guide", type: "activity" },
      { name: "Traditional Cooking Class", description: "Learn to make Balinese spice pastes and classic dishes in Ubud", type: "activity" },
      { name: "Seminyak Boutique Shopping", description: "Bali's most stylish shopping strip with local designers and boho boutiques", type: "shopping" },
    ],
  },
};

function getDestinationData(destination: string) {
  const key = Object.keys(DESTINATION_DATA).find(k =>
    destination.toLowerCase().includes(k.toLowerCase())
  );
  if (key) return DESTINATION_DATA[key];

  const normalized = destination.toLowerCase();
  if (normalized.includes("bhutan") || normalized.includes("thimphu") || normalized.includes("paro")) {
    return {
      attractions: [
        "Tiger’s Nest Monastery (Paro Taktsang)",
        "Punakha Dzong",
        "Buddha Dordenma Statue",
        "Dochula Pass",
        "Phobjikha Valley & Gangtey Nature Trail",
        "National Memorial Chorten",
        "Kyichu Lhakhang",
        "Motithang Takin Preserve",
      ],
      restaurants: [
        { name: "Folk Heritage Restaurant", cuisine: "Bhutanese", dish: "Ema datshi with red rice" },
        { name: "Ambient Café", cuisine: "Bhutanese & Continental", dish: "Momos and butter tea" },
        { name: "Sonam Trophel Restaurant", cuisine: "Traditional Bhutanese", dish: "Phaksha paa with seasonal greens" },
        { name: "Bukhari at COMO Uma Paro", cuisine: "Himalayan", dish: "Slow-cooked local dishes" },
        { name: "Lhayul Restaurant", cuisine: "Bhutanese", dish: "Jasha maru with buckwheat pancakes" },
      ],
      hotels: [
        { name: "COMO Uma Paro", description: "Quiet hillside retreat in the Paro Valley with Himalayan views and a restorative spa", tier: "luxury" },
        { name: "Le Méridien Thimphu", description: "Comfortable city stay near the river, markets, and Thimphu’s cultural landmarks", tier: "moderate" },
        { name: "Hotel Norbuling", description: "Friendly central guesthouse with practical rooms and easy access to Thimphu’s sights", tier: "budget" },
      ],
      transport: "Bhutan is best explored with a licensed local guide and arranged vehicle. Roads are scenic but winding, so allow extra time between Paro, Thimphu, Punakha, and Phobjikha. Paro Airport is the main international gateway; flights are limited and should be booked early. Walking works well inside Thimphu and Paro town centers.",
      packing: [
        "Layers and a warm fleece for mountain evenings",
        "Comfortable shoes with good grip",
        "Modest clothing covering shoulders and knees for monasteries",
        "Sunscreen and sunglasses for high-altitude sun",
        "Reusable water bottle",
        "Small daypack for monastery and valley walks",
        "Motion-sickness medication for winding roads",
        "Passport, visa documents, and travel insurance",
      ],
      activities: [
        { name: "Bhutanese Archery Demonstration", description: "Watch Bhutan’s national sport and learn why archery is central to village celebrations and local culture", type: "activity" as const },
        { name: "Traditional Hot-Stone Bath", description: "Unwind in a mineral-rich hot-stone bath, a restorative Bhutanese wellness tradition", type: "activity" as const },
        { name: "Thimphu Weekend Market", description: "Browse local produce, textiles, incense, and handmade crafts along the Wang Chhu river", type: "shopping" as const },
      ],
    };
  }

  // Generic fallback
  return {
    attractions: [
      `${destination} City Center`, `${destination} National Museum`, `${destination} Old Town`,
      `${destination} Botanical Gardens`, `${destination} Cultural Quarter`, `${destination} Harbor`,
      `${destination} Art District`, `${destination} Historic Cathedral`,
    ],
    restaurants: [
      { name: "The Local Table", cuisine: "Regional Cuisine", dish: "Chef's seasonal tasting menu" },
      { name: "Grand Brasserie", cuisine: "Continental", dish: "Signature slow-cooked dish" },
      { name: "Street Food Market", cuisine: "Local Street Food", dish: "Assorted local specialties" },
      { name: "Riverside Kitchen", cuisine: "Modern Fusion", dish: "Catch of the day" },
      { name: "Heritage Café", cuisine: "Traditional", dish: "Classic regional breakfast" },
    ],
    hotels: [
      { name: `Grand ${destination} Hotel`, description: "5-star landmark hotel in the heart of the city with panoramic views", tier: "luxury" },
      { name: `${destination} Boutique Inn`, description: "Charming mid-range hotel in a restored historic building near top attractions", tier: "moderate" },
      { name: `${destination} Hostel`, description: "Social budget accommodation with free walking tours and common areas", tier: "budget" },
    ],
    transport: `Getting around ${destination} is straightforward. The public transit system (metro/bus) is efficient and affordable at roughly $1-3 per trip. Taxis and rideshare apps operate city-wide. The city center is very walkable, and bike rentals are available at most hotels. Consider a multi-day transit pass for better value.`,
    packing: ["Comfortable walking shoes", "Layers for variable weather", "Portable charger", "Universal adapter", "Small day backpack", "Reusable water bottle", "Basic first-aid kit", "Local currency (some vendors cash-only)"],
    activities: [
      { name: "Guided City Walking Tour", description: "Explore hidden gems and local history with an expert local guide", type: "activity" as const },
      { name: "Local Market Experience", description: "Browse the vibrant local market for fresh produce, crafts, and souvenirs", type: "shopping" as const },
      { name: "Sunset Viewpoint Visit", description: "Watch the golden hour from the city's best vantage point", type: "activity" as const },
    ],
  };
}

function getCostMultiplier(budget: string): number {
  switch (budget) {
    case "luxury": return 2.2;
    case "moderate": return 1.0;
    default: return 0.38; // budget: ~$40 hotel, $10-15 meals, $8 attractions
  }
}

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: "$", EUR: "€", GBP: "£", JPY: "¥", AUD: "A$", CAD: "C$",
    CHF: "CHF ", SGD: "S$", HKD: "HK$", INR: "₹", BRL: "R$",
    MXN: "MX$", AED: "AED ", THB: "฿", IDR: "Rp ", KRW: "₩",
    NZD: "NZ$", ZAR: "R", MYR: "RM ", PHP: "₱",
  };
  return symbols[currency] ?? `${currency} `;
}

// Approximate exchange rates vs USD (updated periodically)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0, EUR: 0.92, GBP: 0.79, JPY: 149.5, AUD: 1.53,
  CAD: 1.36, CHF: 0.90, SGD: 1.34, HKD: 7.82, INR: 83.5,
  BRL: 4.97, MXN: 17.15, AED: 3.67, THB: 35.1, IDR: 15750,
  KRW: 1325, NZD: 1.63, ZAR: 18.65, MYR: 4.72, PHP: 56.4,
};

function getExchangeRate(currency: string): number {
  return EXCHANGE_RATES[currency] ?? 1.0;
}

function convertCost(usdAmount: number, rate: number): number {
  const converted = usdAmount * rate;
  // Round to sensible precision — no decimals for high-value currencies
  if (rate >= 100) return Math.round(converted / 100) * 100;
  if (rate >= 10) return Math.round(converted / 10) * 10;
  return Math.round(converted);
}

function starsToTier(hotelStars: number): string {
  if (hotelStars <= 2) return "budget";
  if (hotelStars === 3) return "moderate";
  return "luxury";
}

function getTravelStyleActivities(style: string, interests: string[]): string[] {
  const baseActivities: Record<string, string[]> = {
    adventure: ["Rock climbing session", "White-water rafting", "Zip-line canopy tour", "Mountain biking trail", "Paragliding experience"],
    cultural: ["Museum deep-dive tour", "Traditional craft workshop", "Local cooking class", "Historical walking tour", "Cultural performance evening"],
    relaxation: ["Spa & wellness morning", "Sunset yoga session", "Leisurely café morning", "Garden & park stroll", "Wine tasting experience"],
    business: ["Co-working space visit", "Networking event", "Business district tour", "Fine dining client dinner", "Airport lounge access"],
    family: ["Interactive science museum", "Theme park visit", "Family cooking class", "Bicycle tour for all ages", "Wildlife sanctuary"],
    romantic: ["Couples sunset cruise", "Private chef dinner", "Champagne tasting", "Candlelit spa treatment", "Hot air balloon ride"],
  };
  return baseActivities[style] ?? baseActivities.cultural;
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(diff, 14)); // cap at 14 days
}

export function generateItineraryData(trip: Trip): ItineraryData {
  const destData = getDestinationData(trip.destination);
  const costMult = getCostMultiplier(trip.budget);
  const numDays = getDaysBetween(trip.startDate, trip.endDate);
  const styleActivities = getTravelStyleActivities(trip.travelStyle, trip.interests as string[]);
  const currency = trip.currency ?? "USD";
  const fxRate = getExchangeRate(currency);
  const sym = getCurrencySymbol(currency);

  const days: DaySchedule[] = [];
  let totalCost = 0;

  for (let i = 0; i < numDays; i++) {
    const dayDate = addDays(trip.startDate, i);
    const isFirstDay = i === 0;
    const isLastDay = i === numDays - 1;
    const attractionIndex = i % destData.attractions.length;
    const attraction2Index = (i + 1) % destData.attractions.length;

    const activities: Activity[] = [];

    if (isFirstDay) {
      // Flight from origin if specified
      const originCity = (trip as Trip & { travelingFrom?: string | null }).travelingFrom;
      if (originCity) {
        const flightCostUSD = trip.budget === "luxury" ? 1100 : trip.budget === "moderate" ? 520 : 210;
        activities.push({
          time: "06:00",
          title: `Flight: ${originCity} → ${trip.destination}`,
          description: `Depart from ${originCity} to ${trip.destination}. Check in at least 2 hours before for domestic or 3 hours for international flights. Use this time to settle in, charge devices, and plan your first day.`,
          type: "transport",
          estimatedCost: Math.round(flightCostUSD * costMult * trip.groupSize),
          duration: "Varies by route",
          address: `${originCity} International Airport`,
          tips: `Book return flights from ${trip.destination} in advance. Set price alerts on Google Flights for the best fares.`,
          imageUrl: activityImage("transport", "flight"),
        });
      }

      activities.push({
        time: "14:00",
        title: "Hotel Check-In & Orientation",
        description: `Arrive and settle into your accommodation. Take a leisurely stroll around the neighborhood to get your bearings and find a good local café.`,
        type: "hotel",
        estimatedCost: Math.round(150 * costMult),
        duration: "2 hours",
        address: null,
        tips: "Ask the hotel concierge for neighborhood tips and any current local events.",
        imageUrl: activityImage("hotel"),
      });
      activities.push({
        time: "16:30",
        title: destData.attractions[attractionIndex],
        description: `Begin your ${trip.destination} adventure with a visit to ${destData.attractions[attractionIndex]}. Take your time to soak in the atmosphere — don't rush this first encounter.`,
        type: "attraction",
        estimatedCost: Math.round(25 * costMult),
        duration: "2.5 hours",
        address: `Near city center, ${trip.destination}`,
        tips: "Visit just before closing to avoid crowds, and book tickets in advance during peak season.",
        imageUrl: activityImage("attraction"),
      });
      activities.push({
        time: "19:30",
        title: `Welcome Dinner at ${destData.restaurants[0].name}`,
        description: `Kick off your trip at ${destData.restaurants[0].name}, a local institution known for ${destData.restaurants[0].cuisine}. Order the famous ${destData.restaurants[0].dish}.`,
        type: "restaurant",
        estimatedCost: Math.round(45 * costMult * trip.groupSize),
        duration: "2 hours",
        address: null,
        tips: "Make a reservation — this place fills up fast in the evenings.",
        imageUrl: activityImage("restaurant", "dinner"),
      });
    } else if (isLastDay) {
      activities.push({
        time: "08:00",
        title: "Final Morning in the City",
        description: `Use your last morning to revisit a favourite spot or explore a neighbourhood you missed. Pack thoughtfully and keep your luggage at the hotel if needed.`,
        type: "activity",
        estimatedCost: Math.round(20 * costMult),
        duration: "2 hours",
        address: null,
        tips: "Most hotels allow late checkout or luggage storage — ask ahead.",
        imageUrl: activityImage("activity"),
      });
      activities.push({
        time: "10:30",
        title: "Last-Minute Shopping",
        description: `Pick up final souvenirs, local snacks for the journey home, or any items you spotted throughout the trip.`,
        type: "shopping",
        estimatedCost: Math.round(60 * costMult),
        duration: "1.5 hours",
        address: null,
        tips: "Airport prices are 30-50% higher — buy souvenirs in local markets instead.",
        imageUrl: activityImage("shopping"),
      });
      activities.push({
        time: "12:30",
        title: "Farewell Lunch",
        description: `One final taste of ${trip.destination} before heading home. Choose a local spot you haven't tried yet or revisit a favourite.`,
        type: "restaurant",
        estimatedCost: Math.round(35 * costMult * trip.groupSize),
        duration: "1.5 hours",
        address: null,
        tips: "Keep airport transfer time in mind — allow at least 3 hours before international flights.",
        imageUrl: activityImage("restaurant", "lunch"),
      });
      activities.push({
        time: "15:00",
        title: "Return Flight / Departure Transfer",
        description: `Transfer to the airport for your return journey home. Allow extra time for check-in and security. Safe travels!`,
        type: "transport",
        estimatedCost: Math.round(30 * costMult),
        duration: "1 hour",
        address: null,
        tips: null,
        imageUrl: activityImage("transport"),
      });
    } else {
      activities.push({
        time: "08:00",
        title: "Breakfast at a Local Café",
        description: `Start the day right at a neighbourhood café — a leisurely breakfast is a cultural experience in itself. Ask a local for their favourite spot.`,
        type: "restaurant",
        estimatedCost: Math.round(18 * costMult * trip.groupSize),
        duration: "1 hour",
        address: null,
        tips: "Locals eat breakfast early. Arrive before 9am to get a table without waiting.",
        imageUrl: activityImage("restaurant", "breakfast"),
      });
      activities.push({
        time: "09:30",
        title: destData.attractions[attractionIndex],
        description: `Spend the morning at ${destData.attractions[attractionIndex]} — one of ${trip.destination}'s most iconic spots. Go slowly; the details reward patience.`,
        type: "attraction",
        estimatedCost: Math.round(20 * costMult),
        duration: "2.5 hours",
        address: `${trip.destination} city center`,
        tips: "Early morning is the best time — fewer crowds and better light for photos.",
        imageUrl: activityImage("attraction"),
      });

      if (styleActivities[i % styleActivities.length]) {
        activities.push({
          time: "12:30",
          title: styleActivities[i % styleActivities.length],
          description: `A curated ${trip.travelStyle}-focused experience tailored to your travel style. This is a highlight activity designed around your preferences.`,
          type: "activity",
          estimatedCost: Math.round(55 * costMult),
          duration: "2 hours",
          address: null,
          tips: "Book in advance as availability is limited for this popular experience.",
          imageUrl: activityImage("activity"),
        });
      }

      activities.push({
        time: "14:30",
        title: `Lunch at ${destData.restaurants[i % destData.restaurants.length]?.name ?? "Local Restaurant"}`,
        description: `A midday stop at ${destData.restaurants[i % destData.restaurants.length]?.name ?? "a local favourite"} for authentic ${destData.restaurants[i % destData.restaurants.length]?.cuisine ?? "regional"} cuisine. Try the ${destData.restaurants[i % destData.restaurants.length]?.dish ?? "local specialty"}.`,
        type: "restaurant",
        estimatedCost: Math.round(30 * costMult * trip.groupSize),
        duration: "1 hour",
        address: null,
        tips: null,
        imageUrl: activityImage("restaurant", "lunch"),
      });

      activities.push({
        time: "16:00",
        title: destData.attractions[attraction2Index],
        description: `Afternoon visit to ${destData.attractions[attraction2Index]}. A more relaxed pace for the second half of the day — perfect for photos and reflection.`,
        type: "attraction",
        estimatedCost: Math.round(15 * costMult),
        duration: "2 hours",
        address: null,
        tips: null,
        imageUrl: activityImage("attraction"),
      });

      if (destData.activities[i % destData.activities.length]) {
        const act = destData.activities[i % destData.activities.length];
        activities.push({
          time: "18:30",
          title: act.name,
          description: act.description,
          type: act.type,
          estimatedCost: Math.round(40 * costMult),
          duration: "1.5 hours",
          address: null,
          tips: null,
          imageUrl: activityImage(act.type),
        });
      }

      activities.push({
        time: "20:00",
        title: `Dinner at ${destData.restaurants[(i + 2) % destData.restaurants.length]?.name ?? "Local Favourite"}`,
        description: `End the day with a memorable dinner. ${destData.restaurants[(i + 2) % destData.restaurants.length]?.name ?? "This spot"} is known for ${destData.restaurants[(i + 2) % destData.restaurants.length]?.cuisine ?? "excellent local cooking"}.`,
        type: "restaurant",
        estimatedCost: Math.round(50 * costMult * trip.groupSize),
        duration: "2 hours",
        address: null,
        tips: "Evening reservations fill up by 3pm — call ahead or book online.",
        imageUrl: activityImage("restaurant", "dinner"),
      });
    }

    const dayCost = activities.reduce((sum, a) => sum + a.estimatedCost, 0);
    totalCost += dayCost;

    days.push({
      day: i + 1,
      date: dayDate,
      activities,
      estimatedCost: dayCost,
      notes: i === 0 ? "Welcome day — pace yourself and rest if jetlagged." : null,
    });
  }

  // Apply currency conversion to all activity costs
  for (const day of days) {
    for (const act of day.activities) {
      act.estimatedCost = convertCost(act.estimatedCost, fxRate);
    }
    day.estimatedCost = day.activities.reduce((s, a) => s + a.estimatedCost, 0);
  }
  totalCost = days.reduce((s, d) => s + d.estimatedCost, 0);

  // Hotels
  const hotelsByTier = destData.hotels;
  const hotelStars = trip.hotelStars ?? 3;
  const primaryHotelTier = starsToTier(hotelStars);
  const primaryHotel = hotelsByTier.find(h => h.tier === primaryHotelTier) ?? hotelsByTier[0];
  const altHotel = hotelsByTier.find(h => h.tier !== primaryHotelTier && h.tier !== "budget") ?? hotelsByTier[1];

  const priceRangeByTier: Record<string, string> = {
    luxury: `${sym}${convertCost(450, fxRate).toLocaleString()}–${convertCost(800, fxRate).toLocaleString()}/night`,
    moderate: `${sym}${convertCost(150, fxRate).toLocaleString()}–${convertCost(280, fxRate).toLocaleString()}/night`,
    budget: `${sym}${convertCost(35, fxRate).toLocaleString()}–${convertCost(90, fxRate).toLocaleString()}/night`,
  };

  const starLabel = "★".repeat(hotelStars) + "☆".repeat(5 - hotelStars);
  const tierHighlight = primaryHotelTier === "luxury"
    ? "Rooftop pool, spa & fine dining"
    : primaryHotelTier === "moderate"
    ? "Complimentary breakfast & fitness center"
    : "Social common areas & free city maps";

  const hotels: HotelRecommendation[] = [
    {
      name: primaryHotel.name,
      description: primaryHotel.description,
      priceRange: priceRangeByTier[primaryHotel.tier] ?? `${sym}100–200/night`,
      rating: primaryHotelTier === "luxury" ? 4.9 : primaryHotelTier === "moderate" ? 4.4 : 4.1,
      highlights: [
        `${starLabel} — ${hotelStars}-star accommodation`,
        "Prime location near major attractions",
        "Excellent guest reviews",
        tierHighlight,
        "Flexible check-in times",
      ],
      address: `Central ${trip.destination}`,
    },
  ];

  if (altHotel && altHotel.name !== primaryHotel.name) {
    hotels.push({
      name: altHotel.name,
      description: altHotel.description,
      priceRange: priceRangeByTier[altHotel.tier] ?? `${sym}120–250/night`,
      rating: altHotel.tier === "luxury" ? 4.8 : 4.3,
      highlights: ["Alternative option with excellent value", "Popular with returning visitors"],
      address: null,
    });
  }

  // Restaurants
  const restaurants: RestaurantRecommendation[] = destData.restaurants.slice(0, 4).map(r => ({
    name: r.name,
    cuisine: r.cuisine,
    description: `One of ${trip.destination}'s most celebrated dining spots, known for exceptional ${r.cuisine.toLowerCase()} cuisine and warm hospitality.`,
    priceRange: trip.budget === "luxury" ? "$$$-$$$$" : trip.budget === "moderate" ? "$$-$$$" : "$-$$",
    mustTry: [r.dish, "Seasonal specialty of the day"],
    address: null,
  }));

  // Transportation plan — incorporate travelingFrom if provided
  const travelingFrom = (trip as Trip & { travelingFrom?: string | null }).travelingFrom;
  if (travelingFrom) {
    const flightNote = `\n\nDeparting from ${travelingFrom}: Check direct or one-stop flights to ${trip.destination}. Allow 2–3 hours at departure airport for international travel and book at least 3–4 weeks in advance for best fares in your ${currency}.`;
    destData.transport = destData.transport + flightNote;
  }

  // Packing suggestions
  const universalPacking = ["Travel insurance documents", "Passport & visa (if required)", "Digital copies of all documents", "Credit cards with no foreign transaction fees"];
  const packingSuggestions = [...universalPacking, ...destData.packing];

  if (trip.groupSize > 2) {
    packingSuggestions.push("Shared portable charger for the group");
  }
  if ((trip.interests as string[]).includes("food")) {
    packingSuggestions.push("Digestive tablets for adventurous eating");
  }
  if ((trip.interests as string[]).includes("nature")) {
    packingSuggestions.push("Lightweight hiking shoes", "Reusable water bottle with filter");
  }

  // Suggested experiences
  const EXPERIENCE_IMAGES: Record<string, string> = {
    activity:   "photo-1551918120-9739cb430c6d",
    shopping:   "photo-1441986300917-64674bd600d8",
    cultural:   "photo-1523906834658-6e24ef2386f9",
    food:       "photo-1414235077428-338989a2e8c0",
    wellness:   "photo-1544161515-4ab6ce6db874",
    adventure:  "photo-1519681393784-d120267933ba",
    scenic:     "photo-1500534314209-a25ddb2bd429",
    nightlife:  "photo-1516450360452-9312f5e86fc7",
  };

  function experienceImage(category: string): string {
    const map: Record<string, string> = {
      "Cultural": EXPERIENCE_IMAGES.cultural,
      "Adventure": EXPERIENCE_IMAGES.adventure,
      "Food & Drink": EXPERIENCE_IMAGES.food,
      "Shopping": EXPERIENCE_IMAGES.shopping,
      "Wellness": EXPERIENCE_IMAGES.wellness,
      "Scenic": EXPERIENCE_IMAGES.scenic,
      "Nightlife": EXPERIENCE_IMAGES.nightlife,
    };
    const id = map[category] ?? EXPERIENCE_IMAGES.activity;
    return `https://images.unsplash.com/${id}?w=600&q=75&fit=crop`;
  }

  // Category mapping for travel styles
  const styleCategory: Record<string, string> = {
    adventure: "Adventure", cultural: "Cultural", relaxation: "Wellness",
    business: "Cultural", family: "Cultural", romantic: "Scenic",
  };
  const expCategory = styleCategory[trip.travelStyle] ?? "Cultural";

  const suggestedExperiences: SuggestedExperience[] = [];

  // Destination-curated activities
  for (const act of destData.activities) {
    const cat = act.type === "shopping" ? "Shopping" : expCategory;
    suggestedExperiences.push({
      title: act.name,
      description: act.description,
      category: cat,
      estimatedCost: convertCost(Math.round(act.type === "shopping" ? 60 : 45) * costMult, fxRate),
      duration: "2–3 hours",
      imageUrl: experienceImage(cat),
      tips: null,
    });
  }

  // Travel-style activities (unique ones not already in schedule)
  const usedStyleActs = new Set(styleActivities.slice(0, numDays).map(s => s));
  for (const act of styleActivities) {
    if (!usedStyleActs.has(act)) continue;
    suggestedExperiences.push({
      title: act,
      description: `A curated ${trip.travelStyle}-style experience to enhance your time in ${trip.destination}.`,
      category: expCategory,
      estimatedCost: convertCost(Math.round(55 * costMult), fxRate),
      duration: "2 hours",
      imageUrl: experienceImage(expCategory),
      tips: "Book ahead — popular experiences fill up days in advance.",
    });
  }

  // Top attractions as "must-see" experiences
  const topAttractions = destData.attractions.slice(0, 3);
  for (const att of topAttractions) {
    suggestedExperiences.push({
      title: `Visit ${att}`,
      description: `One of ${trip.destination}'s most iconic landmarks. Allow 2–3 hours to explore fully and don't miss the hidden corners most visitors skip.`,
      category: "Cultural",
      estimatedCost: convertCost(Math.round(22 * costMult), fxRate),
      duration: "2–3 hours",
      imageUrl: experienceImage("Cultural"),
      tips: "Book tickets online at least a day ahead to skip the queue.",
    });
  }

  // Food & drink experience
  suggestedExperiences.push({
    title: `${trip.destination} Food Tour`,
    description: `A guided tasting walk through the city's best markets, street stalls, and local specialties — the fastest way to understand a culture is through its food.`,
    category: "Food & Drink",
    estimatedCost: convertCost(Math.round(65 * costMult * trip.groupSize), fxRate),
    duration: "3 hours",
    imageUrl: experienceImage("Food & Drink"),
    tips: "Go hungry — you'll taste 8–12 different dishes.",
  });

  // Alternative options
  const alternativeOptions: AlternativeOption[] = [
    {
      title: `Day Trip to Surrounding Region`,
      description: `Rent a car or join a guided tour to explore the countryside, smaller villages, or coastal areas within 2 hours of ${trip.destination}.`,
      reason: "If you want to escape the crowds and see a different side of the region beyond the city.",
    },
    {
      title: `Culinary Deep-Dive Day`,
      description: `Replace one sightseeing day with an immersive food tour — market visit, cooking class, and progressive tasting dinner covering the region's signature dishes.`,
      reason: `Especially recommended if your group includes food lovers or if the weather is unfavorable for outdoor activities.`,
    },
    {
      title: trip.travelStyle === "relaxation" ? "Add an Adventure Activity" : "Slow Down with a Wellness Day",
      description: trip.travelStyle === "relaxation"
        ? `Break out of the relaxation routine with one high-energy experience — a day hike, cycling tour, or water sport — to energize the trip.`
        : `Take a day off from sightseeing for a full spa day, yoga retreat, or simply reading in a beautiful café. Travel fatigue is real.`,
      reason: "Mixing pace creates contrast and makes every experience feel more intentional.",
    },
  ];

  return {
    days,
    totalEstimatedCost: totalCost,
    hotels,
    restaurants,
    packingSuggestions,
    transportationPlan: destData.transport,
    alternativeOptions,
    suggestedExperiences,
  };
}
