import { Router } from "express";
import { db, tripsTable, itinerariesTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import {
  CreateTripBody,
  UpdateTripBody,
  GetTripParams,
  UpdateTripParams,
  DeleteTripParams,
} from "@workspace/api-zod";
import { generateItineraryData } from "../lib/itinerary-generator";

const router = Router();

// GET /trips/stats — must come before /trips/:id
router.get("/trips/stats", async (req, res) => {
  try {
    const trips = await db.select().from(tripsTable);

    const totalTrips = trips.length;

    const destCounts: Record<string, number> = {};
    for (const t of trips) {
      destCounts[t.destination] = (destCounts[t.destination] ?? 0) + 1;
    }
    const topDestinations = Object.entries(destCounts)
      .map(([destination, count]) => ({ destination, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const avgGroupSize =
      totalTrips > 0
        ? trips.reduce((sum, t) => sum + t.groupSize, 0) / totalTrips
        : 0;

    const budgetBreakdown: Record<string, number> = {};
    const styleBreakdown: Record<string, number> = {};
    for (const t of trips) {
      budgetBreakdown[t.budget] = (budgetBreakdown[t.budget] ?? 0) + 1;
      styleBreakdown[t.travelStyle] = (styleBreakdown[t.travelStyle] ?? 0) + 1;
    }

    res.json({ totalTrips, topDestinations, avgGroupSize, budgetBreakdown, styleBreakdown });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /trips
router.get("/trips", async (req, res) => {
  try {
    const trips = await db.select().from(tripsTable).orderBy(desc(tripsTable.createdAt));
    res.json(trips);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /trips
router.post("/trips", async (req, res) => {
  const parsed = CreateTripBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  try {
    const [trip] = await db.insert(tripsTable).values({
      destination: parsed.data.destination,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      budget: parsed.data.budget,
      travelStyle: parsed.data.travelStyle,
      interests: (parsed.data.interests as string[]) ?? [],
      groupSize: parsed.data.groupSize,
      constraints: parsed.data.constraints ?? null,
      currency: parsed.data.currency ?? "USD",
      hotelStars: parsed.data.hotelStars ?? 3,
    }).returning();
    res.status(201).json(trip);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /trips/:id
router.get("/trips/:id", async (req, res) => {
  const parsed = GetTripParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const [trip] = await db.select().from(tripsTable).where(eq(tripsTable.id, parsed.data.id));
    if (!trip) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }
    res.json(trip);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /trips/:id
router.patch("/trips/:id", async (req, res) => {
  const paramsParsed = UpdateTripParams.safeParse({ id: Number(req.params.id) });
  const bodyParsed = UpdateTripBody.safeParse(req.body);
  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  try {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    const b = bodyParsed.data;
    if (b.destination !== undefined) updates.destination = b.destination;
    if (b.startDate !== undefined) updates.startDate = b.startDate;
    if (b.endDate !== undefined) updates.endDate = b.endDate;
    if (b.budget !== undefined) updates.budget = b.budget;
    if (b.travelStyle !== undefined) updates.travelStyle = b.travelStyle;
    if (b.interests !== undefined) updates.interests = b.interests;
    if (b.groupSize !== undefined) updates.groupSize = b.groupSize;
    if (b.constraints !== undefined) updates.constraints = b.constraints;
    if (b.currency !== undefined) updates.currency = b.currency;
    if (b.hotelStars !== undefined) updates.hotelStars = b.hotelStars;

    const [trip] = await db
      .update(tripsTable)
      .set(updates)
      .where(eq(tripsTable.id, paramsParsed.data.id))
      .returning();

    if (!trip) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }
    res.json(trip);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /trips/:id
router.delete("/trips/:id", async (req, res) => {
  const parsed = DeleteTripParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    await db.delete(tripsTable).where(eq(tripsTable.id, parsed.data.id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /trips/:id/generate
router.post("/trips/:id/generate", async (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const [trip] = await db.select().from(tripsTable).where(eq(tripsTable.id, id));
    if (!trip) {
      res.status(404).json({ error: "Trip not found" });
      return;
    }

    const itineraryData = generateItineraryData(trip);

    // Delete existing itinerary if any
    await db.delete(itinerariesTable).where(eq(itinerariesTable.tripId, id));

    const [itinerary] = await db.insert(itinerariesTable).values({
      tripId: id,
      days: itineraryData.days,
      totalEstimatedCost: itineraryData.totalEstimatedCost,
      hotels: itineraryData.hotels,
      restaurants: itineraryData.restaurants,
      packingSuggestions: itineraryData.packingSuggestions,
      transportationPlan: itineraryData.transportationPlan,
      alternativeOptions: itineraryData.alternativeOptions,
    }).returning();

    // Mark trip as having an itinerary
    await db.update(tripsTable).set({ hasItinerary: true, updatedAt: new Date() }).where(eq(tripsTable.id, id));

    res.json(itinerary);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /trips/:id/itinerary
router.get("/trips/:id/itinerary", async (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const [itinerary] = await db.select().from(itinerariesTable).where(eq(itinerariesTable.tripId, id));
    if (!itinerary) {
      res.status(404).json({ error: "Itinerary not found" });
      return;
    }
    res.json(itinerary);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /trips/:id/itinerary
router.patch("/trips/:id/itinerary", async (req, res) => {
  const id = Number(req.params.id);
  if (!id || isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    const [itinerary] = await db
      .update(itinerariesTable)
      .set({ ...req.body })
      .where(eq(itinerariesTable.tripId, id))
      .returning();

    if (!itinerary) {
      res.status(404).json({ error: "Itinerary not found" });
      return;
    }
    res.json(itinerary);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
