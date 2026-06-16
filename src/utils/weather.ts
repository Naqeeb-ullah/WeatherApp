import { WeatherData, GeocodingResult } from "../types";

export type WeatherTheme = "sunny" | "cloudy" | "rainy" | "snowy" | "stormy" | "foggy";

export interface WeatherCondition {
  label: string;
  emoji: string;
  iconName: string; // Used to determine which Lucide icon to render
  theme: WeatherTheme;
}

export function getWeatherCondition(code: number): WeatherCondition {
  // WMO Weather interpretation codes
  switch (code) {
    case 0:
      return { label: "Clear Sky", emoji: "☀️", iconName: "Sun", theme: "sunny" };
    case 1:
    case 2:
      return { label: "Partly Cloudy", emoji: "⛅", iconName: "CloudSun", theme: "sunny" };
    case 3:
      return { label: "Overcast", emoji: "☁️", iconName: "Cloud", theme: "cloudy" };
    case 45:
    case 48:
      return { label: "Foggy", emoji: "🌫️", iconName: "CloudFog", theme: "foggy" };
    case 51:
    case 53:
    case 55:
      return { label: "Drizzle", emoji: "🌦️", iconName: "CloudDrizzle", theme: "rainy" };
    case 56:
    case 57:
      return { label: "Freezing Drizzle", emoji: "🌨️", iconName: "CloudSnow", theme: "snowy" };
    case 61:
    case 63:
    case 65:
      return { label: "Rainy", emoji: "🌧️", iconName: "CloudRain", theme: "rainy" };
    case 66:
    case 67:
      return { label: "Freezing Rain", emoji: "🌨️", iconName: "CloudRain", theme: "snowy" };
    case 71:
    case 73:
    case 75:
      return { label: "Snowy", emoji: "❄️", iconName: "CloudSnow", theme: "snowy" };
    case 77:
      return { label: "Snow Grains", emoji: "❄️", iconName: "CloudSnow", theme: "snowy" };
    case 80:
    case 81:
    case 82:
      return { label: "Rain Showers", emoji: "🌧️", iconName: "CloudRain", theme: "rainy" };
    case 85:
    case 86:
      return { label: "Snow Showers", emoji: "🌨️", iconName: "CloudSnow", theme: "snowy" };
    case 95:
      return { label: "Thunderstorm", emoji: "⛈️", iconName: "CloudLightning", theme: "stormy" };
    case 96:
    case 99:
      return { label: "Thunderstorm with Hail", emoji: "⛈️", iconName: "CloudLightning", theme: "stormy" };
    default:
      return { label: "Unknown Condition", emoji: "🤷", iconName: "Cloud", theme: "cloudy" };
  }
}

/**
 * Searches for a city's coordinates using Open-Meteo's Geocoding API.
 */
export async function searchCity(name: string): Promise<GeocodingResult[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    name
  )}&count=5&language=en&format=json`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Unable to search for city. Please check your network connection.");
  }

  const data = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`City "${name}" not found. Please try another city.`);
  }

  return data.results.map((r: any) => ({
    name: r.name,
    country: r.country,
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

/**
 * Fetches the current weather and 5-day forecast for given coordinates.
 */
export async function fetchWeather(
  latitude: number,
  longitude: number,
  cityName: string,
  countryName?: string
): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Unable to fetch weather data. Please try again later.");
  }

  const data = await response.json();

  if (!data.current || !data.daily) {
    throw new Error("Invalid response received from the weather service.");
  }

  const current = {
    temp: data.current.temperature_2m,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    weatherCode: data.current.weather_code,
    time: data.current.time,
  };

  // Extract a 5-day forecast (including today)
  const daily = [];
  for (let i = 0; i < Math.min(5, data.daily.time.length); i++) {
    daily.push({
      date: data.daily.time[i],
      weatherCode: data.daily.weather_code[i],
      tempMax: data.daily.temperature_2m_max[i],
      tempMin: data.daily.temperature_2m_min[i],
    });
  }

  return {
    city: cityName,
    country: countryName,
    latitude,
    longitude,
    timezone: data.timezone,
    current,
    daily,
  };
}

/**
 * Performs Reverse Geocoding via Open-Meteo or another free API,
 * but since standard Open-Meteo doesn't have reverse geocoding directly,
 * we can use bigdatacloud's free reverse geocoding API or a similar keyless robust geocoding endpoint.
 * Let's use standard free bigdatacloud geocoding or openstreetmap nominatim.
 * Nominatim has a strict rate limit, so let's use:
 * `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
 * It is completely free, does not require an API key, is highly reliable, and returns correct local city names.
 */
export async function reverseGeocode(latitude: number, longitude: number): Promise<{ city: string; country: string }> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const city = data.city || data.locality || data.principalSubdivision || "Current Location";
      const country = data.countryName || "";
      return { city, country };
    }
  } catch (error) {
    console.error("Error reverse geocoding coordinates:", error);
  }
  return { city: "Selected City", country: "" };
}
