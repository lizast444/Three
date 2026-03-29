import { useState, useMemo, useEffect } from "react";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, isSameDay, isSameMonth, isToday,
  addMonths, subMonths
} from "date-fns";
import { ru } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, CalendarDays, X,
  Wind, Anchor, Users, BookOpen, CalendarCheck
} from "lucide-react";
import { SPHERES, LIBRARY_QUESTIONS } from "@/lib/constants";
import { useGetCheckins } from "@workspace/api-client-react";
import type { Checkin } from "@workspace/api-client-react";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
type SphereKey = "autonomy" | "competence" | "relatedness";

// ── Types ─────────────────────────────────────────────────────────────────────

interface QAnswer { question: string; answer: string; }

interface LocalDay {
  date: string;
  autonomy_score?: number;
  competence_score?: number;
  relatedness_score?: number;
  autonomy_answers?: QAnswer[];
  competence_answers?: QAnswer[];
  relatedness_answers?: QAnswer[];
  note?: string;
  note_tags?: string[];
  micro_action?: string;
  micro_action_sphere?: string;
}

// ── LocalStorage helpers ──────────────────────────────────────────────────────

function loadLocalDays(): LocalDay[] {
  try {
    const raw = localStorage.getItem("tb_days");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    console.log("[Journal] tb_days loaded:", parsed);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("[Journal] Failed to parse tb_days:", e);
    return [];
  }
}

