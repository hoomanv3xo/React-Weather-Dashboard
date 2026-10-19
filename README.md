# Weather Dashboard   **[Live Demo](https://hooman-chatbot.onrender.com)**

A simple weather app built with React and Vite. Search for any city or use your current location to see current conditions, a 24-hour temperature chart, and a 7-day forecast. No API keys required.

## Features

- Search any city by name
- "Use my location" button (browser geolocation)
- Current temperature, feels-like, humidity, and wind speed
- Hourly temperature chart for the next 24 hours
- 7-day forecast with highs, lows, and precipitation
- Celsius / Fahrenheit toggle

## Tech Stack

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [Recharts](https://recharts.org/) for the hourly chart
- [Open-Meteo](https://open-meteo.com/) for geocoding and forecast data
- [BigDataCloud](https://www.bigdatacloud.com/) client reverse-geocoding to name your location

## Getting Started

### Prerequisites

- Python 3 (only used to create the virtual environment)
- Internet access

### Setup (Windows, Command Prompt)

This project uses a Python virtual environment with [`nodeenv`](https://github.com/ekalinin/nodeenv) to keep Node.js isolated to the project.

```bat
cd react-weather-dashboard

python -m venv venv
venv\Scripts\activate.bat

pip install nodeenv
nodeenv -p

node -v
npm -v

npm install
npm run dev
```

Then open http://localhost:5173.

### Setup (macOS / Linux)

```bash
cd react-weather-dashboard

python3 -m venv venv
source venv/bin/activate

pip install nodeenv
nodeenv -p

npm install
npm run dev
```

> If you already have Node.js installed globally, you can skip the virtual environment and just run `npm install` and `npm run dev`.

## Scripts

| Command           | Description                       |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start the development server      |
| `npm run build`   | Create a production build         |
| `npm run preview` | Preview the production build      |
| `npm run lint`    | Run the linter                    |

## Project Structure

```
react-weather-dashboard/
├── src/
│   ├── App.jsx       # Main component (search, fetch, chart, forecast)
│   ├── App.css       # Styles
│   ├── index.css     # Base styles
│   └── main.jsx      # Entry point
├── index.html
├── package.json
└── vite.config.js
```

## How It Works

1. **Search**: the city name is sent to the Open-Meteo geocoding API, which returns coordinates.
2. **Location button**: the browser provides coordinates, and BigDataCloud supplies a readable place name.
3. **Forecast**: the coordinates are sent to the Open-Meteo forecast API (current, hourly, and daily data).
4. **Refetching**: a `useEffect` re-runs whenever the selected place or temperature unit changes.

## Notes

- Geolocation works on `localhost`, but a deployed site must use HTTPS (Vercel and Netlify do this automatically).
- Desktop location is estimated from Wi-Fi/IP and may be a few kilometers off.
- Add `venv` and `node_modules` to `.gitignore` if you use git.

## Deployment

Build and deploy the `dist` folder to any static host:

```bat
npm run build
```

Free options: [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/), or GitHub Pages.

## Credits

Weather data by [Open-Meteo.com](https://open-meteo.com/) (licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) for non-commercial use).

## License

MIT

