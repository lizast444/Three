import { useState, useMemo } from "react";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameDay, isSameMonth, isToday,
  addMonths, subMonths, parseISO
} from "date-fns";
import { ru } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays, X, Wind, Anchor, Users, BookOpen } from "lucide-react";
import { SPHERES, LIBRARY_QUESTIONS } from "@/lib/constants";
import { useGetCheckins } from "@workspace/api-client-react";
import type { Checkin } from "@workspace/api-client-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

type SphereKey = "autonomy" | "competence" | "relatedness";

function loadDeepDive(date: string, sphere: SphereKey): Record<number, string> {
  try {
    const raw = localStorage.getItem(`tb_deep_${date}_${sphere}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

// ── Score Bar ────────────────────────────────────────────────────────────────

function ScoreBar({ label, value, colorClass, bgClass }: {
  label: string; value: number; colorClass: string; bgClass: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={clsx("text-sm font-bold", colorClass)}>{value}/10</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / 10) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={clsx("h-full rounded-full", bgClass)}
        />
      </div>
    </div>
  );
}

// ── Day Detail Panel ─────────────────────────────────────────────────────────

function DayDetail({ checkin, date, onClose }: {
  checkin: Checkin | null;
  date: Date;
  onClose: () => void;
}) {
  const dateStr = format(date, "yyyy-MM-dd");
  const deepDiveAutonomy = loadDeepDive(dateStr, "autonomy");
  const deepDiveCompetence = loadDeepDive(dateStr, "competence");
  const deepDiveRelatedness = loadDeepDive(dateStr, "relatedness");

  const hasDeepdive = (obj: Record<number, string>) =>
    Object.values(obj).some(v => v.trim());

  const dda = checkin?.deepDiveAnswers as Record<string, string> | null ?? {};

  const sphereData: { key: SphereKey; label: string; icon: typeof Wind; colorClass: string; bgClass: string; lightBgClass: string }[] = [
    { key: "autonomy", label: "Автономия", icon: Wind, colorClass: SPHERES.autonomy.colorClass, bgClass: SPHERES.autonomy.bgClass, lightBgClass: SPHERES.autonomy.lightBgClass },
    { key: "competence", label: "Компетентность", icon: Anchor, colorClass: SPHERES.competence.colorClass, bgClass: SPHERES.competence.bgClass, lightBgClass: SPHERES.competence.lightBgClass },
    { key: "relatedness", label: "Связанность", icon: Users, colorClass: SPHERES.relatedness.colorClass, bgClass: SPHERES.relatedness.bgClass, lightBgClass: SPHERES.relatedness.lightBgClass },
  ];

  const deepDiveMap: Record<SphereKey, Record<number, string>> = {
    autonomy: deepDiveAutonomy,
    competence: deepDiveCompetence,
    relatedness: deepDiveRelatedness,
  };

  const scores: Record<SphereKey, number> = checkin ? {
    autonomy: checkin.autonomyScore,
    competence: checkin.competenceScore,
    relatedness: checkin.relatednessScore,
  } : { autonomy: 0, competence: 0, relatedness: 0 };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="relative w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0 border-b border-border/50">
          <div>
            <h2 className="font-serif text-lg font-medium capitalize">
              {format(date, "d MMMM yyyy", { locale: ru })}
            </h2>
            <p className="text-xs text-muted-foreground capitalize">
              {format(date, "EEEE", { locale: ru })}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {!checkin ? (
            <div className="py-16 text-center text-muted-foreground/60 font-medium">
              Нет записей за этот день
            </div>
          ) : (
            <>
              {/* Scores */}
              <section className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Оценки потребностей</h3>
                <div className="space-y-3 bg-secondary/40 rounded-2xl p-4">
                  {sphereData.map(s => (
                    <ScoreBar
                      key={s.key}
                      label={s.label}
                      value={scores[s.key]}
                      colorClass={s.colorClass}
                      bgClass={s.bgClass}
                    />
                  ))}
                </div>
              </section>

              {/* Per-sphere questions & answers */}
              {sphereData.map(s => {
                const question = dda[`${s.key}_question`];
                const answer = dda[`${s.key}_answer`];
                const deepDive = deepDiveMap[s.key];
                const deepDiveFilled = Object.entries(deepDive).filter(([, v]) => v.trim());
                const Icon = s.icon;

                if (!question && !answer && deepDiveFilled.length === 0) return null;

                return (
                  <section key={s.key} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className={clsx("p-1.5 rounded-lg", s.lightBgClass, s.colorClass)}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-sm font-semibold">{s.label}</h3>
                    </div>

                    {question && (
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Вопрос дня</p>
                        <p className="text-sm font-serif italic text-foreground/80 leading-relaxed bg-secondary/40 rounded-xl px-3 py-2.5">
                          "{question}"
                        </p>
                        {answer && (
                          <p className="text-sm text-foreground leading-relaxed px-1 whitespace-pre-wrap">
                            {answer}
                          </p>
                        )}
                      </div>
                    )}

                    {deepDiveFilled.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className={clsx("w-3.5 h-3.5", s.colorClass)} />
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Глубокий разбор ({deepDiveFilled.length})
                          </p>
                        </div>
                        <div className="space-y-3">
                          {deepDiveFilled.map(([idxStr, ans]) => {
                            const idx = parseInt(idxStr);
                            const qItem = LIBRARY_QUESTIONS[s.key]?.[idx];
                            return (
                              <div key={idxStr} className="bg-secondary/40 rounded-xl p-3 space-y-1.5">
                                {qItem && (
                                  <p className="text-xs font-serif italic text-muted-foreground leading-relaxed">
                                    {qItem.question}
                                  </p>
                                )}
                                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                  {ans}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}

              {/* Note */}
              {checkin.note && (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Заметка дня</h3>
                  {checkin.noteTags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {checkin.noteTags.map(tag => {
                        const s = SPHERES[tag as SphereKey];
                        if (!s) return null;
                        const Icon = s.icon;
                        return (
                          <span key={tag} className={clsx("flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white", s.bgClass)}>
                            <Icon className="w-3 h-3" />
                            {s.label}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-sm text-foreground leading-relaxed bg-secondary/40 rounded-xl px-4 py-3 whitespace-pre-wrap">
                    {checkin.note}
                  </p>
                </section>
              )}

              {/* Micro-action */}
              {checkin.microAction && (
                <section className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Микро-действие</h3>
                  {checkin.microActionSphere && (
                    <div className="flex items-center gap-1.5 mb-1">
                      {(() => {
                        const s = SPHERES[checkin.microActionSphere as SphereKey];
                        if (!s) return null;
                        const Icon = s.icon;
                        return (
                          <span className={clsx("flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white", s.bgClass)}>
                            <Icon className="w-3 h-3" />
                            {s.label}
                          </span>
                        );
                      })()}
                    </div>
                  )}
                  <p className="text-sm text-foreground leading-relaxed bg-secondary/40 rounded-xl px-4 py-3 whitespace-pre-wrap">
                    {checkin.microAction}
                  </p>
                </section>
              )}
            </>
          )}
        </div>

        <div className="px-6 py-4 shrink-0 border-t border-border/50">
          <Button variant="outline" onClick={onClose} className="w-full rounded-xl h-11">
            Закрыть
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Calendar ─────────────────────────────────────────────────────────────────

export default function JournalPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const { data: checkinsData } = useGetCheckins({ limit: 500 });
  const checkins = checkinsData?.checkins ?? [];

  const checkinMap = useMemo(() => {
    const map: Record<string, Checkin> = {};
    for (const c of checkins) map[c.date] = c;
    return map;
  }, [checkins]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const hasNote = (dateStr: string) => {
    const c = checkinMap[dateStr];
    if (!c) return false;
    return !!(c.note?.trim());
  };

  const hasDeepDive = (dateStr: string) => {
    const spheres: SphereKey[] = ["autonomy", "competence", "relatedness"];
    return spheres.some(s => {
      const d = loadDeepDive(dateStr, s);
      return Object.values(d).some(v => v.trim());
    });
  };

  const selectedCheckin = selectedDay
    ? checkinMap[format(selectedDay, "yyyy-MM-dd")] ?? null
    : null;

  return (
    <div className="flex flex-col space-y-6 pt-6 pb-12">
      {/* Header */}
      <header className="space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl text-primary mb-2">
          <CalendarDays className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-serif font-medium text-foreground tracking-tight">Журнал</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          История ваших ежедневных размышлений.
        </p>
      </header>

      {/* Calendar Card */}
      <div className="bg-card rounded-3xl shadow-sm border border-card-border overflow-hidden">
        {/* Month Nav */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <button
            onClick={() => setCurrentMonth(m => subMonths(m, 1))}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            <span className="font-semibold text-base capitalize">
              {format(currentMonth, "LLLL yyyy", { locale: ru })}
            </span>
          </div>

          <button
            onClick={() => setCurrentMonth(m => addMonths(m, 1))}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 px-3 pt-3 pb-1">
          {WEEKDAYS.map(d => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={format(currentMonth, "yyyy-MM")}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-7 px-3 pb-4 gap-y-1"
          >
            {calendarDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const inMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
              const isTodayDay = isToday(day);
              const hasCheckin = !!checkinMap[dateStr];
              const hasNoteFlag = hasNote(dateStr);
              const hasDeepFlag = hasDeepDive(dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    setSelectedDay(prev =>
                      prev && isSameDay(prev, day) ? null : day
                    );
                  }}
                  className={clsx(
                    "relative flex flex-col items-center justify-center aspect-square rounded-2xl transition-all duration-200 text-sm font-medium mx-0.5",
                    !inMonth && "opacity-30 pointer-events-none",
                    isSelected && "bg-primary text-primary-foreground shadow-md",
                    !isSelected && isTodayDay && "border-2 border-primary text-primary",
                    !isSelected && !isTodayDay && hasCheckin && "bg-emerald-500/10 text-foreground hover:bg-emerald-500/20",
                    !isSelected && !isTodayDay && !hasCheckin && "text-foreground hover:bg-secondary",
                  )}
                >
                  <span className="leading-none">{format(day, "d")}</span>

                  {/* Indicators */}
                  {inMonth && (
                    <div className="flex items-center gap-0.5 mt-0.5 h-1.5">
                      {hasCheckin && !isSelected && (
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      )}
                      {hasNoteFlag && !isSelected && (
                        <span className="text-[7px] leading-none">📝</span>
                      )}
                      {hasDeepFlag && !isSelected && (
                        <span className="w-1 h-1 rounded-full bg-primary/60" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Legend */}
        <div className="flex items-center gap-4 px-5 pb-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Чекин</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">📝</span>
            <span>Заметка</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary/60" />
            <span>Разбор</span>
          </div>
        </div>
      </div>

      {/* Today button */}
      {!isSameMonth(currentMonth, new Date()) && (
        <Button
          variant="outline"
          onClick={() => { setCurrentMonth(new Date()); setSelectedDay(new Date()); }}
          className="w-full rounded-2xl h-11"
        >
          Сегодня
        </Button>
      )}

      {/* Stats for the month */}
      {checkins.length > 0 && (
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-card-border">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            {format(currentMonth, "LLLL", { locale: ru })} — статистика
          </h3>
          {(() => {
            const monthStr = format(currentMonth, "yyyy-MM");
            const monthCheckins = checkins.filter(c => c.date.startsWith(monthStr));
            if (monthCheckins.length === 0) {
              return <p className="text-sm text-muted-foreground">Нет чекинов в этом месяце</p>;
            }
            const avg = (key: "autonomyScore" | "competenceScore" | "relatednessScore") =>
              (monthCheckins.reduce((s, c) => s + c[key], 0) / monthCheckins.length).toFixed(1);
            return (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Чекинов</span>
                  <span className="font-semibold">{monthCheckins.length}</span>
                </div>
                <ScoreBar label="Автономия (avg)" value={parseFloat(avg("autonomyScore"))} colorClass={SPHERES.autonomy.colorClass} bgClass={SPHERES.autonomy.bgClass} />
                <ScoreBar label="Компетентность (avg)" value={parseFloat(avg("competenceScore"))} colorClass={SPHERES.competence.colorClass} bgClass={SPHERES.competence.bgClass} />
                <ScoreBar label="Связанность (avg)" value={parseFloat(avg("relatednessScore"))} colorClass={SPHERES.relatedness.colorClass} bgClass={SPHERES.relatedness.bgClass} />
              </div>
            );
          })()}
        </div>
      )}

      {/* Day Detail Modal */}
      <AnimatePresence>
        {selectedDay && (
          <DayDetail
            key={format(selectedDay, "yyyy-MM-dd")}
            checkin={selectedCheckin}
            date={selectedDay}
            onClose={() => setSelectedDay(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
