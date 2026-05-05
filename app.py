from flask import Flask, render_template, jsonify
import mysql.connector
from mysql.connector import Error
from aqi_calculator import calculate_aqi

app = Flask(__name__)

DB_CONFIG = {
    'host': '192.168.1.9',
    'database': 'weather_history',
    'user': 'weather_user',
    'password': 'pfe27co-@yRr4oLP',
    'connect_timeout': 5,
}

# Maps Home Assistant weather condition names to Meteocons PNG filenames
ICON_MAP = {
    'sunny':           'clear-day.png',
    'clear-night':     'clear-night.png',
    'partlycloudy':    'partly-cloudy-day.png',
    'cloudy':          'cloudy.png',
    'fog':             'fog.png',
    'rainy':           'rain.png',
    'pouring':         'overcast-rain.png',
    'snowy':           'snow.png',
    'snowy-rainy':     'sleet.png',
    'hail':            'hail.png',
    'lightning':       'thunderstorms.png',
    'lightning-rainy': 'thunderstorms-rain.png',
    'windy':           'wind.png',
    'windy-variant':   'wind.png',
    'exceptional':     'extreme.png',
}

def weather_icon(name):
    return ICON_MAP.get(name or '', 'not-available.png')

app.jinja_env.filters['weather_icon'] = weather_icon


def _query(sql, limit=None):
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql)
        rows = cursor.fetchall() if limit != 1 else [cursor.fetchone()]
        cursor.close()
        conn.close()
        return rows[0] if limit == 1 else rows
    except Error:
        return None if limit == 1 else []

def get_weather_data():
    return _query("SELECT * FROM realtime_data ORDER BY ID DESC LIMIT 1", limit=1)

def get_hourly_forecast():
    return _query("SELECT * FROM forecast_hourly ORDER BY hour_num ASC LIMIT 72")

def get_daily_forecast():
    return _query("SELECT * FROM forecast_daily ORDER BY day_num ASC LIMIT 14")


def serialize(row):
    return {k: (v.isoformat() if hasattr(v, 'isoformat') else v) for k, v in row.items()}


def wind_direction(degrees):
    if degrees is None:
        return '—'
    dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW']
    return dirs[round(degrees / 22.5) % 16]


def calc_aqi(data):
    if not data:
        return None
    result = calculate_aqi(pm25=data.get('pm25'), pm10=data.get('pm10'))
    if result is None:
        return None
    return {
        'aqi':      result.aqi,
        'category': result.category,
        'color':    result.color,
        'pollutant': result.pollutant,
        'percent':  round(min(result.aqi / 500 * 100, 100), 1),
    }


def calc_bars(daily):
    temps = [d[f] for d in daily for f in ('temperature', 'temp_low') if d.get(f) is not None]
    gmin = min(temps) if temps else 0
    gmax = max(temps) if temps else 30
    span = gmax - gmin or 1
    bars = []
    for d in daily:
        lo = d.get('temp_low') or gmin
        hi = d.get('temperature') or gmin
        bars.append({
            'left':  round(max(0, (lo - gmin) / span * 100), 1),
            'width': round(max(2, (hi - lo)  / span * 100), 1),
        })
    return bars


@app.route('/')
def index():
    data    = get_weather_data()
    hourly  = get_hourly_forecast()
    daily   = get_daily_forecast()
    direction = wind_direction(data.get('windbearing') if data else None)
    bars    = calc_bars(daily)
    aqi = calc_aqi(data)
    return render_template('index.html',
        data=data, wind_dir=direction,
        hourly=hourly, daily=daily, bars=bars, aqi=aqi)


@app.route('/api/data')
def api_data():
    data = get_weather_data()
    if data is None:
        return jsonify({'error': 'No data'}), 503
    data['wind_dir_label'] = wind_direction(data.get('windbearing'))
    aqi = calc_aqi(data)
    row = serialize(data)
    if aqi:
        row['aqi'] = aqi
    return jsonify(row)

@app.route('/api/hourly')
def api_hourly():
    return jsonify([serialize(r) for r in get_hourly_forecast()])

@app.route('/api/daily')
def api_daily():
    return jsonify([serialize(r) for r in get_daily_forecast()])


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
