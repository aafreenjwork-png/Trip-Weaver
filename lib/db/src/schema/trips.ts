import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

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
  hasItinerary: boolean("has_itinerary").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTripSchema = createInsertSchema(tripsTable).omit({ id: true, createdAt: true, updatedAt: true, hasItinerary: true });
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof tripsTable.$inferSelect;
