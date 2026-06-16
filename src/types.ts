export interface WeatherData {
  city: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  current: {
    temp: number; // Celsius
    humidity: number; // %
    windSpeed: number; // km/h
    weatherCode: number;
    time: string;
  };
  daily: Array<{
    date: string;
    weatherCode: number;
    tempMax: number;
    tempMin: number;
  }>;
}

export interface GeocodingResult {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}
