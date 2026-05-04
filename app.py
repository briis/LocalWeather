from flask import Flask, render_template, jsonify
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)

DB_CONFIG = {
    'host': '192.168.1.9',
    'database': 'weather_history',
    'user': 'weather_user',
    'password': 'pfe27co-@yRr4oLP',
    'connect_timeout': 5,
}

def get_weather_data():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM realtime_data ORDER BY ID DESC LIMIT 1")
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        return row
    except Error as e:
        return None

def wind_direction(degrees):
    if degrees is None:
        return '—'
    dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW']
    return dirs[round(degrees / 22.5) % 16]

@app.route('/')
def index():
    data = get_weather_data()
    direction = wind_direction(data.get('windbearing') if data else None)
    return render_template('index.html', data=data, wind_dir=direction)

@app.route('/api/data')
def api_data():
    data = get_weather_data()
    if data is None:
        return jsonify({'error': 'No data'}), 503
    direction = wind_direction(data.get('windbearing'))
    data['wind_dir_label'] = direction
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
