import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import "./App.css";

const WEATHER = {
  0: ["Clear sky", "☀️"],
  1: ["Mainly clear", "🌤️"],
  2: ["Partly cloudy", "⛅"],
  3: ["Overcast", "☁️"],
  45: ["Fog", "🌫️"],
  48: ["Rime fog", "🌫️"],
  51: ["Light drizzle", "🌦️"],
  53: ["Drizzle", "🌦️"],
  55: ["Heavy drizzle", "🌦️"],
  56: ["Freezing drizzle", "🌧️"],
  57: ["Freezing drizzle", "🌧️"],
  61: ["Light rain", "🌧️"],
  63: ["Rain", "🌧️"],
  65: ["Heavy rain", "🌧️"],
  66: ["Freezing rain", "🌧️"],
  67: ["Freezing rain", "🌧️"],
  71: ["Light snow", "🌨️"],
  73: ["Snow", "❄️"],
  75: ["Heavy snow", "❄️"],
  77: ["Snow grains", "❄️"],
  80: ["Light showers", "🌦️"],
  81: ["Showers", "🌧️"],
  82: ["Violent showers", "🌧️"],
  85: ["Snow showers", "🌨️"],
  86: ["Heavy snow showers", "🌨️"],
  95: ["Thunderstorm", "⛈️"],
  96: ["Thunderstorm with hail", "⛈️"],
  99: ["Thunderstorm with hail", "⛈️"],
};

const describe = (code) => WEATHER[code] ?? ["Unknown", "❓"];

const hourLabel = (iso) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: "numeric" });

export default function App() {
  const [query, setQuery] = useState("");
  const [place, setPlace] = useState(null);
  const [weather, setWeather] = useState(null);
  const [unit, setUnit] = useState("celsius");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // City name -> coordinates
  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          query.trim()
        )}&count=1`
      );
      const data = await res.json();
      if (!data.results?.length) throw new Error("City not found");
      const r = data.results[0];
      setPlace({
        name: r.name,
        region: r.admin1,
        country: r.country,
        lat: r.latitude,
        lon: r.longitude,
      });
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }

  // Browser location -> coordinates (+ a friendly place name)
  function handleLocate() {
    if (!navigator.geolocation) {
      setError("Geolocation isn't supported by this browser");
      return;
    }
    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let name = "Your location";
        let region = null;
        let country = "";

        // Open-Meteo has no reverse geocoding, so use a free keyless one
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client` +
              `?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const g = await res.json();
          name = g.city || g.locality || name;
          region = g.principalSubdivision || null;
          country = g.countryName || "";
        } catch {
          // keep the fallback name
        }

        setPlace({ name, region, country, lat: latitude, lon: longitude });
      },
      (err) => {
        setError(
          err.code === 1
            ? "Location permission denied"
            : "Could not get your location"
        );
        setLoading(false);
      },
      { timeout: 10000 }
    );
  }

  // Coordinates -> forecast (re-runs when place or unit changes)
  useEffect(() => {
    if (!place) return;
    let cancelled = false;

    async function loadWeather() {
      setLoading(true);
      setError("");
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${place.lat}&longitude=${place.lon}` +
          `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code` +
          `&hourly=temperature_2m` +
          `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum` +
          `&temperature_unit=${unit}&timezone=auto`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Could not load weather");
        const data = await res.json();
        if (!cancelled) setWeather(data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadWeather();
    return () => {
      cancelled = true;
    };
  }, [place, unit]);

  const symbol = unit === "celsius" ? "°C" : "°F";
  const current = weather?.current;
  const daily = weather?.daily;

  // Next 24 hours starting from the current hour (times are already local)
  let hourlyData = [];
  if (weather?.hourly) {
    const startOfHour = current.time.slice(0, 13) + ":00";
    const start = Math.max(
      weather.hourly.time.findIndex((t) => t >= startOfHour),
      0
    );
    hourlyData = weather.hourly.time
      .slice(start, start + 24)
      .map((t, i) => ({
        time: t,
        temp: Math.round(weather.hourly.temperature_2m[start + i]),
      }));
  }

  const placeLabel = place
    ? [place.name, place.region, place.country].filter(Boolean).join(", ")
    : "";

  return (
    <div className="app">
      <h1>Weather Dashboard</h1>

      <form onSubmit={handleSearch} className="search">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a city..."
        />
        <button type="submit">Search</button>
        <button
          type="button"
          className="locate"
          onClick={handleLocate}
          title="Use my location"
        >
          📍
        </button>
        <button
          type="button"
          className="unit"
          onClick={() => setUnit(unit === "celsius" ? "fahrenheit" : "celsius")}
        >
          {symbol}
        </button>
      </form>

      {loading && <p className="status">Loading...</p>}
      {error && <p className="status error">{error}</p>}

      {current && place && (
        <>
          <section className="card current">
            <h2>{placeLabel}</h2>
            <div className="big">
              <span className="icon">{describe(current.weather_code)[1]}</span>
              <span className="temp">
                {Math.round(current.temperature_2m)}
                {symbol}
              </span>
            </div>
            <p>{describe(current.weather_code)[0]}</p>
            <div className="stats">
              <div>
                Feels like: {Math.round(current.apparent_temperature)}
                {symbol}
              </div>
              <div>Humidity: {current.relative_humidity_2m}%</div>
              <div>Wind: {current.wind_speed_10m} km/h</div>
            </div>
          </section>

          <section className="card chart">
            <h3>Next 24 hours</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart
                data={hourlyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                <XAxis
                  dataKey="time"
                  tickFormatter={hourLabel}
                  interval={3}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  domain={["dataMin - 2", "dataMax + 2"]}
                  tickFormatter={(v) => `${Math.round(v)}°`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  labelFormatter={hourLabel}
                  formatter={(v) => [`${v}${symbol}`, "Temperature"]}
                />
                <Area
                  type="monotone"
                  dataKey="temp"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#tempFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </section>

          <section className="forecast">
            {daily.time.map((date, i) => (
              <div className="card day" key={date}>
                <strong>
                  {new Date(date + "T00:00").toLocaleDateString(undefined, {
                    weekday: "short",
                  })}
                </strong>
                <span className="icon">
                  {describe(daily.weather_code[i])[1]}
                </span>
                <span>
                  {Math.round(daily.temperature_2m_max[i])}° /{" "}
                  {Math.round(daily.temperature_2m_min[i])}°
                </span>
                <small>💧 {daily.precipitation_sum[i]} mm</small>
              </div>
            ))}
          </section>
        </>
      )}
    </div>
  );
}