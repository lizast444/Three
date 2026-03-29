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

  // Collect all candidate peaks, then deduplicate by date (keep highest score per date)
  const allPeaks: { date: string; sphere: string; score: number; note: string | null }[] = [];

  for (const sphere of spheres) {
    const scoreKey = `${sphere}Score` as "autonomyScore" | "competenceScore" | "relatednessScore";
    const topDays = checkins
      .filter((c) => c[scoreKey] >= peakThreshold)
      .sort((a, b) => b[scoreKey] - a[scoreKey])
      .slice(0, 5);

    for (const day of topDays) {
      const dda = (day.deepDiveAnswers as Record<string, unknown> | null) ?? {};

      // New array format: autonomy_answers: [{question, answer}]
      const sphereAnswersArr = dda[`${sphere}_answers`] as Array<{ question: string; answer: string }> | undefined;
      const sphereAnswerFromArr = sphereAnswersArr?.find((a) => a.answer?.trim())?.answer ?? null;

      // Old single format: autonomy_answer
      const sphereAnswerOld = (dda[`${sphere}_answer`] as string | undefined) || null;

      const noteText = sphereAnswerFromArr ?? sphereAnswerOld ?? null;

      allPeaks.push({
        date: day.date,
        sphere,
        score: day[scoreKey],
        note: noteText,
      });
    }
  }

  // Deduplicate: one peak per date, keeping the sphere with the highest score
  allPeaks.sort((a, b) => b.score - a.score);
  const seenDates = new Set<string>();
  const peaks = allPeaks.filter((p) => {
    if (seenDates.has(p.date)) return false;
    seenDates.add(p.date);
    return true;
  }).slice(0, 5);

  const whatWorked: { sphere: string; microActions: string[] }[] = spheres.map((sphere) => {
    const scoreKey = `${sphere}Score` as "autonomyScore" | "competenceScore" | "relatednessScore";
    const highScoreDays = checkins.filter(
      (c) =>
        c[scoreKey] > 7 &&
        c.microAction &&
        // Only show if this microAction was tagged to this sphere (or has no sphere tag)
        (!c.microActionSphere || c.microActionSphere === sphere)
    );
    return {
      sphere,
      microActions: [...new Set(highScoreDays.map((c) => c.microAction!).filter(Boolean))],
    };
  });

  res.json({ checkins, peaks, whatWorked });
});

export default router;
