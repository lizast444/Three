import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, MessageSquare, Save, ChevronRight, Check } from "lucide-react";
import { SPHERES, SOCRATIC_POOL, INSPIRATION_IDEAS } from "@/lib/constants";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clsx } from "clsx";

export default function CheckinPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const todayDate = format(new Date(), "yyyy-MM-dd");
  const displayDate = format(new Date(), "d MMMM, EEEE", { locale: ru });

  // API Hooks
  const { data: todayCheckin, isLoading: isFetching } = useGetTodayCheckin();
  const createCheckin = useCreateCheckin({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetTodayCheckinQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCheckinsQueryKey() });
        toast({
          title: "День сохранен",
          description: "Ваши размышления бережно записаны.",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось сохранить день. Попробуйте еще раз.",
        });
      }
    }
  });

  // State
  const [scores, setScores] = useState({ autonomy: 5, competence: 5, relatedness: 5 });
  const [sphereAnswers, setSphereAnswers] = useState({ autonomy: "", competence: "", relatedness: "" });
  const [note, setNote] = useState("");
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [microAction, setMicroAction] = useState("");
  const [microActionSphere, setMicroActionSphere] = useState<"autonomy" | "competence" | "relatedness" | "">("");
  const [deepDiveAnswers, setDeepDiveAnswers] = useState<Record<string, string>>({});
  
  // Local UI State for question rotation
  const [qIndices, setQIndices] = useState({ autonomy: 0, competence: 0, relatedness: 0 });
  const [ideasIndices, setIdeasIndices] = useState([0, 1, 2]);

  // Sync server data to local state
  useEffect(() => {
    if (todayCheckin) {
      setScores({
        autonomy: todayCheckin.autonomyScore,
        competence: todayCheckin.competenceScore,
        relatedness: todayCheckin.relatednessScore,
      });
      setNote(todayCheckin.note || "");
      setNoteTags(todayCheckin.noteTags || []);
      setMicroAction(todayCheckin.microAction || "");
      if (todayCheckin.microActionSphere) {
        setMicroActionSphere(todayCheckin.microActionSphere as any);
      }
      if (todayCheckin.deepDiveAnswers) {
        const dda = todayCheckin.deepDiveAnswers as Record<string, string>;
        setDeepDiveAnswers(dda);
        setSphereAnswers({
          autonomy: dda["autonomy_answer"] || "",
          competence: dda["competence_answer"] || "",
          relatedness: dda["relatedness_answer"] || "",
        });
      }
    }
  }, [todayCheckin]);

  const handleSave = () => {
    const mergedDeepDive = {
      ...deepDiveAnswers,
      autonomy_answer: sphereAnswers.autonomy,
      competence_answer: sphereAnswers.competence,
      relatedness_answer: sphereAnswers.relatedness,
    };
    createCheckin.mutate({
      data: {
        date: todayDate,
        autonomyScore: scores.autonomy,
        competenceScore: scores.competence,
        relatednessScore: scores.relatedness,
        note: note,
        noteTags: noteTags,
        microAction: microAction,
        microActionSphere: microActionSphere || null,
        deepDiveAnswers: mergedDeepDive,
      }
    });
  };

  const cycleQuestion = (sphere: keyof typeof SPHERES) => {
    setQIndices(prev => ({
      ...prev,
      [sphere]: (prev[sphere] + 1) % SOCRATIC_POOL[sphere].length
    }));
  };

  const cycleIdeas = (sphere: keyof typeof INSPIRATION_IDEAS) => {
    const poolSize = INSPIRATION_IDEAS[sphere].length;
    let next: number[] = [];
    while(next.length < 3) {
      let r = Math.floor(Math.random() * poolSize);
      if(next.indexOf(r) === -1) next.push(r);
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
        {(Object.entries(SPHERES) as [keyof typeof SPHERES, typeof SPHERES[keyof typeof SPHERES]][]).map(([key, sphere], idx) => {
          const Icon = sphere.icon;
          const question = SOCRATIC_POOL[key][qIndices[key]];
          const score = scores[key];

          return (
            <motion.div 
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, ease: "easeOut" }}
              className="bg-card rounded-3xl p-6 shadow-sm border border-card-border flex flex-col space-y-6 relative overflow-hidden group"
            >
              <div className={clsx("absolute top-0 left-0 w-1 h-full", sphere.bgClass)} />
              
              <div className="flex justify-between items-start gap-4">
                <div className="flex items-center space-x-3">
                  <div className={clsx("p-2 rounded-2xl", sphere.lightBgClass, sphere.colorClass)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-lg">{sphere.label}</h3>
                </div>
                <button 
                  onClick={() => cycleQuestion(key)}
                  className="p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary"
                  title="Другой вопрос"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[1.05rem] leading-relaxed font-serif text-foreground/90 italic pl-1">
                "{question}"
              </div>

              <Textarea
                placeholder="Мой ответ..."
                rows={3}
                className="resize-none bg-background/70 border-border/60 rounded-xl text-sm leading-relaxed placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-primary/30"
                value={sphereAnswers[key]}
                onChange={(e) => setSphereAnswers(prev => ({ ...prev, [key]: e.target.value }))}
              />

              <div className="space-y-3 pt-2">
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

              <div className="pt-2 flex justify-end">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-sm font-medium group-hover:bg-secondary/50">
                      <MessageSquare className="w-4 h-4 mr-2 opacity-70" />
                      Глубокий разбор
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border shadow-2xl rounded-3xl p-0 overflow-hidden">
                    <div className={clsx("h-2 w-full", sphere.bgClass)} />
                    <div className="p-6 space-y-6">
                      <DialogHeader>
                        <DialogTitle className="flex items-center space-x-3 text-xl">
                          <Icon className={clsx("w-5 h-5", sphere.colorClass)} />
                          <span>Разбор: {sphere.label}</span>
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-3 p-4 bg-secondary/50 rounded-2xl border border-border">
                          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Вопросы для размышления:</p>
                          <ul className="space-y-2">
                            {SOCRATIC_POOL[key].slice(0, 3).map((q, i) => (
                              <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                                <span className={clsx("mt-0.5", sphere.colorClass)}>•</span>
                                <span>{q}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-foreground">Ваши мысли</label>
                          <Textarea 
                            placeholder="Что вы чувствуете по поводу этой сферы сегодня?"
                            className="min-h-[120px] resize-none bg-card border-card-border rounded-xl focus-visible:ring-1 focus-visible:ring-primary/30"
                            value={deepDiveAnswers[key] || ""}
                            onChange={(e) => setDeepDiveAnswers(prev => ({ ...prev, [key]: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
          {(Object.entries(SPHERES) as [keyof typeof SPHERES, typeof SPHERES[keyof typeof SPHERES]][]).map(([k, s]) => {
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
            )
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
            if (val && INSPIRATION_IDEAS[val as keyof typeof INSPIRATION_IDEAS]) {
               cycleIdeas(val as keyof typeof INSPIRATION_IDEAS);
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
                    onClick={() => cycleIdeas(microActionSphere as keyof typeof INSPIRATION_IDEAS)}
                    className="flex items-center text-xs text-primary font-medium hover:underline"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" /> Другие идеи
                  </button>
                </div>
                <div className="space-y-2">
                  {ideasIndices.map(idx => {
                    const idea = INSPIRATION_IDEAS[microActionSphere as keyof typeof INSPIRATION_IDEAS][idx];
                    return (
                      <button
                        key={idx}
                        onClick={() => setMicroAction(idea)}
                        className="w-full text-left p-3 rounded-xl bg-background border border-border hover:border-primary/30 hover:shadow-sm transition-all text-sm group flex justify-between items-center"
                      >
                        <span className="pr-4">{idea}</span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </button>
                    )
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

      {/* Actions */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        className="pt-4 pb-8 flex flex-col space-y-3"
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
  );
}
