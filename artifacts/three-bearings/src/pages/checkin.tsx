import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Save, ChevronRight, BookOpen, X } from "lucide-react";
import { SPHERES, SOCRATIC_POOL, INSPIRATION_IDEAS, LIBRARY_QUESTIONS } from "@/lib/constants";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clsx } from "clsx";

const POOL_SIZE = 3;

type SphereKey = keyof typeof SPHERES;

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

function loadDeepDiveFromStorage(date: string, sphere: SphereKey): Record<number, string> {
  try {
    const raw = localStorage.getItem(`tb_deep_${date}_${sphere}`);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveDeepDiveToStorage(date: string, sphere: SphereKey, answers: Record<number, string>) {
  localStorage.setItem(`tb_deep_${date}_${sphere}`, JSON.stringify(answers));
}

// ── Deep Dive Modal ──────────────────────────────────────────────────────────

function DeepDiveModal({
  sphere,
  date,
  onClose,
}: {
  sphere: SphereKey;
  date: string;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const config = SPHERES[sphere];
  const Icon = config.icon;
  const questions = LIBRARY_QUESTIONS[sphere] ?? [];

  const [answers, setAnswers] = useState<Record<number, string>>(() =>
    loadDeepDiveFromStorage(date, sphere)
  );

  const handleSave = () => {
    saveDeepDiveToStorage(date, sphere, answers);
    toast({ title: "Сохранено", description: "Ответы глубокого разбора записаны." });
    onClose();
  };

  const filledCount = Object.values(answers).filter(v => v.trim()).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full sm:max-w-lg bg-background rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh] overflow-hidden"
      >
        {/* Color stripe */}
        <div className={clsx("h-1.5 w-full shrink-0", config.bgClass)} />

        {/* Header */}
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
            {filledCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {filledCount}/{questions.length}
              </span>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Questions — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {questions.map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-start gap-2">
                <span className={clsx("text-xs font-bold mt-0.5 shrink-0", config.colorClass)}>
                  {i + 1}.
                </span>
                <p className="text-sm font-serif leading-relaxed text-foreground/90">
                  {item.question}
                </p>
              </div>
              <Textarea
                placeholder="Мой ответ..."
                rows={2}
                className="resize-none text-sm bg-secondary/40 border-border/50 rounded-xl placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/30"
                value={answers[i] ?? ""}
                onChange={(e) =>
                  setAnswers(prev => ({ ...prev, [i]: e.target.value }))
                }
              />
            </div>
          ))}
          <div className="h-2" />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 shrink-0 bg-background">
          <Button
            onClick={handleSave}
            className="w-full h-11 rounded-xl text-sm font-medium"
          >
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function CheckinPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const todayDate = format(new Date(), "yyyy-MM-dd");
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
        toast({ variant: "destructive", title: "Ошибка", description: "Не удалось сохранить день. Попробуйте еще раз." });
      }
    }
  });

  const [scores, setScores] = useState({ autonomy: 5, competence: 5, relatedness: 5 });
  const [sphereAnswers, setSphereAnswers] = useState<Record<SphereKey, string>>({
    autonomy: "", competence: "", relatedness: ""
  });
  const [note, setNote] = useState("");
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [microAction, setMicroAction] = useState("");
  const [microActionSphere, setMicroActionSphere] = useState<SphereKey | "">("");
  const [ideasIndices, setIdeasIndices] = useState([0, 1, 2]);
  const [deepDiveSphere, setDeepDiveSphere] = useState<SphereKey | null>(null);

  const [qIndices, setQIndices] = useState<Record<SphereKey, number>>(() =>
    getInitialIndices(todayDate)
  );
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!todayCheckin || dataLoaded) return;
    setDataLoaded(true);

    setScores({
      autonomy: todayCheckin.autonomyScore,
      competence: todayCheckin.competenceScore,
      relatedness: todayCheckin.relatednessScore,
    });
    setNote(todayCheckin.note || "");
    setNoteTags(todayCheckin.noteTags || []);
    setMicroAction(todayCheckin.microAction || "");
    if (todayCheckin.microActionSphere) {
      setMicroActionSphere(todayCheckin.microActionSphere as SphereKey);
    }

    if (todayCheckin.deepDiveAnswers) {
      const dda = todayCheckin.deepDiveAnswers as Record<string, string>;

      const findIdx = (sphere: SphereKey) => {
        const savedQ = dda[`${sphere}_question`];
        if (savedQ) {
          const idx = SOCRATIC_POOL[sphere].indexOf(savedQ);
          if (idx >= 0) return idx;
        }
        return qIndices[sphere];
      };

      setQIndices({
        autonomy: findIdx("autonomy"),
        competence: findIdx("competence"),
        relatedness: findIdx("relatedness"),
      });
      setSphereAnswers({
        autonomy: dda["autonomy_answer"] || "",
        competence: dda["competence_answer"] || "",
        relatedness: dda["relatedness_answer"] || "",
      });
    }
  }, [todayCheckin]);

  const handleSave = () => {
    const deepDiveAnswers = {
      autonomy_question: SOCRATIC_POOL.autonomy[qIndices.autonomy],
      autonomy_answer: sphereAnswers.autonomy,
      competence_question: SOCRATIC_POOL.competence[qIndices.competence],
      competence_answer: sphereAnswers.competence,
      relatedness_question: SOCRATIC_POOL.relatedness[qIndices.relatedness],
      relatedness_answer: sphereAnswers.relatedness,
    };
    createCheckin.mutate({
      data: {
        date: todayDate,
        autonomyScore: scores.autonomy,
        competenceScore: scores.competence,
        relatednessScore: scores.relatedness,
        note,
        noteTags,
        microAction,
        microActionSphere: microActionSphere || null,
        deepDiveAnswers,
      }
    });
  };

  const cycleQuestion = (sphere: SphereKey) => {
    const newIdx = (qIndices[sphere] + 1) % POOL_SIZE;
    setQIndices(prev => ({ ...prev, [sphere]: newIdx }));
    setSphereAnswers(prev => ({ ...prev, [sphere]: "" }));
    localStorage.setItem(`tb_q_${sphere}`, String(newIdx));
  };

  const cycleIdeas = (sphere: SphereKey) => {
    const poolSize = INSPIRATION_IDEAS[sphere].length;
    const next: number[] = [];
    while (next.length < 3) {
      const r = Math.floor(Math.random() * poolSize);
      if (!next.includes(r)) next.push(r);
    }
    setIdeasIndices(next);
  };

  const toggleTag = (sphereId: string) => {
    setNoteTags(prev =>
      prev.includes(sphereId) ? prev.filter(t => t !== sphereId) : [...prev, sphereId]
    );
  };

  if (isFetching) {
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
          <p className="text-muted-foreground text-sm font-medium tracking-wide">
            КАК ВЫ ЧУВСТВУЕТЕ СЕБЯ СЕГОДНЯ?
          </p>
        </header>

        {/* Sphere Cards */}
        <div className="space-y-6">
          {(Object.entries(SPHERES) as [SphereKey, typeof SPHERES[SphereKey]][]).map(([key, sphere], idx) => {
            const Icon = sphere.icon;
            const question = SOCRATIC_POOL[key][qIndices[key]];
            const score = scores[key];
            const deepDiveAnswers = loadDeepDiveFromStorage(todayDate, key);
            const deepDiveFilled = Object.values(deepDiveAnswers).filter(v => v.trim()).length;

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, ease: "easeOut" }}
                className="bg-card rounded-3xl p-6 shadow-sm border border-card-border flex flex-col space-y-5 relative overflow-hidden"
              >
                <div className={clsx("absolute top-0 left-0 w-1 h-full", sphere.bgClass)} />

                {/* Header */}
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

                {/* Question */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${key}-${qIndices[key]}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="text-[1.05rem] leading-relaxed font-serif text-foreground/90 italic pl-1"
                  >
                    "{question}"
                  </motion.div>
                </AnimatePresence>

                {/* Answer */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${key}-answer-${qIndices[key]}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: 0.05 }}
                  >
                    <Textarea
                      placeholder="Мой ответ..."
                      rows={3}
                      className="resize-none bg-background/70 border-border/60 rounded-xl text-sm leading-relaxed placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/30"
                      value={sphereAnswers[key]}
                      onChange={(e) => setSphereAnswers(prev => ({ ...prev, [key]: e.target.value }))}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Slider */}
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

                {/* Deep Dive */}
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
                    {deepDiveFilled > 0 && (
                      <span className={clsx("text-xs font-bold", sphere.colorClass)}>
                        {deepDiveFilled}
                      </span>
                    )}
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
                <button
                  key={k}
                  onClick={() => toggleTag(k)}
                  className={clsx(
                    "flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border",
                    isActive
                      ? clsx(s.bgClass, "text-white border-transparent shadow-sm")
                      : "bg-secondary text-muted-foreground border-transparent hover:border-border hover:bg-secondary/80"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Micro-Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-card rounded-3xl p-6 shadow-sm border border-card-border space-y-5"
        >
          <div className="space-y-1">
            <h3 className="font-semibold text-lg">Что я могу изменить завтра?</h3>
            <p className="text-sm text-muted-foreground">Микро-действие для одной из сфер</p>
          </div>

          <Select
            value={microActionSphere}
            onValueChange={(val: any) => {
              setMicroActionSphere(val);
              if (val && INSPIRATION_IDEAS[val as SphereKey]) {
                cycleIdeas(val as SphereKey);
              }
            }}
          >
            <SelectTrigger className="w-full bg-background border-border rounded-xl h-12">
              <SelectValue placeholder="Выберите сферу для фокуса" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {Object.entries(SPHERES).map(([k, s]) => (
                <SelectItem key={k} value={k} className="py-3 cursor-pointer">
                  <div className="flex items-center space-x-2">
                    <s.icon className={clsx("w-4 h-4", s.colorClass)} />
                    <span>{s.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <AnimatePresence>
            {microActionSphere && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-2 overflow-hidden"
              >
                <div className="bg-secondary/50 rounded-2xl p-4 border border-border">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Идеи для вдохновения</span>
                    <button
                      onClick={() => cycleIdeas(microActionSphere as SphereKey)}
                      className="flex items-center text-xs text-primary font-medium hover:underline"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" /> Другие идеи
                    </button>
                  </div>
                  <div className="space-y-2">
                    {ideasIndices.map(i => {
                      const idea = INSPIRATION_IDEAS[microActionSphere as SphereKey][i];
                      return (
                        <button
                          key={i}
                          onClick={() => setMicroAction(idea)}
                          className="w-full text-left p-3 rounded-xl bg-background border border-border hover:border-primary/30 hover:shadow-sm transition-all text-sm group flex justify-between items-center"
                        >
                          <span className="pr-4">{idea}</span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Textarea
                  placeholder="Моё действие на завтра..."
                  className="min-h-[100px] bg-background border-border rounded-xl resize-none focus-visible:ring-1 focus-visible:ring-primary/30"
                  value={microAction}
                  onChange={(e) => setMicroAction(e.target.value)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Save */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="pt-4 pb-8"
        >
          <Button
            onClick={handleSave}
            disabled={createCheckin.isPending}
            className="w-full h-14 rounded-2xl text-base font-medium shadow-md hover:shadow-lg transition-all"
          >
            {createCheckin.isPending ? (
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            Сохранить день
          </Button>
        </motion.div>
      </div>

      {/* Deep Dive Modal */}
      <AnimatePresence>
        {deepDiveSphere && (
          <DeepDiveModal
            sphere={deepDiveSphere}
            date={todayDate}
            onClose={() => setDeepDiveSphere(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
