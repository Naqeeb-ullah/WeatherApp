import React from "react";
import * as Icons from "lucide-react";
import { motion } from "motion/react";
import { WeatherData } from "../types";
import { getWeatherCondition, WeatherCondition } from "../utils/weather";

interface ForecastSectionProps {
  weather: WeatherData;
  isCelsius: boolean;
}

export default function ForecastSection({ weather, isCelsius }: ForecastSectionProps) {
  const formatTemp = (celsius: number) => {
    if (isCelsius) {
      return `${Math.round(celsius)}°`;
    }
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}°`;
  };

  const renderIcon = (iconName: string, className: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Cloud;
    return <IconComponent className={className} />;
  };

  const getDayLabel = (dateStr: string, index: number) => {
    if (index === 0) return "Today";
    if (index === 1) return "Tomorrow";

    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="w-full max-w-xl mx-auto mt-6 rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-white/10 dark:border-slate-800 shadow-xl p-6"
      id="forecast-section"
    >
      <h3 className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 font-mono uppercase mb-4 flex items-center gap-2">
        <Icons.Calendar className="w-4 h-4 text-sky-500" />
        <span>5-Day Weather Forecast</span>
      </h3>

      <div className="flex flex-col gap-3" id="forecast-days-container">
        {weather.daily.map((day, idx) => {
          const condition: WeatherCondition = getWeatherCondition(day.weatherCode);

          return (
            <div
              key={day.date}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/40 border border-slate-200/20 dark:border-slate-800/20 hover:bg-white/80 dark:hover:bg-slate-800/60 transition-all group shadow-sm"
              id={`forecast-day-row-${idx}`}
            >
              {/* Date & Sub-label */}
              <div className="flex flex-col w-24">
                <span className="text-sm font-bold text-slate-800 dark:text-white" id={`forecast-day-title-${idx}`}>
                  {getDayLabel(day.date, idx)}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                  {formatDateLabel(day.date)}
                </span>
              </div>

              {/* Condition Icon, Emoji and Label */}
              <div className="flex items-center gap-3 flex-1 px-4">
                <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/20 border border-sky-100/10 text-sky-500 dark:text-sky-400">
                  {renderIcon(condition.iconName, "w-5 h-5")}
                </div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 hidden sm:inline-block">
                  {condition.label}
                </span>
              </div>

              {/* Temp Range Slider & numbers */}
              <div className="flex items-center gap-3 font-mono">
                {/* Min Temp */}
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 w-10 text-right">
                  {formatTemp(day.tempMin)}
                </span>

                {/* Progress bar visual range indicator */}
                <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative hidden xs:block">
                  <div className="absolute top-0 bottom-0 left-[20%] right-[20%] rounded-full bg-gradient-to-r from-sky-450/70 to-amber-400/80" />
                </div>

                {/* Max Temp */}
                <span className="text-sm font-bold text-slate-800 dark:text-white w-10 text-right">
                  {formatTemp(day.tempMax)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
