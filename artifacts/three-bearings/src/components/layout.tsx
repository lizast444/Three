import { Link, useLocation } from "wouter";
import { BookOpen, BarChart2, CheckCircle2, CalendarDays, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Сегодня", icon: CheckCircle2 },
    { href: "/library", label: "Библиотека", icon: BookOpen },
    { href: "/journal", label: "Журнал", icon: CalendarDays },
    { href: "/insights", label: "Аналитика", icon: BarChart2 },
    { href: "/settings", label: "Оснастка", icon: SlidersHorizontal },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col pb-24 md:pb-0 overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <main className="flex-1 w-full max-w-xl mx-auto md:py-8 px-4 sm:px-6 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 safe-area-pb">
        <div className="flex items-center justify-around px-1 h-16">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={clsx(
                  "relative flex flex-col items-center justify-center flex-1 h-full gap-0.5 font-medium transition-colors duration-300",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={clsx("w-[18px] h-[18px]", isActive ? "stroke-2" : "stroke-[1.5]")} />
                <span className="text-[9.5px] leading-none">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -top-px left-1 right-1 h-0.5 bg-primary rounded-b-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Side Navigation / Top Navigation inside max-w could be added here if needed, 
          but app is styled as a mobile-first contemplative journal. For md+ screens we'll use a floating pill. */}
      <nav className="hidden md:flex fixed bottom-8 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-full px-2 py-2 items-center space-x-2 shadow-2xl">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={clsx(
                "relative flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className={clsx("w-4 h-4", isActive ? "stroke-2" : "stroke-[1.5]")} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="desktop-nav-indicator"
                  className="absolute inset-0 border border-primary/20 rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
