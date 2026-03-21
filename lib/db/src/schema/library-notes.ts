import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const libraryNotesTable = pgTable("library_notes", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertLibraryNoteSchema = createInsertSchema(libraryNotesTable).omit({ id: true, createdAt: true });
export type InsertLibraryNote = z.infer<typeof insertLibraryNoteSchema>;
export type LibraryNote = typeof libraryNotesTable.$inferSelect;
