import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart2, TrendingUp, Star, Lightbulb } from "lucide-react";
import { useGetInsightStats } from "@workspace/api-client-react";
import { SPHERES } from "@/lib/constants";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { clsx } from "clsx";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine 
} from "recharts";

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

          {/* Peaks */}
          {stats?.peaks && stats.peaks.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg pl-2 flex items-center">
                <Star className="w-5 h-5 mr-2 text-amber-500 fill-amber-500" />
                Пиковые дни (8+)
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {stats.peaks.slice(0, 5).map((peak, i) => {
                  const sphere = SPHERES[peak.sphere as keyof typeof SPHERES];
                  if (!sphere) return null;
                  return (
                    <div key={i} className="bg-card p-5 rounded-3xl border border-card-border shadow-sm flex flex-col space-y-3 relative overflow-hidden">
                      <div className={clsx("absolute top-0 left-0 w-1 h-full", sphere.bgClass)} />
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                          <sphere.icon className={clsx("w-4 h-4", sphere.colorClass)} />
                          <span className="text-sm font-semibold">{sphere.label}</span>
                        </div>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {format(parseISO(peak.date), "d MMM", { locale: ru })}
                        </span>
                      </div>
                      <div className="flex items-baseline space-x-3 pt-1">
                        <span className={clsx("text-2xl font-bold font-serif leading-none", sphere.colorClass)}>{peak.score}</span>
                        {peak.note && (
                          <p className="text-sm text-foreground/90 italic leading-snug border-l-2 border-border pl-3 py-1">
                            "{peak.note}"
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* What Worked */}
          {stats?.whatWorked && stats.whatWorked.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg pl-2 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-primary" />
                Что работало?
              </h3>
              <div className="bg-card rounded-3xl p-6 shadow-sm border border-card-border space-y-6">
                {stats.whatWorked.map((ww, i) => {
                  const sphere = SPHERES[ww.sphere as keyof typeof SPHERES];
                  if (!sphere || !ww.microActions.length) return null;
                  return (
                    <div key={i} className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <sphere.icon className={clsx("w-4 h-4", sphere.colorClass)} />
                        <span className="font-medium text-sm">{sphere.label}</span>
                      </div>
                      <ul className="space-y-2">
                        {ww.microActions.map((action, j) => (
                          <li key={j} className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-xl border border-border/50">
                            {action}
                          </li>
                        ))}
                      </ul>
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
