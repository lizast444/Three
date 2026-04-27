import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SPHERES } from "@/lib/constants";
import { LIBRARY_QUESTIONS_I18N } from "@/lib/i18n";
import { BookOpen, ChevronDown, Feather, Lightbulb } from "lucide-react";
import { clsx } from "clsx";
import { useGetLibraryNotes, useCreateLibraryNote, getGetLibraryNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useApp } from "@/contexts/app-context";

const ALL_CATEGORIES = {
  ...SPHERES,
  universal: {
    id: "universal",
    label: "Универсальные",
    icon: Feather,
    colorClass: "text-amber-600 dark:text-amber-400",
    bgClass: "bg-amber-600 dark:bg-amber-500",
    borderClass: "border-amber-500/30",
    lightBgClass: "bg-amber-500/10",
  }
} as const;

type CategoryKey = keyof typeof ALL_CATEGORIES;

function QuestionCard({
  question,
  hints,
  index,
  colorClass,
  bgClass,
  hintsLabel,
}: {
  question: string;
  hints: string[];
  index: number;
  colorClass: string;
  bgClass: string;
  hintsLabel: string;
}) {
  const [hintsOpen, setHintsOpen] = useState(false);

  return (
    <div className="bg-secondary/40 rounded-2xl border border-border/50 overflow-hidden">
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <span className={clsx("text-xs font-bold mt-1 shrink-0 w-5 text-right", colorClass)}>
            {index + 1}.
          </span>
          <p className="font-serif text-foreground/90 leading-relaxed text-[1.02rem]">
            {question}
          </p>
        </div>

        <div className="pl-8">
          <button
            onClick={() => setHintsOpen(!hintsOpen)}
            className={clsx(
              "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all",
              hintsOpen
                ? clsx("bg-background border border-border/60", colorClass)
                : "text-muted-foreground hover:text-foreground bg-background/60 hover:bg-background border border-transparent hover:border-border/40"
            )}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{hintsLabel}</span>
            <ChevronDown
              className={clsx("w-3 h-3 transition-transform duration-200", hintsOpen && "rotate-180")}
            />
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {hintsOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pl-12 space-y-2">
              {hints.map((hint, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted-foreground leading-relaxed"
                >
                  <span className={clsx("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0", bgClass)} />
                  <span>{hint}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LibraryPage() {
  const { toast } = useToast();
  const { T, lang } = useApp();
  const dateLocale = lang === "ru" ? ru : enUS;
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("autonomy");
  const [noteContent, setNoteContent] = useState("");

  const { data: notes, isLoading } = useGetLibraryNotes({ category: activeCategory as any });

  const createNote = useCreateLibraryNote({
    mutation: {
      onSuccess: () => {
        setNoteContent("");
        queryClient.invalidateQueries({ queryKey: getGetLibraryNotesQueryKey() });
        toast({ title: T.toast_deep_saved, description: T.toast_deep_saved_desc });
      }
    }
  });

  const handleSaveNote = () => {
    if (!noteContent.trim()) return;
    createNote.mutate({
      data: { category: activeCategory as any, content: noteContent.trim() }
    });
  };

  const activeCat = ALL_CATEGORIES[activeCategory];
  const questions = LIBRARY_QUESTIONS_I18N[lang][activeCategory] ?? [];

  const getCategoryLabel = (key: CategoryKey): string => {
    if (key === "universal") return T.library_universal;
    return T[`sphere_${key}` as keyof typeof T] as string;
  };
  const activeCatLabel = getCategoryLabel(activeCategory);

  return (
    <div className="flex flex-col space-y-8 pt-6 pb-12">
      <header className="space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl text-primary mb-2">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-serif font-medium text-foreground tracking-tight">{T.library_title}</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          {T.library_subtitle}
        </p>
      </header>

      {/* Category Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 hide-scrollbar snap-x">
        {(Object.entries(ALL_CATEGORIES) as [CategoryKey, typeof ALL_CATEGORIES[CategoryKey]][]).map(([key, cat]) => {
          const isActive = activeCategory === key;
          const Icon = cat.icon;
          return (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={clsx(
                "snap-start flex-shrink-0 flex items-center space-x-2 px-4 py-2.5 rounded-2xl font-medium transition-all duration-300 border text-sm",
                isActive
                  ? clsx(cat.bgClass, "text-white border-transparent shadow-md")
                  : "bg-card text-muted-foreground border-border hover:bg-secondary"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{getCategoryLabel(key)}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="space-y-6"
        >
          {/* Questions List */}
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-card-border space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className={clsx("w-2 h-2 rounded-full", activeCat.bgClass)} />
              {activeCatLabel}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                ({questions.length})
              </span>
            </h3>

            <div className="space-y-3">
              {questions.map((item, i) => (
                <QuestionCard
                  key={i}
                  index={i}
                  question={item.question}
                  hints={item.hints}
                  colorClass={activeCat.colorClass}
                  bgClass={activeCat.bgClass}
                  hintsLabel={T.library_hints}
                />
              ))}
            </div>
          </div>

          {/* New Note Form */}
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-card-border space-y-4">
            <h3 className="font-semibold text-lg">{T.library_saved_note}</h3>
            <Textarea
              placeholder={
                lang === "ru"
                  ? `Запишите инсайт по сфере «${activeCatLabel.toLowerCase()}»...`
                  : `Write an insight about "${activeCatLabel.toLowerCase()}"...`
              }
              className="min-h-[120px] bg-background border-border rounded-xl resize-none text-base placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary/30"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
            />
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSaveNote}
                disabled={!noteContent.trim() || createNote.isPending}
                className="rounded-xl px-6"
              >
                {T.save}
              </Button>
            </div>
          </div>

          {/* History */}
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground animate-pulse">…</div>
          ) : notes && notes.length > 0 ? (
            <div className="space-y-4 pt-4">
              <h3 className="font-semibold text-lg pl-2">{T.journal_title}</h3>
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="bg-card p-5 rounded-3xl border border-card-border shadow-sm flex flex-col space-y-3">
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      {format(new Date(note.createdAt), lang === "ru" ? "d MMMM yyyy" : "MMMM d, yyyy", { locale: dateLocale })}
                    </div>
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground/60 font-medium">
              {T.journal_no_answers}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
