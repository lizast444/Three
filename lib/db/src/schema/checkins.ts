import { pgTable, serial, text, integer, date, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const checkinsTable = pgTable("checkins", {
  id: serial("id").primaryKey(),
  date: date("date").notNull().unique(),
  autonomyScore: integer("autonomy_score").notNull(),
  competenceScore: integer("competence_score").notNull(),
  relatednessScore: integer("relatedness_score").notNull(),
  note: text("note"),
  noteTags: text("note_tags").array().notNull().default([]),
  microAction: text("micro_action"),
  microActionSphere: text("micro_action_sphere"),
  deepDiveAnswers: jsonb("deep_dive_answers"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertCheckinSchema = createInsertSchema(checkinsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCheckin = z.infer<typeof insertCheckinSchema>;
export type Checkin = typeof checkinsTable.$inferSelect;
