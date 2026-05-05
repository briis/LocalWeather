# LocalWeather

<!-- cSpell:words gunicorn pytz localweather Meteocons Glassmorphism WSGI forecas -->

A responsive, Apple Weather-inspired dashboard that reads real-time data from a local MySQL database and displays it in a browser or as an iOS/Android home screen web app.

![Python](https://img.shields.io/badge/Python-3.12+-blue) ![Flask](https://img.shields.io/badge/Flask-3.x-green) ![License](https://img.shields.io/badge/license-MIT-lightgrey)

## Features

- **Real-time weather** — temperature, wind, rain, humidity, pressure, UV index, solar radiation, air quality (PM1 / PM2.5 / PM10 with AQI)
- **Hourly forecast** — scrollable 72-hour strip, automatically positioned at the current hour
- **14-day forecast** — vertically scrollable daily strip with temperature range bars
- **Sunrise & sunset** — animated arc showing the sun's current position through the day
- **Moon phase** — SVG phase graphic, illumination percentage, and days to next full moon
- **EN / DA language toggle** — all widget labels and values switch between English and Danish, preference saved in `localStorage`
- **PWA / iOS web app** — installable on iPhone/iPad, supports `viewport-fit=cover` and safe-area insets
- **Auto-refresh** — data updates every 60 seconds without a page reload

## Screenshots

> Add screenshots here.

## Architecture

```text
MySQL (weather_history)
  ├── realtime_data      ← live station readings
  ├── forecast_hourly    ← 72-hour hourly forecast
  └── forecast_daily     ← 14-day daily forecast

Flask (app.py)  →  Jinja2 template  →  Browser
                →  /api/data        ← JS polled every 60 s
                →  /api/hourly
                →  /api/daily
```

## Configuration

Edit the top of [app.py](app.py) before deploying:

```python
# Database
DB_CONFIG = {
    'host':     '192.168.1.9',
    'database': 'weather_history',
    'user':     'weather_user',
    'password': 'your-password',
}

# Station location — used for sunrise/sunset and moon calculations
STATION_LAT = 55.64   # degrees North
STATION_LON = 12.09   # degrees East
STATION_TZ  = 'Europe/Copenhagen'
```

## Database Schema

The app reads from three tables. Reference schemas are in [Docs/](Docs/).

| Table | Description |
| --- | --- |
| `realtime_data` | Latest station reading (temperature, wind, rain, UV, AQI sensors, …) |
| `forecast_hourly` | One row per forecast hour (`hour_num` 0–71, starting midnight local time) |
| `forecast_daily` | One row per forecast day (`day_num` 0–13) |

## Development

Requires Docker and Docker Compose.

```bash
# Clone
git clone https://github.com/briis/LocalWeather
cd LocalWeather

# Start dev server (live-reloads on file changes)
docker compose up --build
```

The app is available at <http://localhost:8080>.

The container mounts the project directory as a volume, so any file change is reflected immediately without rebuilding.

## Production Deployment (Proxmox LXC)

Run the deploy script on the LXC as root. It installs all dependencies, sets up a Python virtual environment, configures `gunicorn` as a systemd service, and puts nginx in front of it.

```bash
# With a GitHub Personal Access Token (recommended)
GITHUB_TOKEN=ghp_xxxxxxxxxxxx bash deploy/deploy.sh

# Or from a local clone (copy files first)
bash deploy/deploy.sh
```

The script will:

1. Install `python3`, `nginx`, and `git` via `apt`
2. Clone / pull the repository into `/opt/localweather`
3. Create a Python virtual environment and install `requirements.txt`
4. Install and start the `localweather` systemd service (Gunicorn)
5. Configure nginx as a reverse proxy and restart it

The app will be served on **port 80** of the LXC's IP address.

### Deployment files

| File | Purpose |
| --- | --- |
| [deploy/deploy.sh](deploy/deploy.sh) | One-shot install + update script |
| [deploy/localweather.service](deploy/localweather.service) | systemd unit for Gunicorn |
| [deploy/localweather.nginx](deploy/localweather.nginx) | nginx reverse proxy config |

## API Endpoints

| Endpoint | Description |
| --- | --- |
| `GET /` | Main dashboard (server-rendered HTML) |
| `GET /api/data` | Latest realtime data as JSON, including AQI, sun, and moon |
| `GET /api/hourly` | Hourly forecast (72 entries) as JSON |
| `GET /api/daily` | Daily forecast (14 entries) as JSON |

## Project Structure

```text
LocalWeather/
├── app.py                  # Flask app, DB queries, AQI / sun / moon logic
├── aqi_calculator.py       # EPA AQI calculation from PM2.5 and PM10
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── templates/
│   └── index.html          # Single-page Jinja2 template
├── static/
│   ├── css/style.css       # Glassmorphism UI, responsive grid
│   ├── js/weather.js       # Auto-refresh, language switching, forecast builders
│   ├── images/             # Meteocons PNG weather icons
│   ├── favicon.svg
│   └── manifest.json       # PWA manifest
├── deploy/
│   ├── deploy.sh
│   ├── localweather.service
│   └── localweather.nginx
└── Docs/
    ├── realtime_data_structure.sql
    ├── forecas_data_structure.sql
    └── minute_data_structure.sql
```

## Dependencies

| Package | Purpose |
| --- | --- |
| `flask` | Web framework |
| `mysql-connector-python` | MySQL database access |
| `astral` | Sunrise / sunset and moon phase calculations |
| `pytz` | Timezone-aware datetime handling |
| `gunicorn` | Production WSGI server (installed by deploy script) |

## License

MIT — see [LICENSE](LICENSE).
