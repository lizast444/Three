import { Router, type IRouter } from "express";
import { db, libraryNotesTable, insertLibraryNoteSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/notes", async (req, res) => {
  const category = req.query["category"] as string | undefined;

  let query = db
    .select()
    .from(libraryNotesTable)
    .orderBy(desc(libraryNotesTable.createdAt))
    .$dynamic();

  if (category) {
    query = query.where(eq(libraryNotesTable.category, category));
  }

  const rows = await query;

  res.json(
    rows.map((r) => ({
      id: r.id,
      category: r.category,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
    }))
  );
});

router.post("/notes", async (req, res) => {
  const parsed = insertLibraryNoteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
  }

  const inserted = await db
    .insert(libraryNotesTable)
    .values(parsed.data)
    .returning();

  const row = inserted[0]!;
  return res.json({
    id: row.id,
    category: row.category,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  });
});

export default router;
