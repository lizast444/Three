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

  // Collect all candidate peaks, deduplicate by date (keep highest score per date)
  const allPeaks: {
    date: string; sphere: string; score: number;
    note: string | null; noteTags: string[];
  }[] = [];

  for (const sphere of spheres) {
    const scoreKey = `${sphere}Score` as "autonomyScore" | "competenceScore" | "relatednessScore";
    const topDays = checkins
      .filter((c) => c[scoreKey] >= peakThreshold)
      .sort((a, b) => b[scoreKey] - a[scoreKey])
      .slice(0, 5);

    for (const day of topDays) {
      allPeaks.push({
        date: day.date,
        sphere,
        score: day[scoreKey],
        note: day.note ?? null,
        noteTags: day.noteTags ?? [],
      });
    }
  }

  allPeaks.sort((a, b) => b.score - a.score);
  const seenDates = new Set<string>();
  const peaks = allPeaks.filter((p) => {
    if (seenDates.has(p.date)) return false;
    seenDates.add(p.date);
    return true;
  }).slice(0, 5);

  // Yesterday reviews: checkins with yesterday_review in deepDiveAnswers
  const reviews = checkins
    .map((c) => {
      const dda = (c.deepDiveAnswers as Record<string, unknown> | null) ?? {};
      const review = dda["yesterday_review"] as string | undefined;
      const microActions = dda["micro_actions"] as Array<{ sphere: string; action: string }> | undefined;
      if (!review?.trim()) return null;
      return { date: c.date, review, microActions: microActions ?? [] };
    })
    .filter(Boolean)
    .slice(0, 5);

  res.json({ checkins, peaks, reviews });
});

export default router;
