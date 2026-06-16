import React from "react";
import * as Icons from "lucide-react";
import { motion } from "motion/react";
import { WeatherData } from "../types";
import { getWeatherCondition, WeatherCondition } from "../utils/weather";

interface WeatherCardProps {
  weather: WeatherData;
  isCelsius: boolean;
  onUnitToggle: () => void;
}

export default function WeatherCard({ weather, isCelsius, onUnitToggle }: WeatherCardProps) {
  const condition: WeatherCondition = getWeatherCondition(weather.current.weatherCode);

  // Convert Celsius to Fahrenheit
  const formatTemp = (celsius: number) => {
    if (isCelsius) {
      return `${Math.round(celsius)}°C`;
    }
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${Math.round(fahrenheit)}°F`;
  };

  // Helper to dynamically render Lucide Icon by string name safely
  const renderIcon = (iconName: string, className: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Cloud;
    return <IconComponent className={className} />;
  };

  // Format the current date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl mx-auto rounded-3xl bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/20 dark:border-slate-800 shadow-2xl p-6 md:p-8"
      id="current-weather-card"
    >
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div id="city-info-section">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium mb-1">
            <Icons.MapPin className="w-4 h-4 text-rose-500" />
            <span className="text-sm tracking-wide uppercase font-mono">
              Lat: {weather.latitude.toFixed(2)} / Lon: {weather.longitude.toFixed(2)}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-baseline gap-2">
            <span id="city-name-display">{weather.city}</span>
            {weather.country && (
              <span className="text-base font-normal text-slate-500 dark:text-slate-400 font-mono">
                {weather.country}
              </span>
            )}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-mono">
            {formatDate(weather.current.time)}
          </p>
        </div>

        {/* Temperature Unit Toggle Button */}
        <button
          onClick={onUnitToggle}
          className="self-start px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-200/60 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 border border-slate-300/30 transition-all font-mono shadow-sm active:scale-95 cursor-pointer"
          id="temp-unit-toggle"
        >
          Switch to {isCelsius ? "°F" : "°C"}
        </button>
      </div>

      {/* Hero Temperature and Emoji Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center my-8" id="weather-hero-panel">
        <div className="flex items-center gap-4">
          <div className="relative p-4 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-50/50 dark:from-slate-800 dark:to-slate-800/20 border border-slate-200/20 shadow-inner">
            {renderIcon(condition.iconName, "w-16 h-16 xl:w-20 xl:h-20 text-sky-500 dark:text-sky-400 animate-pulse")}
          </div>
          <div>
            <div className="text-5xl md:text-6xl font-black text-slate-800 dark:text-white tracking-tighter" id="temp-display">
              {formatTemp(weather.current.temp)}
            </div>
            <div className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
              <span>{condition.emoji}</span>
              <span>{condition.label}</span>
            </div>
          </div>
        </div>

        {/* Highlighted Extra Parameters */}
        <div className="grid grid-cols-2 gap-4" id="weather-quick-details">
          <div className="p-4 rounded-2xl bg-sky-50/40 dark:bg-sky-950/10 border border-sky-100/20 dark:border-sky-950/35 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 mb-1">
              <Icons.Droplets className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">Humidity</span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white font-mono" id="humidity-display">
              {weather.current.humidity}%
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-teal-50/40 dark:bg-teal-950/10 border border-teal-100/20 dark:border-teal-950/35 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 mb-1">
              <Icons.Wind className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider font-mono">Wind</span>
            </div>
            <span className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white font-mono" id="wind-display">
              {weather.current.windSpeed} <span className="text-xs font-normal">km/h</span>
            </span>
          </div>
        </div>
      </div>

      {/* Helpful Interactive Note (No tech-larp, just pure elegant user utility) */}
      <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center text-xs text-slate-400 dark:text-slate-500 font-mono">
        <span>Current climate station data stream</span>
        <span>Open-Meteo Real-time API</span>
      </div>
    </motion.div>
  );
}
