import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { format, subDays } from "date-fns";
import { ru } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Save, ChevronRight, BookOpen, X, List, Plus, Trash2, CheckCheck } from "lucide-react";
import { SPHERES, LIBRARY_QUESTIONS } from "@/lib/constants";
import { SOCRATIC_POOL_I18N, INSPIRATION_IDEAS_I18N } from "@/lib/i18n";
import { useApp } from "@/contexts/app-context";
import {
  useGetTodayCheckin,
  useCreateCheckin,
  getGetTodayCheckinQueryKey,
  getGetCheckinsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";

const POOL_SIZE = 3;
type SphereKey = keyof typeof SPHERES;

export type QAnswer = { question: string; answer: string };
export type MicroActionEntry = { sphere: SphereKey; action: string };

// ── LocalStorage helpers ──────────────────────────────────────────────────────

function getInitialIndices(todayDate: string): Record<SphereKey, number> {
  const storedDate = localStorage.getItem("tb_date") ?? "";
  const stored = {
    autonomy: parseInt(localStorage.getItem("tb_q_autonomy") ?? "2"),
    competence: parseInt(localStorage.getItem("tb_q_competence") ?? "2"),
    relatedness: parseInt(localStorage.getItem("tb_q_relatedness") ?? "2"),
  };
  if (storedDate === todayDate) return stored;
  const advanced = {
    autonomy: (stored.autonomy + 1) % POOL_SIZE,
    competence: (stored.competence + 1) % POOL_SIZE,
    relatedness: (stored.relatedness + 1) % POOL_SIZE,
  };
  localStorage.setItem("tb_date", todayDate);
  localStorage.setItem("tb_q_autonomy", String(advanced.autonomy));
  localStorage.setItem("tb_q_competence", String(advanced.competence));
  localStorage.setItem("tb_q_relatedness", String(advanced.relatedness));
  return advanced;
}

function loadDayRecord(date: string): Record<string, unknown> | null {
  try {
    const days: any[] = JSON.parse(localStorage.getItem("tb_days") ?? "[]");
    return days.find(d => d.date === date) ?? null;
  } catch { return null; }
}

function saveDayRecord(record: Record<string, unknown>) {
  let days: any[] = [];
  try { days = JSON.parse(localStorage.getItem("tb_days") ?? "[]"); } catch {}
  const idx = days.findIndex((d: any) => d.date === record.date);
  if (idx >= 0) days[idx] = record;
  else days.push(record);
  localStorage.setItem("tb_days", JSON.stringify(days));
}

function loadDeepDiveFromStorage(date: string, sphere: SphereKey): Record<number, string> {
  try {
    const raw = localStorage.getItem(`tb_deep_${date}_${sphere}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveDeepDiveToStorage(date: string, sphere: SphereKey, answers: Record<number, string>) {
  localStorage.setItem(`tb_deep_${date}_${sphere}`, JSON.stringify(answers));
}

function buildAnswersArray(pool: string[], qAnswers: Record<number, string>): QAnswer[] {
  return Object.entries(qAnswers)
    .filter(([, v]) => v.trim())
    .map(([idxStr, answer]) => ({
      question: pool[parseInt(idxStr)] ?? "",
      answer,
    }));
}

function restoreQAnswers(pool: string[], arr: QAnswer[]): Record<number, string> {
  const result: Record<number, string> = {};
  for (const { question, answer } of arr) {
    const idx = pool.indexOf(question);
    if (idx >= 0) result[idx] = answer;
  }
  return result;
}

// ── All Answers Modal ─────────────────────────────────────────────────────────

function AllAnswersModal({ sphere, qAnswers, onClose }: {
  sphere: SphereKey; qAnswers: Record<number, string>; onClose: () => void;
}) {
  const config = SPHERES[sphere];
  const Icon = config.icon;
  const pool = SOCRATIC_POOL[sphere];
  const filled = Object.entries(qAnswers)
    .filter(([, v]) => v.trim())
    .map(([idxStr, answer]) => ({ idx: parseInt(idxStr), question: pool[parseInt(idxStr)] ?? "", answer }));

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[85dvh] overflow-hidden"
      >
        <div className={clsx("h-1.5 w-full shrink-0", config.bgClass)} />
        <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className={clsx("p-2 rounded-xl", config.lightBgClass, config.colorClass)}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-base leading-tight">Ответы за сегодня</h2>
              <p className={clsx("text-xs font-medium", config.colorClass)}>{config.label}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {filled.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">Нет ответов за сегодня</p>
          ) : filled.map(({ idx, question, answer }) => (
            <div key={idx} className="space-y-2">
              <p className="text-sm font-serif italic text-foreground/80 leading-relaxed">"{question}"</p>
              <p className="text-sm text-foreground leading-relaxed bg-secondary/40 rounded-xl px-4 py-3 whitespace-pre-wrap">{answer}</p>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-border/50 shrink-0">
          <Button variant="outline" onClick={onClose} className="w-full rounded-xl h-10">Закрыть</Button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

// ── Deep Dive Modal ───────────────────────────────────────────────────────────

function DeepDiveModal({ sphere, date, onClose }: {
  sphere: SphereKey; date: string; onClose: () => void;
}) {
  const { toast } = useToast();
  const config = SPHERES[sphere];
  const Icon = config.icon;
  const questions = LIBRARY_QUESTIONS[sphere] ?? [];
  const [answers, setAnswers] = useState<Record<number, string>>(() => loadDeepDiveFromStorage(date, sphere));
  const filledCount = Object.values(answers).filter(v => v.trim()).length;

  const handleSave = () => {
    saveDeepDiveToStorage(date, sphere, answers);
    toast({ title: "Сохранено", description: "Ответы глубокого разбора записаны." });
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden"
      >
        <div className={clsx("h-1.5 w-full shrink-0", config.bgClass)} />
        <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className={clsx("p-2 rounded-xl", config.lightBgClass, config.colorClass)}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-base leading-tight">Глубокий разбор</h2>
              <p className={clsx("text-xs font-medium", config.colorClass)}>{config.label}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {filledCount > 0 && <span className="text-xs text-muted-foreground">{filledCount}/{questions.length}</span>}
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {questions.map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-start gap-2">
                <span className={clsx("text-xs font-bold mt-0.5 shrink-0", config.colorClass)}>{i + 1}.</span>
                <p className="text-sm font-serif leading-relaxed text-foreground/90">{item.question}</p>
              </div>
              <Textarea
                placeholder="Мой ответ..."
                rows={2}
                className="resize-none text-sm bg-secondary/40 border-border/50 rounded-xl placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/30"
                value={answers[i] ?? ""}
                onChange={(e) => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
              />
            </div>
          ))}
          <div className="h-2" />
        </div>
        <div className="px-6 py-4 border-t border-border/50 shrink-0 bg-background">
          <Button onClick={handleSave} className="w-full h-11 rounded-xl text-sm font-medium">
            <Save className="w-4 h-4 mr-2" />Сохранить
          </Button>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CheckinPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const todayDate = format(new Date(), "yyyy-MM-dd");
  const yesterdayDate = format(subDays(new Date(), 1), "yyyy-MM-dd");
  const displayDate = format(new Date(), "d MMMM, EEEE", { locale: ru });

  const { data: todayCheckin, isLoading: isFetching } = useGetTodayCheckin();
  const createCheckin = useCreateCheckin({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTodayCheckinQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCheckinsQueryKey() });
        toast({ title: "День сохранен", description: "Ваши размышления бережно записаны." });
      },
      onError: () => {
        toast({ variant: "destructive", title: "Ошибка", description: "Не удалось сохранить день." });
      }
    }
  });

  const [scores, setScores] = useState({ autonomy: 5, competence: 5, relatedness: 5 });
  const [note, setNote] = useState("");
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [yesterdayReview, setYesterdayReview] = useState("");
  const [microActions, setMicroActions] = useState<MicroActionEntry[]>([]);

  // Multi-sphere micro-action ideas (per sphere)
  const [ideasIndices, setIdeasIndices] = useState<Record<SphereKey, number[]>>({
    autonomy: [0, 1, 2], competence: [0, 1, 2], relatedness: [0, 1, 2],
  });

  // Yesterday's micro-actions (read once, displayed as context)
  const yesterdayRecord = loadDayRecord(yesterdayDate);
  const yesterdayActions: MicroActionEntry[] = (() => {
    if (!yesterdayRecord) return [];
    const arr = yesterdayRecord.micro_actions as MicroActionEntry[] | undefined;
    if (arr && arr.length > 0) return arr;
    if (yesterdayRecord.micro_action && yesterdayRecord.micro_action_sphere) {
      return [{ sphere: yesterdayRecord.micro_action_sphere as SphereKey, action: yesterdayRecord.micro_action as string }];
    }
    return [];
  })();

  const [sphereQAnswers, setSphereQAnswers] = useState<Record<SphereKey, Record<number, string>>>({
    autonomy: {}, competence: {}, relatedness: {}
  });
  const [qIndices, setQIndices] = useState<Record<SphereKey, number>>(() => getInitialIndices(todayDate));
  const [allAnswersModal, setAllAnswersModal] = useState<SphereKey | null>(null);
  const [deepDiveSphere, setDeepDiveSphere] = useState<SphereKey | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (dataLoaded) return;

    const localDay = loadDayRecord(todayDate);
    if (localDay) {
      setDataLoaded(true);
      setScores({
        autonomy: (localDay.autonomy_score as number) ?? 5,
        competence: (localDay.competence_score as number) ?? 5,
        relatedness: (localDay.relatedness_score as number) ?? 5,
      });
      setNote((localDay.note as string) ?? "");
      setNoteTags((localDay.note_tags as string[]) ?? []);
      setYesterdayReview((localDay.yesterday_review as string) ?? "");

      // Restore micro actions (new format first, then old)
      const savedMicroActions = localDay.micro_actions as MicroActionEntry[] | undefined;
      if (savedMicroActions && savedMicroActions.length > 0) {
        setMicroActions(savedMicroActions);
      } else if (localDay.micro_action && localDay.micro_action_sphere) {
        setMicroActions([{ sphere: localDay.micro_action_sphere as SphereKey, action: localDay.micro_action as string }]);
      }

      const restoreAll = (sphere: SphereKey, key: string) =>
        restoreQAnswers(SOCRATIC_POOL[sphere], (localDay[key] as QAnswer[]) ?? []);
      const restored = {
        autonomy: restoreAll("autonomy", "autonomy_answers"),
        competence: restoreAll("competence", "competence_answers"),
        relatedness: restoreAll("relatedness", "relatedness_answers"),
      };
      setSphereQAnswers(restored);

      const findBestIdx = (sphere: SphereKey, qa: Record<number, string>) => {
        const answered = Object.keys(qa).map(Number).filter(i => qa[i]?.trim());
        return answered.length > 0 ? answered[answered.length - 1] : qIndices[sphere];
      };
      setQIndices({
        autonomy: findBestIdx("autonomy", restored.autonomy),
        competence: findBestIdx("competence", restored.competence),
        relatedness: findBestIdx("relatedness", restored.relatedness),
      });
      return;
    }

    if (!todayCheckin) return;
    setDataLoaded(true);
    setScores({
      autonomy: todayCheckin.autonomyScore,
      competence: todayCheckin.competenceScore,
      relatedness: todayCheckin.relatednessScore,
    });
    setNote(todayCheckin.note ?? "");
    setNoteTags(todayCheckin.noteTags ?? []);
    if (todayCheckin.microAction && todayCheckin.microActionSphere) {
      setMicroActions([{ sphere: todayCheckin.microActionSphere as SphereKey, action: todayCheckin.microAction }]);
    }
    if (todayCheckin.deepDiveAnswers) {
      const dda = todayCheckin.deepDiveAnswers as Record<string, unknown>;
      const savedReview = dda["yesterday_review"] as string | undefined;
      if (savedReview) setYesterdayReview(savedReview);

      const savedMicroActions = dda["micro_actions"] as MicroActionEntry[] | undefined;
      if (savedMicroActions?.length) setMicroActions(savedMicroActions);

      const restoreFromDda = (sphere: SphereKey): Record<number, string> => {
        const arr = dda[`${sphere}_answers`] as QAnswer[] | undefined;
        if (arr?.length) return restoreQAnswers(SOCRATIC_POOL[sphere], arr);
        const q = dda[`${sphere}_question`] as string | undefined;
        const a = dda[`${sphere}_answer`] as string | undefined;
        if (q) { const idx = SOCRATIC_POOL[sphere].indexOf(q); if (idx >= 0 && a) return { [idx]: a }; }
        return {};
      };
      setSphereQAnswers({
        autonomy: restoreFromDda("autonomy"),
        competence: restoreFromDda("competence"),
        relatedness: restoreFromDda("relatedness"),
      });
    }
  }, [todayCheckin, dataLoaded]);

  const handleSave = () => {
    const buildArr = (sphere: SphereKey) =>
      buildAnswersArray(SOCRATIC_POOL[sphere], sphereQAnswers[sphere]);

    const primaryAction = microActions[0] ?? null;

    saveDayRecord({
      date: todayDate,
      autonomy_score: scores.autonomy,
      autonomy_answers: buildArr("autonomy"),
      competence_score: scores.competence,
      competence_answers: buildArr("competence"),
      relatedness_score: scores.relatedness,
      relatedness_answers: buildArr("relatedness"),
      note,
      note_tags: noteTags,
      yesterday_review: yesterdayReview,
      micro_actions: microActions,
      // Keep legacy fields for API compat
      micro_action: primaryAction?.action ?? "",
      micro_action_sphere: primaryAction?.sphere ?? "",
    });

    createCheckin.mutate({
      data: {
        date: todayDate,
        autonomyScore: scores.autonomy,
        competenceScore: scores.competence,
        relatednessScore: scores.relatedness,
        note,
        noteTags,
        microAction: primaryAction?.action ?? null,
        microActionSphere: primaryAction?.sphere ?? null,
        deepDiveAnswers: {
          autonomy_answers: buildArr("autonomy"),
          competence_answers: buildArr("competence"),
          relatedness_answers: buildArr("relatedness"),
          yesterday_review: yesterdayReview,
          micro_actions: microActions,
        },
      }
    });
  };

  const cycleQuestion = (sphere: SphereKey) => {
    const newIdx = (qIndices[sphere] + 1) % POOL_SIZE;
    setQIndices(prev => ({ ...prev, [sphere]: newIdx }));
    localStorage.setItem(`tb_q_${sphere}`, String(newIdx));
  };

  const updateAnswer = (sphere: SphereKey, idx: number, text: string) => {
    setSphereQAnswers(prev => ({ ...prev, [sphere]: { ...prev[sphere], [idx]: text } }));
  };

  const cycleIdeasForSphere = (sphere: SphereKey) => {
    const poolSize = INSPIRATION_IDEAS[sphere].length;
    const next: number[] = [];
    while (next.length < 3) {
      const r = Math.floor(Math.random() * poolSize);
      if (!next.includes(r)) next.push(r);
    }
    setIdeasIndices(prev => ({ ...prev, [sphere]: next }));
  };

  const addSphereToMicroActions = (sphere: SphereKey) => {
    if (microActions.some(ma => ma.sphere === sphere)) return;
    setMicroActions(prev => [...prev, { sphere, action: "" }]);
    cycleIdeasForSphere(sphere);
  };

  const removeSphereFromMicroActions = (sphere: SphereKey) => {
    setMicroActions(prev => prev.filter(ma => ma.sphere !== sphere));
  };

  const updateMicroActionText = (sphere: SphereKey, text: string) => {
    setMicroActions(prev => prev.map(ma => ma.sphere === sphere ? { ...ma, action: text } : ma));
  };

  const toggleTag = (sphereId: string) => {
    setNoteTags(prev => prev.includes(sphereId) ? prev.filter(t => t !== sphereId) : [...prev, sphereId]);
  };

  const addedSpheres = new Set(microActions.map(ma => ma.sphere));
  const availableSpheres = (Object.keys(SPHERES) as SphereKey[]).filter(k => !addedSpheres.has(k));

  if (isFetching && !dataLoaded) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col space-y-8 pt-6 pb-12">
        <header className="flex flex-col items-center justify-center text-center space-y-1 mb-4">
          <motion.h1
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-serif font-medium text-foreground tracking-tight capitalize"
          >
            {displayDate}
          </motion.h1>
          <p className="text-muted-foreground text-sm font-medium tracking-wide">КАК ВЫ ЧУВСТВУЕТЕ СЕБЯ СЕГОДНЯ?</p>
        </header>

        {/* Yesterday review — only if yesterday had plans */}
        {yesterdayActions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-card rounded-3xl p-6 shadow-sm border border-card-border space-y-4 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-400/70 rounded-l-3xl" />
            <div className="flex items-center gap-2 mb-1">
              <CheckCheck className="w-5 h-5 text-amber-500" />
              <h3 className="font-semibold text-base">Что сработало вчера?</h3>
            </div>

            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Вчера вы планировали:</p>
            <div className="flex flex-wrap gap-2">
              {yesterdayActions.map((ma, i) => {
                const s = SPHERES[ma.sphere];
                if (!s) return null;
                const Icon = s.icon;
                return (
                  <div key={i} className={clsx("flex items-start gap-2 px-3 py-2 rounded-xl text-sm w-full border", s.lightBgClass, s.borderClass)}>
                    <Icon className={clsx("w-4 h-4 mt-0.5 shrink-0", s.colorClass)} />
                    <span className="text-foreground/90 leading-snug">{ma.action}</span>
                  </div>
                );
              })}
            </div>

            <Textarea
              placeholder="Что из этого получилось? Как оно повлияло на вас?"
              rows={3}
              className="resize-none bg-background/70 border-border/60 rounded-xl text-sm leading-relaxed placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-amber-400/40"
              value={yesterdayReview}
              onChange={(e) => setYesterdayReview(e.target.value)}
            />
          </motion.div>
        )}

        {/* Sphere Cards */}
        <div className="space-y-6">
          {(Object.entries(SPHERES) as [SphereKey, typeof SPHERES[SphereKey]][]).map(([key, sphere], idx) => {
            const Icon = sphere.icon;
            const question = SOCRATIC_POOL[key][qIndices[key]];
            const score = scores[key];
            const currentAnswer = sphereQAnswers[key][qIndices[key]] ?? "";
            const answeredCount = Object.values(sphereQAnswers[key]).filter(v => v.trim()).length;
            const deepDiveFilled = Object.values(loadDeepDiveFromStorage(todayDate, key)).filter(v => v.trim()).length;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, ease: "easeOut" }}
                className="bg-card rounded-3xl p-6 shadow-sm border border-card-border flex flex-col space-y-5 relative overflow-hidden"
              >
                <div className={clsx("absolute top-0 left-0 w-1 h-full", sphere.bgClass)} />

                <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center space-x-3">
                    <div className={clsx("p-2 rounded-2xl", sphere.lightBgClass, sphere.colorClass)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-lg">{sphere.label}</h3>
                  </div>
                  <button
                    onClick={() => cycleQuestion(key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground transition-colors hover:bg-secondary border border-transparent hover:border-border/40"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Другой вопрос</span>
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${key}-${qIndices[key]}`}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="text-[1.05rem] leading-relaxed font-serif text-foreground/90 italic pl-1"
                  >
                    "{question}"
                  </motion.div>
                </AnimatePresence>

                <Textarea
                  key={`${key}-answer-${qIndices[key]}`}
                  placeholder="Мой ответ..."
                  rows={3}
                  className="resize-none bg-background/70 border-border/60 rounded-xl text-sm leading-relaxed placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/30"
                  value={currentAnswer}
                  onChange={(e) => updateAnswer(key, qIndices[key], e.target.value)}
                />

                {answeredCount > 0 && (
                  <button
                    onClick={() => setAllAnswersModal(key)}
                    className={clsx(
                      "flex items-center gap-1.5 text-xs font-medium self-start px-3 py-1.5 rounded-xl transition-all border",
                      sphere.lightBgClass, sphere.colorClass, sphere.borderClass
                    )}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Все ответы ({answeredCount})</span>
                  </button>
                )}

                <div className="space-y-3 pt-1">
                  <div className="flex justify-between items-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <span>Совсем нет</span>
                    <span className={clsx("text-base font-bold", sphere.colorClass)}>{score}</span>
                    <span>Полностью</span>
                  </div>
                  <Slider
                    value={[score]}
                    max={10}
                    step={1}
                    onValueChange={(val) => setScores(s => ({ ...s, [key]: val[0] }))}
                    className="py-2 cursor-pointer"
                  />
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => setDeepDiveSphere(key)}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border",
                      deepDiveFilled > 0
                        ? clsx(sphere.lightBgClass, sphere.colorClass, sphere.borderClass)
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary border-transparent hover:border-border/40"
                    )}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Глубокий разбор</span>
                    {deepDiveFilled > 0 && <span className={clsx("text-xs font-bold", sphere.colorClass)}>{deepDiveFilled}</span>}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Note of the Day */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-card rounded-3xl p-6 shadow-sm border border-card-border space-y-4"
        >
          <h3 className="font-semibold text-lg">Заметка дня</h3>
          <Textarea
            placeholder="Что было важного сегодня? Событие, мысль, состояние..."
            className="min-h-[120px] bg-background border-border rounded-xl resize-none text-base leading-relaxed placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary/30"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-xs font-medium text-muted-foreground py-1.5 mr-1 uppercase tracking-wider">Теги:</span>
            {(Object.entries(SPHERES) as [SphereKey, typeof SPHERES[SphereKey]][]).map(([k, s]) => {
              const isActive = noteTags.includes(k);
              const Icon = s.icon;
              return (
                <button key={k} onClick={() => toggleTag(k)}
                  className={clsx(
                    "flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                    isActive ? clsx(s.bgClass, "text-white border-transparent shadow-sm") : "bg-secondary text-muted-foreground border-transparent hover:border-border hover:bg-secondary/80"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Multi-Sphere Micro-Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-card rounded-3xl p-6 shadow-sm border border-card-border space-y-5"
        >
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">Что я могу изменить завтра?</h3>
            <p className="text-sm text-muted-foreground">Выберите одну или несколько сфер для фокуса</p>
          </div>

          {/* Added sphere actions */}
          <div className="space-y-4">
            {microActions.map((ma) => {
              const sphere = SPHERES[ma.sphere];
              const Icon = sphere.icon;
              const ideas = ideasIndices[ma.sphere];
              return (
                <motion.div
                  key={ma.sphere}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  {/* Sphere header */}
                  <div className="flex items-center justify-between">
                    <div className={clsx("flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium", sphere.lightBgClass, sphere.colorClass)}>
                      <Icon className="w-4 h-4" />
                      <span>{sphere.label}</span>
                    </div>
                    <button
                      onClick={() => removeSphereFromMicroActions(ma.sphere)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Ideas */}
                  <div className="bg-secondary/50 rounded-2xl p-3 border border-border/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Идеи</span>
                      <button onClick={() => cycleIdeasForSphere(ma.sphere)} className="flex items-center text-xs text-primary font-medium hover:underline">
                        <RefreshCw className="w-3 h-3 mr-1" /> Другие
                      </button>
                    </div>
                    {ideas.map(i => {
                      const idea = INSPIRATION_IDEAS[ma.sphere][i];
                      return (
                        <button key={i} onClick={() => updateMicroActionText(ma.sphere, idea)}
                          className="w-full text-left p-2.5 rounded-xl bg-background border border-border hover:border-primary/30 hover:shadow-sm transition-all text-sm group flex justify-between items-center"
                        >
                          <span className="pr-4 leading-snug">{idea}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>

                  <Textarea
                    placeholder={`Моё действие для ${sphere.label.toLowerCase()}...`}
                    className="min-h-[80px] bg-background border-border rounded-xl resize-none focus-visible:ring-1 focus-visible:ring-primary/30 text-sm"
                    value={ma.action}
                    onChange={(e) => updateMicroActionText(ma.sphere, e.target.value)}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Add sphere buttons */}
          {availableSpheres.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {availableSpheres.map(key => {
                const s = SPHERES[key];
                const Icon = s.icon;
                return (
                  <button
                    key={key}
                    onClick={() => addSphereToMicroActions(key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary border border-dashed border-border/60 hover:border-border transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <Icon className="w-3.5 h-3.5" />
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Save */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="pt-4 pb-8">
          <Button
            onClick={handleSave}
            disabled={createCheckin.isPending}
            className="w-full h-14 rounded-2xl text-base font-medium shadow-md hover:shadow-lg transition-all"
          >
            {createCheckin.isPending ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
            Сохранить день
          </Button>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {allAnswersModal && (
          <AllAnswersModal
            key="all-answers"
            sphere={allAnswersModal}
            qAnswers={sphereQAnswers[allAnswersModal]}
            onClose={() => setAllAnswersModal(null)}
          />
        )}
        {deepDiveSphere && (
          <DeepDiveModal
            key="deep-dive"
            sphere={deepDiveSphere}
            date={todayDate}
            onClose={() => setDeepDiveSphere(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
