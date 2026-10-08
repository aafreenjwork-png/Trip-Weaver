---
name: Airport and road-route data
description: Reliable public data sources and presentation rules for travel airport and driving-route lookups.
---

Use a curated airport dataset filtered to scheduled passenger service for arrival-airport choices; calculate approximate airport distance from coordinates, and use a separate road-routing provider for drive distance and duration.

**Why:** Broad Overpass searches over large regions timed out, while a daily-cached scheduled-airport dataset returned useful choices consistently. Straight-line airport distance and road mileage are different measures.

**How to apply:** Keep airport and road sources distinct, show clear source attribution and distance labels, and do not represent search links or route estimates as live flight schedules or prices.
