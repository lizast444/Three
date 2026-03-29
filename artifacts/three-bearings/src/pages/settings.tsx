import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, Bell, BellOff, Download, Trash2, Info,
  Wind, Anchor, Users, CheckCircle2, AlertTriangle, Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { clsx } from "clsx";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

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
          body: "Время для ежедневного размышления ✨",
          icon: "/favicon.ico",
        });
      }
    };

    timerRef.current = setInterval(check, 60_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [reminderEnabled, reminderTime, notifPermission]);

  const handleSaveReminder = async () => {
    if (reminderEnabled) {
      if (notifPermission === "unsupported") {
        toast({ variant: "destructive", title: "Не поддерживается", description: "Ваш браузер не поддерживает уведомления." });
        return;
      }
      if (notifPermission !== "granted") {
        const result = await Notification.requestPermission();
        setNotifPermission(result);
        if (result !== "granted") {
          toast({ variant: "destructive", title: "Доступ отклонён", description: "Разрешите уведомления в настройках браузера." });
          return;
        }
      }
    }

    localStorage.setItem(LS_REMINDER_ENABLED, String(reminderEnabled));
    localStorage.setItem(LS_REMINDER_TIME, reminderTime);
    toast({ title: "Сохранено", description: reminderEnabled ? `Напоминание установлено на ${reminderTime}` : "Напоминания отключены." });
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
    toast({ title: "Экспорт готов", description: "Файл сохранён на устройство." });
  };

  // ── Reset ───────────────────────────────────────────────────────────────
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    localStorage.clear();
    toast({ title: "Все данные удалены", description: "Локальные данные очищены." });
    setConfirmReset(false);
    navigate("/");
  };

  return (
    <div className="flex flex-col space-y-6 pt-6 pb-12">
      {/* Header */}
      <header className="space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl text-primary mb-2">
          <Settings className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-serif font-medium text-foreground tracking-tight">Оснастка</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Настройки приложения и управление данными.
        </p>
      </header>

      {/* ── Reminders ── */}
      <Section>
        <SectionHeader icon={Bell} title="Напоминания" />

        <Row>
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">Включить напоминания</p>
            <p className="text-xs text-muted-foreground">
              {notifPermission === "denied"
                ? "Разрешите уведомления в браузере"
                : "Ежедневный сигнал для рефлексии"}
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
                <label className="block text-sm font-medium text-foreground">Время напоминания</label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
                />
                <p className="text-xs text-muted-foreground">
                  Уведомления работают, пока приложение открыто в браузере.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-5 pb-5">
          <Button onClick={handleSaveReminder} className="w-full rounded-xl h-10">
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </Button>
        </div>
      </Section>

      {/* ── Export ── */}
      <Section>
        <SectionHeader icon={Download} title="Экспорт данных" />
        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Скачайте все локальные данные приложения (ответы, настройки) в виде JSON-файла.
          </p>
          <Button variant="outline" onClick={handleExport} className="w-full rounded-xl h-10">
            <Download className="w-4 h-4 mr-2" />
            Экспортировать в JSON
          </Button>
        </div>
      </Section>

      {/* ── Reset ── */}
      <Section>
        <SectionHeader icon={Trash2} title="Сброс данных" />
        <div className="px-5 py-4 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Удаляет все локальные данные: настройки, ответы глубокого разбора, параметры ротации вопросов. Данные чекинов в базе не удаляются.
          </p>

          <AnimatePresence mode="wait">
            {!confirmReset ? (
              <motion.div key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Button
                  variant="outline"
                  onClick={() => setConfirmReset(true)}
                  className="w-full rounded-xl h-10 border-destructive/40 text-destructive hover:bg-destructive/5 hover:border-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Сбросить все данные
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
                  <p className="text-sm text-foreground font-medium leading-relaxed">
                    Вы уверены? Это действие необратимо. Все локальные данные будут удалены, страница перезагрузится.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmReset(false)}
                    className="flex-1 rounded-xl h-10"
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={handleReset}
                    className="flex-1 rounded-xl h-10 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                  >
                    Удалить
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Section>

      {/* ── About ── */}
      <Section>
        <SectionHeader icon={Info} title="О приложении" />
        <div className="px-5 py-5 space-y-5">
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-medium">Three Bearings</h3>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">SDT Socratic Tracker · v1.0.0</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Теория самодетерминации (SDT)</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                SDT — психологическая теория, утверждающая, что благополучие и внутренняя мотивация человека зависят от удовлетворения трёх базовых потребностей:
              </p>
              <div className="space-y-2.5 pt-1">
                {[
                  { icon: Wind, color: "text-sphere-autonomy", bg: "bg-sphere-autonomy/10", label: "Автономия", desc: "Ощущение, что ты действуешь из собственных ценностей, а не под внешним давлением." },
                  { icon: Anchor, color: "text-sphere-competence", bg: "bg-sphere-competence/10", label: "Компетентность", desc: "Уверенность в своих силах, рост и преодоление вызовов." },
                  { icon: Users, color: "text-sphere-relatedness", bg: "bg-sphere-relatedness/10", label: "Связанность", desc: "Подлинные, тёплые отношения с людьми, ощущение принятия." },
                ].map(({ icon: Icon, color, bg, label, desc }) => (
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
              <p className="text-sm font-semibold text-foreground">Сократовский метод</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Метод исследования через вопросы, который помогает осознать скрытые убеждения, противоречия и новые перспективы. Вместо готовых ответов — уточняющие вопросы, которые ведут к собственному пониманию.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Ваши данные хранятся локально и в защищённой базе данных.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