function loadDeepDive(date: string, sphere: SphereKey): Record<number, string> {
  try {
    const raw = localStorage.getItem(`tb_deep_${date}_${sphere}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

// ── Score Bar ─────────────────────────────────────────────────────────────────

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

// ── Day Detail Panel ──────────────────────────────────────────────────────────

function DayDetail({
  localDay, apiCheckin, date, onClose,
}: {
  localDay: LocalDay | null;
  apiCheckin: Checkin | null;
  date: Date;
  onClose: () => void;
}) {
  const dateStr = format(date, "yyyy-MM-dd");

  // Deep-dive (always from localStorage keys)
  const deepDiveMap: Record<SphereKey, Record<number, string>> = {
    autonomy: loadDeepDive(dateStr, "autonomy"),
    competence: loadDeepDive(dateStr, "competence"),
    relatedness: loadDeepDive(dateStr, "relatedness"),
  };

  const hasDeepdive = (m: Record<number, string>) =>
    Object.values(m).some(v => v.trim());

  // Merge: localStorage wins, then API fallback
  const scores: Record<SphereKey, number> = {
    autonomy: localDay?.autonomy_score ?? apiCheckin?.autonomyScore ?? 0,
    competence: localDay?.competence_score ?? apiCheckin?.competenceScore ?? 0,
    relatedness: localDay?.relatedness_score ?? apiCheckin?.relatednessScore ?? 0,
  };

  const note = localDay?.note ?? apiCheckin?.note ?? "";
  const noteTags = localDay?.note_tags ?? apiCheckin?.noteTags ?? [];
  const microAction = localDay?.micro_action ?? apiCheckin?.microAction ?? "";
  const microActionSphere = localDay?.micro_action_sphere ?? apiCheckin?.microActionSphere ?? "";

  // Get answers array for sphere (localStorage new format → API new format → API old single format)
  const getAnswers = (sphere: SphereKey): QAnswer[] => {
    // localStorage new format
    const localArr = localDay?.[`${sphere}_answers` as keyof LocalDay] as QAnswer[] | undefined;
    if (localArr && localArr.length > 0) return localArr;

    // API deep dive answers
    if (apiCheckin?.deepDiveAnswers) {
      const dda = apiCheckin.deepDiveAnswers as Record<string, unknown>;
      // New array format in API
      const apiArr = dda[`${sphere}_answers`] as QAnswer[] | undefined;
      if (apiArr && apiArr.length > 0) return apiArr;
      // Old single-item format in API
      const q = dda[`${sphere}_question`] as string | undefined;
      const a = dda[`${sphere}_answer`] as string | undefined;
      if (q || a) return [{ question: q ?? "", answer: a ?? "" }];
    }
    return [];
  };

  const hasAnyData = localDay || apiCheckin;

  const sphereData = [
    { key: "autonomy" as SphereKey, label: "Автономия", icon: Wind },
    { key: "competence" as SphereKey, label: "Компетентность", icon: Anchor },
    { key: "relatedness" as SphereKey, label: "Связанность", icon: Users },
  ];

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
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {!hasAnyData ? (
            <div className="py-16 text-center space-y-2">
              <CalendarCheck className="w-10 h-10 text-muted-foreground/30 mx-auto" />
              <p className="text-muted-foreground/60 font-medium">Нет записей на этот день</p>
            </div>
          ) : (
            <>
              {/* Scores */}
              <section className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Оценки потребностей
                </h3>
                <div className="space-y-3 bg-secondary/40 rounded-2xl p-4">
                  {sphereData.map(s => (
                    <ScoreBar
                      key={s.key}
                      label={s.label}
                      value={scores[s.key]}
                      colorClass={SPHERES[s.key].colorClass}
                      bgClass={SPHERES[s.key].bgClass}
                    />
                  ))}
                </div>
              </section>

              {/* Per-sphere Q&As */}
              {sphereData.map(s => {
                const answers = getAnswers(s.key);
                const deepDive = deepDiveMap[s.key];
                const deepFilled = Object.entries(deepDive).filter(([, v]) => v.trim());
                const Icon = s.icon;
                const sphere = SPHERES[s.key];

                if (answers.length === 0 && deepFilled.length === 0) return null;

                return (
                  <section key={s.key} className="space-y-3">
                    {/* Sphere header */}
                    <div className="flex items-center gap-2">
                      <div className={clsx("p-1.5 rounded-lg", sphere.lightBgClass, sphere.colorClass)}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-sm font-semibold">{s.label}</h3>
                    </div>

                    {/* Rotation answers (new multi-answer format) */}
                    {answers.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          {answers.length > 1 ? `Вопросы и ответы (${answers.length})` : "Вопрос дня"}
                        </p>
                        {answers.map((qa, i) => (
                          <div key={i} className="space-y-1.5">
                            {qa.question && (
                              <p className="text-sm font-serif italic text-foreground/75 leading-relaxed bg-secondary/30 rounded-xl px-3 py-2.5">
                                "{qa.question}"
                              </p>
                            )}
                            {qa.answer && (
                              <p className="text-sm text-foreground leading-relaxed px-1 whitespace-pre-wrap">
                                {qa.answer}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Deep dive */}
                    {deepFilled.length > 0 && (
                      <div className="space-y-3 pt-1">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className={clsx("w-3.5 h-3.5", sphere.colorClass)} />
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Глубокий разбор ({deepFilled.length})
                          </p>
                        </div>
                        <div className="space-y-2">
                          {deepFilled.map(([idxStr, ans]) => {
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
              {note && (
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Заметка дня
                  </h3>
                  {noteTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {noteTags.map(tag => {
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
                    {note}
                  </p>
                </section>
              )}

              {/* Micro-action */}
              {microAction && (
                <section className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Микро-действие
                  </h3>
                  {microActionSphere && (
                    <div className="mb-1">
                      {(() => {
                        const s = SPHERES[microActionSphere as SphereKey];
                        if (!s) return null;
                        const Icon = s.icon;
                        return (
                          <span className={clsx("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white", s.bgClass)}>
                            <Icon className="w-3 h-3" />
                            {s.label}
                          </span>
                        );
                      })()}
                    </div>
                  )}
                  <p className="text-sm text-foreground leading-relaxed bg-secondary/40 rounded-xl px-4 py-3 whitespace-pre-wrap">
                    {microAction}
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

// ── Calendar Page ─────────────────────────────────────────────────────────────

export default function JournalPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [localDays, setLocalDays] = useState<LocalDay[]>([]);

  // Load localStorage data on mount
  useEffect(() => {
    const days = loadLocalDays();
    setLocalDays(days);
  }, []);

  // API data (for stats and legacy support)
  const { data: checkinsData } = useGetCheckins({ limit: 500 });
  const apiCheckins = checkinsData?.checkins ?? [];

  const localDayMap = useMemo(() => {
    const m: Record<string, LocalDay> = {};
    for (const d of localDays) m[d.date] = d;
    return m;
  }, [localDays]);

  const apiCheckinMap = useMemo(() => {
    const m: Record<string, Checkin> = {};
    for (const c of apiCheckins) m[c.date] = c;
    return m;
  }, [apiCheckins]);

  // Union of all dates that have any data
  const allDates = useMemo(() => {
    const s = new Set<string>();
    for (const d of localDays) s.add(d.date);
    for (const c of apiCheckins) s.add(c.date);
    return s;
  }, [localDays, apiCheckins]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const hasNote = (dateStr: string) => {
    return !!(localDayMap[dateStr]?.note?.trim() || apiCheckinMap[dateStr]?.note?.trim());
  };

  const hasDeepDive = (dateStr: string) => {
    const spheres: SphereKey[] = ["autonomy", "competence", "relatedness"];
    return spheres.some(s => {
      const d = loadDeepDive(dateStr, s);
      return Object.values(d).some(v => v.trim());
    });
  };

  const hasAnswers = (dateStr: string) => {
    const local = localDayMap[dateStr];
    if (!local) return false;
    const spheres: SphereKey[] = ["autonomy", "competence", "relatedness"];
    return spheres.some(s => {
      const arr = local[`${s}_answers` as keyof LocalDay] as QAnswer[] | undefined;
      return arr && arr.length > 0 && arr.some(a => a.answer?.trim());
    });
  };

  const selectedLocal = selectedDay ? localDayMap[format(selectedDay, "yyyy-MM-dd")] ?? null : null;
  const selectedApi = selectedDay ? apiCheckinMap[format(selectedDay, "yyyy-MM-dd")] ?? null : null;

  // Stats for current month (merge localStorage + API)
  const monthStats = useMemo(() => {
    const monthStr = format(currentMonth, "yyyy-MM");
    const dates = [...allDates].filter(d => d.startsWith(monthStr));
    if (dates.length === 0) return null;

    const avg = (key: "autonomy" | "competence" | "relatedness") => {
      let sum = 0, count = 0;
      for (const d of dates) {
        const score = localDayMap[d]?.[`${key}_score` as keyof LocalDay] as number | undefined
          ?? (apiCheckinMap[d] as any)?.[`${key}Score`];
        if (typeof score === "number") { sum += score; count++; }
      }
      return count > 0 ? (sum / count) : 0;
    };

    return {
      count: dates.length,
      autonomy: avg("autonomy"),
      competence: avg("competence"),
      relatedness: avg("relatedness"),
    };
  }, [currentMonth, allDates, localDayMap, apiCheckinMap]);

  const notInCurrentMonth = !isSameMonth(currentMonth, new Date());

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

          <div className="flex items-center gap-3">
            <span className="font-semibold text-base capitalize">
              {format(currentMonth, "LLLL yyyy", { locale: ru })}
            </span>
            {notInCurrentMonth && (
              <button
                onClick={() => { setCurrentMonth(new Date()); setSelectedDay(new Date()); }}
                className="text-xs font-medium text-primary hover:underline"
              >
                Сегодня
              </button>
            )}
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
              const hasCheckin = allDates.has(dateStr);
              const hasNoteFlag = hasNote(dateStr);
              const hasAnswersFlag = hasAnswers(dateStr);
              const hasDeepFlag = hasDeepDive(dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    if (!inMonth) return;
                    setSelectedDay(prev => prev && isSameDay(prev, day) ? null : day);
                  }}
                  className={clsx(
                    "relative flex flex-col items-center justify-center aspect-square rounded-2xl transition-all duration-200 text-sm font-medium mx-0.5",
                    !inMonth && "opacity-25 pointer-events-none",
                    isSelected && "bg-primary text-primary-foreground shadow-md",
                    !isSelected && isTodayDay && "border-2 border-primary text-primary",
                    !isSelected && !isTodayDay && hasCheckin && "bg-emerald-500/10 text-foreground hover:bg-emerald-500/20",
                    !isSelected && !isTodayDay && !hasCheckin && "text-foreground hover:bg-secondary",
                  )}
                >
                  <span className="leading-none">{format(day, "d")}</span>

                  {inMonth && (
                    <div className="flex items-center gap-0.5 mt-0.5 h-1.5">
                      {hasCheckin && !isSelected && (
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      )}
                      {(hasNoteFlag || hasAnswersFlag) && !isSelected && (
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
        <div className="flex items-center gap-4 px-5 pb-4 text-xs text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Чекин</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">📝</span>
            <span>Ответ/заметка</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary/60" />
            <span>Разбор</span>
          </div>
        </div>
      </div>

      {/* Month Stats */}
      {monthStats && (
        <div className="bg-card rounded-3xl p-5 shadow-sm border border-card-border">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3 capitalize">
            {format(currentMonth, "LLLL", { locale: ru })} — статистика
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Записей</span>
              <span className="font-semibold">{monthStats.count}</span>
            </div>
            <ScoreBar label="Автономия (avg)" value={parseFloat(monthStats.autonomy.toFixed(1))} colorClass={SPHERES.autonomy.colorClass} bgClass={SPHERES.autonomy.bgClass} />
            <ScoreBar label="Компетентность (avg)" value={parseFloat(monthStats.competence.toFixed(1))} colorClass={SPHERES.competence.colorClass} bgClass={SPHERES.competence.bgClass} />
            <ScoreBar label="Связанность (avg)" value={parseFloat(monthStats.relatedness.toFixed(1))} colorClass={SPHERES.relatedness.colorClass} bgClass={SPHERES.relatedness.bgClass} />
          </div>
        </div>
      )}

      {/* Day Detail Modal */}
      <AnimatePresence>
        {selectedDay && (
          <DayDetail
            key={format(selectedDay, "yyyy-MM-dd")}
            localDay={selectedLocal}
            apiCheckin={selectedApi}
            date={selectedDay}
            onClose={() => setSelectedDay(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
