import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { WeatherTheme } from "../utils/weather";

interface AmbientBackgroundProps {
  theme: WeatherTheme;
}

export default function AmbientBackground({ theme }: AmbientBackgroundProps) {
  // Map themes to elegant CSS background gradients and dynamic ambient elements
  const themeClasses: Record<WeatherTheme, { gradient: string; accentColor: string }> = {
    sunny: {
      gradient: "from-amber-100 via-orange-50 to-sky-100 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-slate-950",
      accentColor: "bg-amber-400/20",
    },
    cloudy: {
      gradient: "from-slate-100 via-zinc-100 to-blue-100 dark:from-slate-900/60 dark:via-zinc-900/40 dark:to-slate-950",
      accentColor: "bg-blue-300/20",
    },
    rainy: {
      gradient: "from-blue-200 via-slate-200 to-indigo-300 dark:from-indigo-950/50 dark:via-slate-900/40 dark:to-slate-950",
      accentColor: "bg-indigo-500/10",
    },
    snowy: {
      gradient: "from-blue-50 via-indigo-50 to-emerald-50 dark:from-sky-950/30 dark:via-indigo-950/20 dark:to-slate-950",
      accentColor: "bg-sky-200/30",
    },
    stormy: {
      gradient: "from-slate-300 via-purple-200 to-stone-400 dark:from-purple-950/40 dark:via-zinc-900/50 dark:to-zinc-950",
      accentColor: "bg-purple-500/10",
    },
    foggy: {
      gradient: "from-zinc-200 via-slate-100 to-zinc-300 dark:from-zinc-900/60 dark:via-slate-900/40 dark:to-slate-950",
      accentColor: "bg-zinc-400/20",
    },
  };

  const currentTheme = themeClasses[theme] || themeClasses.sunny;

  return (
    <div className="absolute inset-0 -z-50 overflow-hidden transition-all duration-1000">
      {/* Background Gradient Layer with dynamic transitions */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={theme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradient}`}
        />
      </AnimatePresence>

      {/* Decorative Orbs to enrich the background without adding visual clutter */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl filter opacity-40 mix-blend-multiply animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-[28rem] h-[28rem] rounded-full blur-3xl filter opacity-30 mix-blend-screen animate-pulse delay-1000" />

      {/* Dynamic atmospheric layer based on current theme */}
      <AnimatePresence>
        {theme === "sunny" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="absolute top-10 right-10 w-48 h-48 bg-amber-200 rounded-full blur-3xl mix-blend-screen"
          />
        )}
        {theme === "rainy" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.15) 0%, transparent 80%)",
            }}
          >
            {/* Simple rain effect overlays */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100%_40px] animate-[slide_1.5s_linear_infinite]" />
          </motion.div>
        )}
        {theme === "snowy" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Gentle snow drift simulation */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px] animate-[slide_10s_linear_infinite]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
