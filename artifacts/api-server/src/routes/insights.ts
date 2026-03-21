import { Router, type IRouter } from "express";
import { db, checkinsTable } from "@workspace/db";
import { gte, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/stats", async (req, res) => {
  const days = Number(req.query["days"] ?? 7);
  const validDays = [7, 14, 30].includes(days) ? days : 7;

  const since = new Date();
  since.setDate(since.getDate() - validDays);
  const sinceStr = since.toISOString().split("T")[0]!;

  const rows = await db
    .select()
    .from(checkinsTable)
    .where(gte(checkinsTable.date, sinceStr))
    .orderBy(desc(checkinsTable.date));

  const checkins = rows.map((r) => ({
    id: r.id,
    date: r.date,
    autonomyScore: r.autonomyScore,
    competenceScore: r.competenceScore,
    relatednessScore: r.relatednessScore,
    note: r.note ?? null,
    noteTags: r.noteTags ?? [],
    microAction: r.microAction ?? null,
    microActionSphere: r.microActionSphere ?? null,
    deepDiveAnswers: r.deepDiveAnswers ?? null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  const spheres = ["autonomy", "competence", "relatedness"] as const;
  const peakThreshold = 8;

  const peaks: { date: string; sphere: string; score: number; note: string | null }[] = [];

  for (const sphere of spheres) {
    const scoreKey = `${sphere}Score` as "autonomyScore" | "competenceScore" | "relatednessScore";
    const topDays = checkins
      .filter((c) => c[scoreKey] >= peakThreshold)
      .sort((a, b) => b[scoreKey] - a[scoreKey])
      .slice(0, 3);

    for (const day of topDays) {
      peaks.push({
        date: day.date,
        sphere,
        score: day[scoreKey],
        note: day.note,
      });
    }
  }

  const whatWorked: { sphere: string; microActions: string[] }[] = spheres.map((sphere) => {
    const scoreKey = `${sphere}Score` as "autonomyScore" | "competenceScore" | "relatednessScore";
    const highScoreDays = checkins.filter(
      (c) => c[scoreKey] > 7 && c.microAction
    );
    return {
      sphere,
      microActions: highScoreDays.map((c) => c.microAction!).filter(Boolean),
    };
  });

  res.json({ checkins, peaks, whatWorked });
});

export default router;
