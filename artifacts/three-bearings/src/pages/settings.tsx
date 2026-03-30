import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Bell, Download, Upload, Trash2, Info,
  Wind, Anchor, Users, CheckCircle2, AlertTriangle, Save,
  FileJson, CalendarDays, X, Sun, Moon, Languages
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useApp } from "@/contexts/app-context";
import type { Lang } from "@/lib/i18n";

const LS_REMINDER_ENABLED = "tb_reminder_enabled";
const LS_REMINDER_TIME    = "tb_reminder_time";

// ── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        "relative inline-flex w-11 h-6 items-center rounded-full transition-colors duration-300 focus:outline-none",
        checked ? "bg-primary" : "bg-border"
      )}
    >
      <motion.span
        animate={{ x: checked ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="inline-block w-5 h-5 bg-white rounded-full shadow"
      />
    </button>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────────────

function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("bg-card rounded-3xl shadow-sm border border-card-border overflow-hidden", className)}>
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/50">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">{title}</h2>
    </div>
  );
}

function Row({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("flex items-center justify-between px-5 py-4", className)}>
      {children}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { T, theme, setTheme, lang, setLang } = useApp();

  // ── Reminder state ──────────────────────────────────────────────────────
  const [reminderEnabled, setReminderEnabled] = useState(() =>
    localStorage.getItem(LS_REMINDER_ENABLED) === "true"
  );
  const [reminderTime, setReminderTime] = useState(() =>
    localStorage.getItem(LS_REMINDER_TIME) ?? "21:00"
  );
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // schedule reminder check
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (!reminderEnabled || notifPermission !== "granted") return;

    const check = () => {
      const now = new Date();
      const [hh, mm] = reminderTime.split(":").map(Number);
      if (now.getHours() === hh && now.getMinutes() === mm && now.getSeconds() < 60) {
        new Notification("Three Bearings", {
          body: lang === "ru" ? "Время для ежедневного размышления ✨" : "Time for your daily reflection ✨",
          icon: "/favicon.ico",
        });
      }
    };

    timerRef.current = setInterval(check, 60_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [reminderEnabled, reminderTime, notifPermission, lang]);

  const handleSaveReminder = async () => {
    if (reminderEnabled) {
      if (notifPermission === "unsupported") {
        toast({ variant: "destructive", title: T.toast_error, description: lang === "ru" ? "Ваш браузер не поддерживает уведомления." : "Your browser doesn't support notifications." });
        return;
      }
      if (notifPermission !== "granted") {
        const result = await Notification.requestPermission();
        setNotifPermission(result);
        if (result !== "granted") {
          toast({ variant: "destructive", title: T.toast_error, description: T.settings_reminders_denied });
          return;
        }
      }
    }

    localStorage.setItem(LS_REMINDER_ENABLED, String(reminderEnabled));
    localStorage.setItem(LS_REMINDER_TIME, reminderTime);
    toast({ title: T.toast_reminder_saved, description: reminderEnabled ? `${lang === "ru" ? "Напоминание установлено на" : "Reminder set for"} ${reminderTime}` : (lang === "ru" ? "Напоминания отключены." : "Reminders disabled.") });
  };

  // ── Import ──────────────────────────────────────────────────────────────
  const importInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<{
    data: Record<string, unknown>;
    newDays: number;
    updatedDays: number;
    totalDays: number;
  } | null>(null);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (typeof data !== "object" || !data || Array.isArray(data)) throw new Error();

        const importedDays: any[] = Array.isArray(data["tb_days"]) ? data["tb_days"] : [];
        const existingDays: any[] = (() => {
          try { return JSON.parse(localStorage.getItem("tb_days") ?? "[]"); } catch { return []; }
        })();
        const existingMap = new Map(existingDays.map((d: any) => [d.date, d]));

        let newDays = 0;
        let updatedDays = 0;
        for (const d of importedDays) {
          if (!existingMap.has(d.date)) newDays++;
          else updatedDays++;
        }

        setImportPreview({ data, newDays, updatedDays, totalDays: importedDays.length });
      } catch {
        toast({ variant: "destructive", title: T.toast_import_file_error, description: T.toast_import_file_error_desc });
      }
    };
    reader.readAsText(file);
  };

  const handleImportConfirm = () => {
    if (!importPreview) return;
    try {
      const { data } = importPreview;
      const importedDays: any[] = Array.isArray(data["tb_days"]) ? data["tb_days"] : [];
      const existingDays: any[] = (() => {
        try { return JSON.parse(localStorage.getItem("tb_days") ?? "[]"); } catch { return []; }
      })();

      const mergedMap = new Map<string, any>();
      for (const d of existingDays) mergedMap.set(d.date, d);
      for (const d of importedDays) mergedMap.set(d.date, d);
      const mergedDays = Array.from(mergedMap.values()).sort((a, b) => a.date.localeCompare(b.date));

      for (const [key, value] of Object.entries(data)) {
        if (key === "tb_days") continue;
        localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
      }
      localStorage.setItem("tb_days", JSON.stringify(mergedDays));

      toast({
        title: T.toast_import_done,
        description: `${lang === "ru" ? "Итого в базе:" : "Total in database:"} ${mergedDays.length} ${lang === "ru" ? "дней." : "days."}`,
      });
      setImportPreview(null);
    } catch {
      toast({ variant: "destructive", title: T.toast_import_error, description: T.toast_import_apply_error });
    }
  };

  // ── Export ──────────────────────────────────────────────────────────────
  const handleExport = () => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      const raw = localStorage.getItem(key)!;
      try { data[key] = JSON.parse(raw); } catch { data[key] = raw; }
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `three-bearings-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: T.toast_export_done, description: T.toast_export_desc });
  };

  // ── Reset ───────────────────────────────────────────────────────────────
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    localStorage.clear();
    toast({ title: T.toast_reset_done, description: T.toast_reset_desc });
    setConfirmReset(false);
    navigate("/");
  };

  // ── About sphere data (bilingual) ─────────────────────────────────────────
  const sphereInfo = [
    {
      icon: Wind,
      color: "text-sphere-autonomy",
      bg: "bg-sphere-autonomy/10",
      label: T.sphere_autonomy,
      desc: lang === "ru"
        ? "Ощущение, что ты действуешь из собственных ценностей, а не под внешним давлением."
        : "Feeling that you act from your own values, not under external pressure.",
    },
    {
      icon: Anchor,
      color: "text-sphere-competence",
      bg: "bg-sphere-competence/10",
      label: T.sphere_competence,
      desc: lang === "ru"
        ? "Уверенность в своих силах, рост и преодоление вызовов."
        : "Confidence in your abilities, growth, and overcoming challenges.",
    },
    {
      icon: Users,
      color: "text-sphere-relatedness",
      bg: "bg-sphere-relatedness/10",
      label: T.sphere_relatedness,
      desc: lang === "ru"
        ? "Подлинные, тёплые отношения с людьми, ощущение принятия."
        : "Genuine, warm relationships with others and a sense of belonging.",
    },
  ];

  return (
    <div className="flex flex-col space-y-6 pt-6 pb-12">
      {/* Header */}
      <header className="space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl text-primary mb-2">
          <Settings className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-serif font-medium text-foreground tracking-tight">{T.settings_title}</h1>
        <p className="text-muted-foreground text-base leading-relaxed">{T.settings_subtitle}</p>
      </header>

      {/* ── Theme ── */}
      <Section>
        <SectionHeader icon={theme === "dark" ? Moon : Sun} title={T.settings_theme} />
        <div className="px-5 py-4">
          <div className="bg-secondary/50 p-1 rounded-2xl flex border border-border/50">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-all",
                  theme === t
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "light" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {t === "light" ? T.settings_theme_light : T.settings_theme_dark}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Language ── */}
      <Section>
        <SectionHeader icon={Languages} title={T.settings_language} />
        <div className="px-5 py-4">
          <div className="bg-secondary/50 p-1 rounded-2xl flex border border-border/50">
            {(["ru", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={clsx(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-all",
                  lang === l
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="text-base leading-none">{l === "ru" ? "🇷🇺" : "🇬🇧"}</span>
                {l === "ru" ? "Русский" : "English"}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Reminders ── */}
      <Section>
        <SectionHeader icon={Bell} title={T.settings_reminders} />

        <Row>
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">{T.settings_reminders_enable}</p>
            <p className="text-xs text-muted-foreground">
              {notifPermission === "denied"
                ? T.settings_reminders_denied
                : T.settings_reminders_daily}
            </p>
          </div>
          <Toggle checked={reminderEnabled} onChange={setReminderEnabled} />
        </Row>

        <AnimatePresence>
          {reminderEnabled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-4 space-y-3 border-t border-border/40 pt-4">
                <label className="block text-sm font-medium text-foreground">{T.settings_reminders_time}</label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
                <p className="text-xs text-muted-foreground">{T.settings_reminders_note}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-5 pb-5">
          <Button onClick={handleSaveReminder} className="w-full rounded-xl h-10">
            <Save className="w-4 h-4 mr-2" />
            {T.save}
          </Button>
        </div>
      </Section>

      {/* ── Export ── */}
      <Section>
        <SectionHeader icon={Download} title={T.settings_export} />
        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">{T.settings_export_desc}</p>
          <Button variant="outline" onClick={handleExport} className="w-full rounded-xl h-10">
            <Download className="w-4 h-4 mr-2" />
            {T.settings_export_btn}
          </Button>
        </div>
      </Section>

      {/* ── Import ── */}
      <Section>
        <SectionHeader icon={Upload} title={T.settings_import} />
        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">{T.settings_import_desc}</p>

          <input
            ref={importInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImportFile}
          />

          <AnimatePresence mode="wait">
            {!importPreview ? (
              <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button
                  variant="outline"
                  onClick={() => importInputRef.current?.click()}
                  className="w-full rounded-xl h-10"
                >
                  <FileJson className="w-4 h-4 mr-2" />
                  {T.settings_import_select}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3 bg-primary/5 border border-primary/20 rounded-2xl p-4"
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <FileJson className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-sm font-semibold text-foreground">{T.settings_import_ready}</p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-background rounded-xl px-2 py-2.5 border border-border/60">
                    <p className="text-lg font-bold text-foreground font-serif">{importPreview.totalDays}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-tight mt-0.5">{T.settings_import_total}</p>
                  </div>
                  <div className="bg-background rounded-xl px-2 py-2.5 border border-border/60">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400 font-serif">{importPreview.newDays}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-tight mt-0.5">{T.settings_import_new}</p>
                  </div>
                  <div className="bg-background rounded-xl px-2 py-2.5 border border-border/60">
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400 font-serif">{importPreview.updatedDays}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-tight mt-0.5">{T.settings_import_updated}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    onClick={() => setImportPreview(null)}
                    className="flex-1 rounded-xl h-10 gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    {T.cancel}
                  </Button>
                  <Button
                    onClick={handleImportConfirm}
                    className="flex-1 rounded-xl h-10 gap-1.5"
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    {T.settings_import_apply}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Section>

      {/* ── Reset ── */}
      <Section>
        <SectionHeader icon={Trash2} title={T.settings_reset} />
        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">{T.settings_reset_desc}</p>

          <AnimatePresence mode="wait">
            {!confirmReset ? (
              <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button
                  variant="outline"
                  onClick={() => setConfirmReset(true)}
                  className="w-full rounded-xl h-10 border-destructive/40 text-destructive hover:bg-destructive/5 hover:border-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {T.settings_reset_btn}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3 bg-destructive/5 border border-destructive/20 rounded-2xl p-4"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                  <p className="text-sm text-foreground font-medium leading-relaxed">{T.settings_reset_confirm}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 rounded-xl h-10"
                  >
                    {T.cancel}
                  </Button>
                  <Button
                    onClick={handleReset}
                    className="flex-1 rounded-xl h-10 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    {T.delete}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Section>

      {/* ── About ── */}
      <Section>
        <SectionHeader icon={Info} title={T.settings_about} />
        <div className="px-5 py-5 space-y-5">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-medium">Three Bearings</h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">SDT Socratic Tracker · v1.0.0</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">{T.settings_about_theory}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{T.settings_about_theory_desc}</p>
              <div className="space-y-2.5 pt-1">
                {sphereInfo.map(({ icon: Icon, color, bg, label, desc }) => (
                  <div key={label} className={clsx("flex gap-3 p-3 rounded-xl", bg)}>
                    <Icon className={clsx("w-4 h-4 shrink-0 mt-0.5", color)} />
                    <div>
                      <p className={clsx("text-xs font-semibold", color)}>{label}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">{T.settings_about_socratic}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{T.settings_about_socratic_desc}</p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{T.settings_storage_note}</p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
