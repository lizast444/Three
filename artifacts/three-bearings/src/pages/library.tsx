import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SPHERES, SOCRATIC_POOL } from "@/lib/constants";
import { BookOpen, ChevronDown, Feather } from "lucide-react";
import { clsx } from "clsx";
import { useGetLibraryNotes, useCreateLibraryNote, getGetLibraryNotesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

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
};

export default function LibraryPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<keyof typeof ALL_CATEGORIES>("autonomy");
  const [noteContent, setNoteContent] = useState("");

  const { data: notes, isLoading } = useGetLibraryNotes({ category: activeCategory as any });
  
  const createNote = useCreateLibraryNote({
    mutation: {
      onSuccess: () => {
        setNoteContent("");
        queryClient.invalidateQueries({ queryKey: getGetLibraryNotesQueryKey() });
        toast({ title: "Сохранено", description: "Размышление добавлено в библиотеку." });
      }
    }
  });

  const handleSaveNote = () => {
    if (!noteContent.trim()) return;
    createNote.mutate({
      data: { category: activeCategory as any, content: noteContent.trim() }
    });
  };

  return (
    <div className="flex flex-col space-y-8 pt-6 pb-12">
      <header className="space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl text-primary mb-2">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-serif font-medium text-foreground tracking-tight">Библиотека</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Сократовские вопросы для исследования ваших базовых потребностей.
        </p>
      </header>

      {/* Category Tabs */}
      <div className="flex space-x-2 overflow-x-auto pb-2 hide-scrollbar snap-x">
        {(Object.entries(ALL_CATEGORIES) as [keyof typeof ALL_CATEGORIES, typeof ALL_CATEGORIES[keyof typeof ALL_CATEGORIES]][]).map(([key, cat]) => {
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
              <span>{cat.label}</span>
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Questions List */}
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-card-border">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className={clsx("w-2 h-2 rounded-full mr-3", ALL_CATEGORIES[activeCategory].bgClass)} />
              Вопросы ({ALL_CATEGORIES[activeCategory].label})
            </h3>
            <div className="space-y-4">
              {SOCRATIC_POOL[activeCategory].map((q, i) => (
                <div key={i} className="p-4 bg-secondary/50 rounded-2xl border border-border/50 text-foreground font-serif leading-relaxed text-[1.05rem]">
                  {q}
                </div>
              ))}
            </div>
          </div>

          {/* New Note Form */}
          <div className="bg-card rounded-3xl p-6 shadow-sm border border-card-border space-y-4">
            <h3 className="font-semibold text-lg">Мои размышления</h3>
            <Textarea
              placeholder={`Запишите инсайт по сфере «${ALL_CATEGORIES[activeCategory].label.toLowerCase()}»...`}
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
                Сохранить заметку
              </Button>
            </div>
          </div>

          {/* History */}
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground animate-pulse">Загрузка истории...</div>
          ) : notes && notes.length > 0 ? (
            <div className="space-y-4 pt-4">
              <h3 className="font-semibold text-lg pl-2">Прошлые записи</h3>
              <div className="space-y-4">
                {notes.map((note) => (
                  <div key={note.id} className="bg-card p-5 rounded-3xl border border-card-border shadow-sm flex flex-col space-y-3">
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      {format(new Date(note.createdAt), "d MMMM yyyy", { locale: ru })}
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
              Здесь пока нет ваших записей для этой сферы.
            </div>
          )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
