import { Router, type IRouter } from "express";
import { db, checkinsTable, insertCheckinSchema } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router: IRouter = Router();

function formatCheckin(row: typeof checkinsTable.$inferSelect) {
  return {
    id: row.id,
    date: row.date,
    autonomyScore: row.autonomyScore,
    competenceScore: row.competenceScore,
    relatednessScore: row.relatednessScore,
    note: row.note ?? null,
    noteTags: row.noteTags ?? [],
    microAction: row.microAction ?? null,
    microActionSphere: row.microActionSphere ?? null,
    deepDiveAnswers: row.deepDiveAnswers ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const limit = Math.min(Number(req.query["limit"] ?? 30), 100);
  const offset = Number(req.query["offset"] ?? 0);

  const rows = await db
    .select()
    .from(checkinsTable)
    .orderBy(desc(checkinsTable.date))
    .limit(limit)
    .offset(offset);

  res.json(rows.map(formatCheckin));
});

router.get("/today", async (req, res) => {
  const today = new Date().toISOString().split("T")[0]!;
  const rows = await db
    .select()
    .from(checkinsTable)
    .where(eq(checkinsTable.date, today))
    .limit(1);

  if (rows.length === 0) {
    return res.json(null);
  }
  return res.json(formatCheckin(rows[0]!));
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params["id"]);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const rows = await db
    .select()
    .from(checkinsTable)
    .where(eq(checkinsTable.id, id))
    .limit(1);

  if (rows.length === 0) {
    return res.status(404).json({ error: "Not found" });
  }
  return res.json(formatCheckin(rows[0]!));
});

router.post("/", async (req, res) => {
  const parsed = insertCheckinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
  }

  const data = parsed.data;
  const existing = await db
    .select()
    .from(checkinsTable)
    .where(eq(checkinsTable.date, data.date))
    .limit(1);

  let row;
  if (existing.length > 0) {
    const updated = await db
      .update(checkinsTable)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(checkinsTable.date, data.date))
      .returning();
    row = updated[0]!;
  } else {
    const inserted = await db
      .insert(checkinsTable)
      .values(data)
      .returning();
    row = inserted[0]!;
  }

  return res.json(formatCheckin(row));
});

export default router;
