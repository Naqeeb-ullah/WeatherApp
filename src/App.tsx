import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  MapPin,
  Loader2,
  AlertCircle,
  HelpCircle,
  Sun,
  Moon,
  Compass,
} from "lucide-react";
import { WeatherData, GeocodingResult } from "./types";
import {
  searchCity,
  fetchWeather,
  reverseGeocode,
  getWeatherCondition,
  WeatherTheme,
} from "./utils/weather";
import AmbientBackground from "./components/AmbientBackground";
import WeatherCard from "./components/WeatherCard";
import ForecastSection from "./components/ForecastSection";

// Popular preselected cities for quick exploration
const QUICK_CITIES = [
  { name: "New York", country: "United States" },
  { name: "London", country: "United Kingdom" },
  { name: "Tokyo", country: "Japan" },
  { name: "Paris", country: "France" },
  { name: "Sydney", country: "Australia" },
];

export default function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCelsius, setIsCelsius] = useState(true);
  const [geocodingOptions, setGeocodingOptions] = useState<GeocodingResult[] | null>(null);
  
  // Theme state matches system/stored preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("weather_dark_theme");
      if (saved) return saved === "true";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  // Toggle theme helper
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("weather_dark_theme", isDarkMode.toString());
  }, [isDarkMode]);

  // Load weather based on geolocation or default to local storage or New York
  useEffect(() => {
    // Try to restore last city or request location
    const savedCity = localStorage.getItem("weather_last_city");
    if (savedCity) {
      handleSearch(savedCity);
    } else {
      detectUserLocation();
    }
  }, []);

  // Main coordinator to fetch and set weather
  const loadWeatherForCoords = async (lat: number, lon: number, cityName: string, country?: string) => {
    setIsLoading(true);
    setError(null);
    setGeocodingOptions(null);
    try {
      const data = await fetchWeather(lat, lon, cityName, country);
      setWeather(data);
      localStorage.setItem("weather_last_city", cityName);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while loading weather data.");
    } finally {
      setIsLoading(false);
    }
  };

  // Triggers search geocoding, if multiple results are found, prompts user.
  // If only one, loads it immediately.
  const handleSearch = async (queryToSearch: string) => {
    const trimmed = queryToSearch.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setGeocodingOptions(null);

    try {
      const results = await searchCity(trimmed);
      if (results.length === 1) {
        // Only one match, load directly
        const topResult = results[0];
        await loadWeatherForCoords(topResult.latitude, topResult.longitude, topResult.name, topResult.country);
      } else {
        // Multi-match result found, present options to the user to choose
        setGeocodingOptions(results);
      }
    } catch (err: any) {
      setError(err.message || "No results found. Please verify the spelling or check network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectMultiCityResult = async (city: GeocodingResult) => {
    await loadWeatherForCoords(city.latitude, city.longitude, city.name, city.country);
  };

  // Uses Geolocation API to auto-detect location
  const detectUserLocation = () => {
    setIsLoading(true);
    setError(null);
    setGeocodingOptions(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser. Defaulting to Tokyo.");
      loadWeatherForCoords(35.6895, 139.6917, "Tokyo", "Japan");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Reverse geocode to get city name
          const { city, country } = await reverseGeocode(latitude, longitude);
          await loadWeatherForCoords(latitude, longitude, city, country);
        } catch (err) {
          // Fallback but load using coords
          await loadWeatherForCoords(latitude, longitude, "Current Location");
        }
      },
      (geoError) => {
        let msg = "Unable to retrieve your location. ";
        if (geoError.code === geoError.PERMISSION_DENIED) {
          msg += "Location permission was denied.";
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          msg += "Location information is unavailable.";
        } else if (geoError.code === geoError.TIMEOUT) {
          msg += "The location acquisition timed out.";
        }
        
        setError(`${msg} Loading Tokyo as fallback.`);
        // Default fallback to Tokyo
        loadWeatherForCoords(35.6895, 139.6917, "Tokyo", "Japan");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Form submit helper
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  // Determine current weather theme for ambient dynamic styling
  const activeTheme: WeatherTheme = weather
    ? getWeatherCondition(weather.current.weatherCode).theme
    : "sunny";

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-between p-4 md:p-8" id="application-container">
      {/* Dynamic Background */}
      <AmbientBackground theme={activeTheme} />

      {/* Navigation/Header Bar */}
      <header className="w-full max-w-xl flex justify-between items-center mb-6" id="app-header">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌦️</span>
          <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            Weather App
          </h1>
        </div>

        {/* Quiet Mode Control */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2.5 rounded-full bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300/20 shadow-md backdrop-blur-md transition-all active:scale-95 cursor-pointer"
          aria-label="Toggle theme color"
          id="dark-mode-toggle"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>
      </header>

      {/* Main Core Weather Layout */}
      <main className="w-full max-w-xl flex-1 flex flex-col justify-center gap-6" id="main-content">
        {/* Search Input Card */}
        <div className="w-full rounded-3xl bg-white/70 dark:bg-slate-900/70 shadow-lg border border-white/20 dark:border-slate-800/40 p-5 md:p-6 backdrop-blur-md" id="search-container">
          <form onSubmit={handleSubmit} className="relative flex gap-2" id="search-form">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search city (e.g., London, Tokyo, Paris)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-400 dark:focus:ring-sky-500 transition-all font-medium text-sm md:text-base shadow-inner/20"
                id="city-search-input"
              />
            </div>

            {/* Locate Current Geo Action */}
            <button
              type="button"
              onClick={detectUserLocation}
              title="Detect my location"
              className="px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-800/95 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer "
              id="geo-detect-btn"
            >
              <MapPin className="w-5 h-5 text-rose-500" />
            </button>

            {/* Search Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              id="search-submit-btn"
            >
              <span>Search</span>
            </button>
          </form>

          {/* Quick Hot Suggestions */}
          <div className="flex flex-wrap items-center gap-2 mt-4" id="quick-cities-panel">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 font-mono select-none mr-1">
              SUGGESTED:
            </span>
            {QUICK_CITIES.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => {
                  setSearchQuery(c.name);
                  handleSearch(c.name);
                }}
                className="px-2.5 py-1 text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white/45 hover:bg-white dark:bg-slate-800/40 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300 rounded-lg transition-all cursor-pointer hover:border-sky-400 dark:hover:border-sky-500 hover:text-sky-500"
                id={`quick-city-badge-${c.name.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Multi-result Resolver Options */}
          <AnimatePresence>
            {geocodingOptions && geocodingOptions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 overflow-hidden"
                id="multi-match-selector"
              >
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase font-mono">
                  Multiple matches found. Did you mean:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {geocodingOptions.map((opt, i) => (
                    <button
                      key={`${opt.latitude}-${opt.longitude}-${i}`}
                      type="button"
                      onClick={() => selectMultiCityResult(opt)}
                      className="text-left w-full px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-sky-400 text-slate-700 dark:text-slate-200 hover:text-sky-500 dark:hover:text-sky-400 flex items-center justify-between cursor-pointer transition-all"
                      id={`multi-match-item-${i}`}
                    >
                      <span>
                        {opt.name}
                        {opt.admin1 ? `, ${opt.admin1}` : ""}
                        {opt.country ? ` (${opt.country})` : ""}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {opt.latitude.toFixed(2)}°N, {opt.longitude.toFixed(2)}°E
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Error Notice */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/50 text-rose-800 dark:text-rose-200 text-sm font-medium flex items-start gap-3 shadow-sm"
              id="error-block-display"
            >
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span id="error-message-text">{error}</span>
                <div className="mt-2 flex gap-3">
                  <button
                    onClick={detectUserLocation}
                    className="text-xs underline font-bold hover:text-rose-600 dark:hover:text-rose-300 font-mono bg-transparent border-0 p-0 cursor-pointer"
                  >
                    Try Auto-Location Access
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => {
                      setSearchQuery("New York");
                      handleSearch("New York");
                    }}
                    className="text-xs underline font-bold hover:text-rose-600 dark:hover:text-rose-300 font-mono bg-transparent border-0 p-0 cursor-pointer"
                  >
                    Reset to New York
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Weather Status Indicator or Main Details */}
        <div className="relative min-h-64 flex flex-col justify-center" id="weather-display-area">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/20 dark:bg-slate-900/10 backdrop-blur-xs rounded-3xl z-40" id="weather-loader-spin">
              <Loader2 className="w-10 h-10 text-sky-500 dark:text-sky-400 animate-spin" />
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 font-mono">
                Updating conditions...
              </span>
            </div>
          )}

          {!isLoading && weather && (
            <AnimatePresence mode="wait">
              <div className="flex flex-col gap-1" id="weather-result-grid">
                <WeatherCard
                  weather={weather}
                  isCelsius={isCelsius}
                  onUnitToggle={() => setIsCelsius(!isCelsius)}
                />
                <ForecastSection weather={weather} isCelsius={isCelsius} />
              </div>
            </AnimatePresence>
          )}

          {!isLoading && !weather && !error && (
            <div className="text-center p-8 rounded-3xl bg-white/40 dark:bg-slate-900/30 border border-white/10 dark:border-slate-850/50 backdrop-blur-md" id="empty-state-notice">
              <Compass className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3 animate-[spin_6s_linear_infinite]" />
              <h3 className="text-slate-700 dark:text-slate-300 font-semibold mb-1">
                No City Loaded
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                Discover current atmospheric conditions. Search for any location above or trigger your real-time GPS sensors.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Branding (understated & aesthetic, no clutter) */}
      <footer className="w-full max-w-xl text-center text-[10px] sm:text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 font-mono py-6 border-t border-slate-300/10" id="main-footer">
        © {new Date().getFullYear()} Weather App — Clean Atmospheric Diagnostics
      </footer>
    </div>
  );
}
