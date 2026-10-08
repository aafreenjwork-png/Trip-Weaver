import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

type AirportOption = {
  name: string;
  iataCode: string | null;
  distanceKm: number;
};

type RoadRouteOption = {
  status: "drivable" | "long_drive" | "not_recommended" | "unavailable";
  distanceKm: number | null;
  durationMinutes: number | null;
  message: string;
};

export const tripsTable = pgTable("trips", {
  id: serial("id").primaryKey(),
  destination: text("destination").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  budget: text("budget").notNull(),
  travelStyle: text("travel_style").notNull(),
  interests: jsonb("interests").$type<string[]>().notNull().default([]),
  groupSize: integer("group_size").notNull().default(1),
  constraints: text("constraints"),
  travelingFrom: text("traveling_from"),
  destinationAirport: text("destination_airport"),
  nearestAirports: jsonb("nearest_airports").$type<AirportOption[]>().notNull().default([]),
  roadRoute: jsonb("road_route").$type<RoadRouteOption | null>(),
  currency: text("currency").notNull().default("USD"),
  hotelStars: integer("hotel_stars").notNull().default(3),
  hasItinerary: boolean("has_itinerary").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTripSchema = createInsertSchema(tripsTable).omit({ id: true, createdAt: true, updatedAt: true, hasItinerary: true });
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof tripsTable.$inferSelect;
