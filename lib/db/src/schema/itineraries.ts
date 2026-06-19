import { pgTable, serial, integer, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { tripsTable } from "./trips";

export const itinerariesTable = pgTable("itineraries", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => tripsTable.id, { onDelete: "cascade" }),
  days: jsonb("days").notNull().default([]),
  totalEstimatedCost: integer("total_estimated_cost").notNull().default(0),
  hotels: jsonb("hotels").notNull().default([]),
  restaurants: jsonb("restaurants").notNull().default([]),
  packingSuggestions: jsonb("packing_suggestions").$type<string[]>().notNull().default([]),
  transportationPlan: text("transportation_plan").notNull().default(""),
  alternativeOptions: jsonb("alternative_options").notNull().default([]),
  generatedAt: timestamp("generated_at").notNull().defaultNow(),
});

export const insertItinerarySchema = createInsertSchema(itinerariesTable).omit({ id: true, generatedAt: true });
export type InsertItinerary = z.infer<typeof insertItinerarySchema>;
export type Itinerary = typeof itinerariesTable.$inferSelect;
