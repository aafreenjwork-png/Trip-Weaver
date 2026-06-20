const DESTINATION_IMAGES: Record<string, string> = {
  paris: "photo-1499856871958-5b9627545d1a",
  tokyo: "photo-1540959733332-eab4deabeeaf",
  bali: "photo-1537996194471-e657df975ab4",
  "new york": "photo-1538970272646-f61fabb3b9ef",
  nyc: "photo-1538970272646-f61fabb3b9ef",
  manhattan: "photo-1538970272646-f61fabb3b9ef",
  mumbai: "photo-1529253355930-ddbe423a2ac7",
  london: "photo-1513635269975-59663e0ac1ad",
  singapore: "photo-1525625293386-0f8bf6f80ac8",
  dubai: "photo-1512453979798-5ea266f8880c",
  rome: "photo-1552832230-c0197dd311b5",
  barcelona: "photo-1523531294919-4bcd7c65e216",
  kyoto: "photo-1493976040374-85c8e12f0c0e",
  osaka: "photo-1590559899731-a382839e5549",
  sydney: "photo-1506973035872-a4ec16b8e8d9",
  amsterdam: "photo-1534351590666-13e3e96b5017",
  istanbul: "photo-1524231757912-21f4fe3a7200",
  prague: "photo-1519677100203-a0e668c92439",
  bangkok: "photo-1508009603885-50cf7c579365",
  "hong kong": "photo-1517479149777-5f3b1511d5ad",
  cairo: "photo-1539650116574-75c0c73620e5",
  maldives: "photo-1512100356356-de1b84283e18",
  venice: "photo-1527838832700-5059252407fa",
  athens: "photo-1555993539-1732b0258235",
  lisbon: "photo-1588051170516-5e0ab44fe6b4",
  "rio de janeiro": "photo-1504214208698-ea1916a2195a",
  rio: "photo-1504214208698-ea1916a2195a",
  berlin: "photo-1560969184-10fe8719e047",
  vienna: "photo-1516550893923-42d28e5677af",
  zurich: "photo-1513373498801-f31e4fa498a0",
  seoul: "photo-1538485399081-7191377e8241",
  beijing: "photo-1508804185872-d7badad00f7d",
  shanghai: "photo-1538428494232-9c0d8a3ab403",
  delhi: "photo-1587474260584-136574528ed5",
  "new delhi": "photo-1587474260584-136574528ed5",
  jaipur: "photo-1599661046827-dacff0c0f09a",
  goa: "photo-1512343879784-a960bf40e7f2",
  "cape town": "photo-1580060839134-75a5edca2e99",
  marrakech: "photo-1539020140153-e479b8c22e70",
  santorini: "photo-1570077188670-e3a8d69ac5ff",
  iceland: "photo-1508193638397-1c4234db14d8",
  reykjavik: "photo-1508193638397-1c4234db14d8",
  hawaii: "photo-1542259009477-d625272157b7",
  honolulu: "photo-1542259009477-d625272157b7",
  phuket: "photo-1504214208698-ea1916a2195a",
  "kuala lumpur": "photo-1596422846543-75c6fc197f07",
  mexico: "photo-1518638150340-f706e86654de",
  "mexico city": "photo-1518306727298-4c17e1bf6942",
  florence: "photo-1541370976299-4d24ebbc9077",
  milan: "photo-1610016302534-6f67f1c968d8",
  madrid: "photo-1539037116277-4db20889f2d4",
  edinburgh: "photo-1566232392379-afd9298e6a46",
  dublin: "photo-1549918864-48ac978761a4",
  copenhagen: "photo-1513622470522-26c3c8a854bc",
  stockholm: "photo-1509356843151-3e7d96241e11",
  oslo: "photo-1531366936337-7c912a4589a7",
  toronto: "photo-1517090504586-fde19ea6066f",
  vancouver: "photo-1559511260-66a654ae982a",
  montreal: "photo-1519098901909-b1553a1190af",
};

export function getDestinationImageUrl(destination: string): string {
  const dest = destination.toLowerCase().trim();
  const key = Object.keys(DESTINATION_IMAGES).find((k) => dest.includes(k));
  if (key) {
    return `https://images.unsplash.com/${DESTINATION_IMAGES[key]}?w=1920&q=80&fit=crop`;
  }
  return `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1920&q=80&fit=crop`;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$", EUR: "€", GBP: "£", JPY: "¥", AUD: "A$", CAD: "C$",
  CHF: "CHF ", SGD: "S$", HKD: "HK$", INR: "₹", BRL: "R$",
  MXN: "MX$", AED: "AED ", THB: "฿", IDR: "Rp ", KRW: "₩",
  NZD: "NZ$", ZAR: "R", MYR: "RM ", PHP: "₱",
};

export function getCurrencySymbol(currency: string | null | undefined): string {
  return CURRENCY_SYMBOLS[currency ?? "USD"] ?? `${currency ?? "USD"} `;
}
