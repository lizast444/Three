import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart2, TrendingUp, Star, MessageSquareQuote } from "lucide-react";
import { useGetInsightStats } from "@workspace/api-client-react";
import { SPHERES } from "@/lib/constants";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { clsx } from "clsx";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

type SphereKey = keyof typeof SPHERES;

interface LocalDay {
  date: string;
  yesterday_review?: string;
  micro_actions?: { sphere: string; action: string }[];
  micro_action?: string;
  micro_action_sphere?: string;
}

function loadLocalDays(): LocalDay[] {
  try {
    const raw = localStorage.getItem("tb_days");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export default function InsightsPage() {
  const [days, setDays] = useState<7 | 14 | 30>(7);
  const { data: stats, isLoading } = useGetInsightStats({ days: days as any });

  const chartData = stats?.checkins.map(c => ({
    date: format(parseISO(c.date), "dd.MM"),
    autonomy: c.autonomyScore,
    competence: c.competenceScore,
    relatedness: c.relatednessScore,
    fullDate: c.date
  })).reverse() || [];

  // Read yesterday reviews from localStorage (primary data source)
  const recentReviews = useMemo(() => {
    const localDays = loadLocalDays();
    return localDays
      .filter(d => d.yesterday_review?.trim())
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
  }, []);

  const peaks = (stats as any)?.peaks as Array<{
    date: string; sphere: string; score: number;
    note: string | null; noteTags?: string[];
  }> | undefined;

  return (
    <div className="flex flex-col space-y-8 pt-6 pb-12">
      <header className="space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl text-primary mb-2">
          <BarChart2 className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-serif font-medium text-foreground tracking-tight">Аналитика</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Паттерны ваших потребностей и моменты ресурса.
        </p>
      </header>

      {/* Period Selector */}
      <div className="bg-secondary/50 p-1 rounded-2xl flex mx-auto max-w-sm w-full border border-border/50">
        {[7, 14, 30].map(d => (
          <button
            key={d}
            onClick={() => setDays(d as any)}
            className={clsx(
              "flex-1 py-2 text-sm font-medium rounded-xl transition-all",
              days === d
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            {d} дней
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Chart Card */}
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-card-border space-y-6">
            <h3 className="font-semibold text-lg flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Динамика состояния
            </h3>

            <div className="h-64 w-full -ml-4 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    domain={[0, 10]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '16px',
                      border: '1px solid hsl(var(--border))',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      fontFamily: 'inherit',
                      padding: '12px'
                    }}
                    itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                  />
                  <Line type="monotone" name="Автономия" dataKey="autonomy" stroke="hsl(var(--sphere-autonomy))" strokeWidth={3} dot={{ r: 3, fill: 'hsl(var(--sphere-autonomy))', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" name="Компетентность" dataKey="competence" stroke="hsl(var(--sphere-competence))" strokeWidth={3} dot={{ r: 3, fill: 'hsl(var(--sphere-competence))', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" name="Связанность" dataKey="relatedness" stroke="hsl(var(--sphere-relatedness))" strokeWidth={3} dot={{ r: 3, fill: 'hsl(var(--sphere-relatedness))', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-2 border-t border-border/50">
              {Object.values(SPHERES).map(s => (
                <div key={s.id} className="flex items-center text-xs font-medium text-muted-foreground">
                  <div className={clsx("w-2.5 h-2.5 rounded-full mr-2", s.bgClass)} />
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          {/* Peak days */}
          {peaks && peaks.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg pl-2 flex items-center">
                <Star className="w-5 h-5 mr-2 text-amber-500 fill-amber-500" />
                Пиковые дни (8+)
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {peaks.map((peak, i) => {
                  const sphere = SPHERES[peak.sphere as SphereKey];
                  if (!sphere) return null;
                  const tags = (peak.noteTags ?? []).map(t => SPHERES[t as SphereKey]).filter(Boolean);
                  return (
                    <div key={i} className="bg-card p-5 rounded-3xl border border-card-border shadow-sm flex flex-col space-y-3 relative overflow-hidden">
                      <div className={clsx("absolute top-0 left-0 w-1 h-full", sphere.bgClass)} />
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <sphere.icon className={clsx("w-4 h-4", sphere.colorClass)} />
                          <span className="text-sm font-semibold">{sphere.label}</span>
                          <span className={clsx("text-2xl font-bold font-serif leading-none ml-1", sphere.colorClass)}>
                            {peak.score}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {format(parseISO(peak.date), "d MMM", { locale: ru })}
                        </span>
                      </div>

                      {/* Tags */}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {tags.map(s => (
                            <span key={s.id} className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white", s.bgClass)}>
                              <s.icon className="w-3 h-3" />
                              {s.label}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Day note */}
                      {peak.note && (
                        <p className="text-sm text-foreground/90 italic leading-snug border-l-2 border-border pl-3 py-1">
                          "{peak.note}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* What worked — reviews from yesterday's plans */}
          {recentReviews.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg pl-2 flex items-center">
                <MessageSquareQuote className="w-5 h-5 mr-2 text-primary" />
                Что помогло из планов
              </h3>
              <div className="bg-card rounded-3xl p-6 shadow-sm border border-card-border space-y-5">
                {recentReviews.map((day, i) => {
                  const actions = day.micro_actions?.length
                    ? day.micro_actions
                    : day.micro_action
                      ? [{ sphere: day.micro_action_sphere ?? "", action: day.micro_action }]
                      : [];
                  return (
                    <div key={i} className="space-y-2 pb-4 border-b border-border/40 last:pb-0 last:border-b-0">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {format(parseISO(day.date), "d MMMM", { locale: ru })}
                      </span>

                      {/* Planned actions context */}
                      {actions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-1">
                          {actions.map((a, j) => {
                            const s = SPHERES[a.sphere as SphereKey];
                            return s ? (
                              <span key={j} className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white", s.bgClass)}>
                                <s.icon className="w-3 h-3" />
                                {a.action.length > 30 ? a.action.slice(0, 30) + "…" : a.action}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}

                      <p className="text-sm text-foreground leading-relaxed italic bg-secondary/40 rounded-xl px-4 py-3">
                        "{day.yesterday_review}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </motion.div>
      )}
    </div>
  );
}
