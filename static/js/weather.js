// cSpell:words uvsolar airquality dewpoint feelslike uvindex uvmax solarrad solarmax heatindex windbearing windgust windspeedavg tempmax tempmin pressuretrend raintoday rainyesterday solarraddaymax uvdaymax temp15min windchill
// cSpell:words VIND REGN FUGTIGHED LUFTTRYK LUFTKVALITET TEMPERATUR Vindstød Dugpunkt Føles Stigende Faldende Stabilt indeks maks Solstråling Vindafkøling Varmeindeks Højde Opdateret NNØ NØ ØNØ ØSØ SSØ SSV VSV VNV
// cSpell:words TIMEPROGNOSER DAGES Prognose gmin gmax Moderat Usund følsomme Meget Farlig
// cSpell:words uvsolar airquality hexToRgba cssVar buildChart openChart closeChart Regnintensitet Dugpunkt Solstråling Luftkvalitet chartjs
// cSpell:words Nymåne Fuldmåne Halvmåne Voksende Aftagende Belysning fuldmåne dage Gibbous Kvartal SOLNEDGANG SOLDATA
const REFRESH_INTERVAL = 60000;

// ── Translations ────────────────────────────────────────────────────────────
const translations = {
  en: {
    wind:           'WIND',
    rain:           'RAIN',
    humidity:       'HUMIDITY',
    pressure:       'PRESSURE',
    uvsolar:        'UV & SOLAR',
    airquality:     'AIR QUALITY',
    temperature:    'TEMPERATURE',
    high:           'H',
    low:            'L',
    gusts:          'Gusts',
    beaufort:       'Beaufort',
    today:          'Today',
    yesterday:      'Yesterday',
    dewpoint:       'Dew point',
    feelslike:      'Feels like',
    rising:         'Rising',
    falling:        'Falling',
    steady:         'Steady',
    uvindex:        'UV Index',
    uvmax:          'UV Max today',
    solarrad:       'Solar Rad',
    solarmax:       'Solar Max',
    avg15:          '15 min avg',
    windchill:      'Wind chill',
    heatindex:      'Heat index',
    elevation:      'Elevation',
    updated:        'Updated',
    hourly:         'HOURLY FORECAST',
    daily_forecast: '14-DAY FORECAST',
    now:            'Now',
    today_short:    'Today',
    dir_n: 'N', dir_e: 'E', dir_s: 'S', dir_w: 'W',
    sunrise_sunset: 'SUNRISE & SUNSET',
    illumination:   'Illumination',
    next_full_moon: 'Next full moon',
    days:           'days',
    moon_phases: {
      'New Moon':       'New Moon',       'Waxing Crescent': 'Waxing Crescent',
      'First Quarter':  'First Quarter',  'Waxing Gibbous':  'Waxing Gibbous',
      'Full Moon':      'Full Moon',      'Waning Gibbous':  'Waning Gibbous',
      'Last Quarter':   'Last Quarter',   'Waning Crescent': 'Waning Crescent',
    },
  },
  da: {
    wind:           'VIND',
    rain:           'REGN',
    humidity:       'FUGTIGHED',
    pressure:       'LUFTTRYK',
    uvsolar:        'UV & SOL',
    airquality:     'LUFTKVALITET',
    temperature:    'TEMPERATUR',
    high:           'H',
    low:            'L',
    gusts:          'Vindstød',
    beaufort:       'Beaufort',
    today:          'I dag',
    yesterday:      'I går',
    dewpoint:       'Dugpunkt',
    feelslike:      'Føles som',
    rising:         'Stigende',
    falling:        'Faldende',
    steady:         'Stabilt',
    uvindex:        'UV-indeks',
    uvmax:          'UV maks i dag',
    solarrad:       'Solstråling',
    solarmax:       'Sol maks',
    avg15:          '15 min gns.',
    windchill:      'Vindafkøling',
    heatindex:      'Varmeindeks',
    elevation:      'Højde',
    updated:        'Opdateret',
    hourly:         'TIMEPROGNOSER',
    daily_forecast: '14-DAGES PROGNOSE',
    now:            'Nu',
    today_short:    'I dag',
    dir_n: 'N', dir_e: 'Ø', dir_s: 'S', dir_w: 'V',
    sunrise_sunset: 'SOL OP & NED',
    illumination:   'Belysning',
    next_full_moon: 'Næste fuldmåne',
    days:           'dage',
    moon_phases: {
      'New Moon':       'Nymåne',           'Waxing Crescent': 'Voksende halvmåne',
      'First Quarter':  'Første kvartal',   'Waxing Gibbous':  'Voksende gibbous',
      'Full Moon':      'Fuldmåne',         'Waning Gibbous':  'Aftagende gibbous',
      'Last Quarter':   'Sidste kvartal',   'Waning Crescent': 'Aftagende halvmåne',
    },
    aqi_categories: {
      'Good':                          'God',
      'Moderate':                      'Moderat',
      'Unhealthy for Sensitive Groups':'Usund for følsomme grupper',
      'Unhealthy':                     'Usund',
      'Very Unhealthy':                'Meget usund',
      'Hazardous':                     'Farlig',
    },
  },
};

// ── Theme state ─────────────────────────────────────────────────────────────
let themePref = localStorage.getItem('theme') || 'auto';
const osLight = window.matchMedia('(prefers-color-scheme: light)');

function applyTheme(pref) {
  themePref = pref;
  localStorage.setItem('theme', pref);
  const applied = pref === 'auto' ? (osLight.matches ? 'light' : 'dark') : pref;
  document.documentElement.dataset.theme = applied;
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.textContent = pref === 'auto' ? '⊙' : pref === 'light' ? '☀' : '☾';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = applied === 'light' ? '#bdd8f0' : '#0d2444';
}

osLight.addEventListener('change', () => { if (themePref === 'auto') applyTheme('auto'); });

// ── Language state ──────────────────────────────────────────────────────────
let currentLang = localStorage.getItem('lang') || 'da';

function applyTranslations(lang) {
  const t = translations[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });
  document.documentElement.lang = lang;
  const btn = document.getElementById('lang-toggle');
  if (btn) btn.textContent = lang === 'en' ? 'DA' : 'EN';
  updateTimestamp();
}

function updateTimestamp() {
  const t = translations[currentLang];
  const now = new Date();
  const el = document.getElementById('last-updated-time');
  if (el) el.textContent = `${t.updated} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const windDirs = {
  en: ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'],
  da: ['N','NNØ','NØ','ØNØ','Ø','ØSØ','SØ','SSØ','S','SSV','SV','VSV','V','VNV','NV','NNV'],
};

// Maps Home Assistant weather condition names to Meteocons PNG filenames
const ICON_MAP = {
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
};

function icon(name, size = 'sm') {
  const file = ICON_MAP[name] || 'not-available.png';
  return `<img class="wi wi-${size}" src="/static/images/${file}" alt="${name || ''}" onerror="this.src='/static/images/not-available.png'">`;
}

function windDir(deg) {
  if (deg == null) return '—';
  return windDirs[currentLang][Math.round(deg / 22.5) % 16];
}

function fmt(val, decimals = 1) {
  return val != null ? Number(val).toFixed(decimals) : '—';
}

function fmtInt(val) {
  return val != null ? Math.round(val) : '—';
}

function fmtHour(iso) {
  const d = new Date(iso);
  return String(d.getHours()).padStart(2, '0');
}

function fmtDay(iso, index) {
  const t = translations[currentLang];
  if (index === 0) return `<span data-i18n="today_short">${t.today_short}</span>`;
  const locale = currentLang === 'da' ? 'da-DK' : 'en-GB';
  return new Date(iso).toLocaleDateString(locale, { weekday: 'short' });
}

function pressureTrendHtml(val) {
  const t = translations[currentLang];
  if (val == null) return '—';
  if (val > 0) return `↑ <span data-i18n="rising">${t.rising}</span>`;
  if (val < 0) return `↓ <span data-i18n="falling">${t.falling}</span>`;
  return `→ <span data-i18n="steady">${t.steady}</span>`;
}

function uvMaskWidth(uv) {
  if (uv == null) return 100;
  return Math.max(0, 100 - Math.min(uv / 11 * 100, 100));
}

function humidityDash(pct) {
  if (pct == null) return '0 314.16';
  return `${(pct / 100 * 314.16).toFixed(1)} 314.16`;
}

function setEl(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ── Forecast builders ────────────────────────────────────────────────────────
function buildHourlyStrip(hours) {
  const container = document.getElementById('hourly-scroll');
  if (!container || !hours.length) return;
  const t = translations[currentLang];

  const now = new Date();
  let nowIndex = 0;
  hours.forEach((h, i) => {
    if (h.datetime && new Date(h.datetime) <= now) nowIndex = i;
  });

  container.innerHTML = hours.map((h, i) => {
    const time = i === nowIndex
      ? `<span data-i18n="now">${t.now}</span>`
      : fmtHour(h.datetime);
    const precip = (h.precipitation_probability > 20)
      ? `${h.precipitation_probability}%`
      : '';
    return `
      <div class="hour-item">
        <div class="hour-time">${time}</div>
        <div class="hour-precip">${precip}</div>
        <div class="hour-icon">${icon(h.icon)}</div>
        <div class="hour-temp">${h.temperature != null ? Math.round(h.temperature) : '—'}°</div>
      </div>`;
  }).join('');

  requestAnimationFrame(() => {
    const nowItem = container.querySelectorAll('.hour-item')[nowIndex];
    if (nowItem) container.scrollLeft = nowItem.offsetLeft;
  });
}

function buildDailyForecast(days) {
  const container = document.getElementById('daily-forecast');
  if (!container || !days.length) return;
  const t = translations[currentLang];

  const slice = days.slice(0, 14);
  const temps = slice.flatMap(d => [d.temperature, d.temp_low].filter(v => v != null));
  const gmin = Math.min(...temps);
  const gmax = Math.max(...temps);
  const span = gmax - gmin || 1;

  const rows = slice.map((d, i) => {
    const lo    = d.temp_low ?? gmin;
    const hi    = d.temperature ?? gmin;
    const left  = Math.max(0, (lo - gmin) / span * 100).toFixed(1);
    const width = Math.max(2, (hi - lo)   / span * 100).toFixed(1);
    const divider = i < slice.length - 1 ? '<div class="daily-divider"></div>' : '';
    return `
      <div class="daily-row">
        <div class="daily-day">${fmtDay(d.datetime, i)}</div>
        <div class="daily-icon">${icon(d.icon)}</div>
        <div class="daily-low">${d.temp_low != null ? Math.round(d.temp_low) : '—'}°</div>
        <div class="daily-bar-bg">
          <div class="daily-bar-fill" style="left:${left}%;width:${width}%"></div>
        </div>
        <div class="daily-high">${d.temperature != null ? Math.round(d.temperature) : '—'}°</div>
      </div>${divider}`;
  }).join('');

  container.innerHTML = `
    <div class="card-label" data-i18n="daily_forecast">${t.daily_forecast}</div>
    <div class="daily-scroll-v">${rows}</div>`;
}

// ── Apply server-rendered data attributes as styles (avoids Jinja/CSS linting conflicts) ──
function initStyles() {
  const needle = document.getElementById('compass-needle');
  if (needle) needle.style.transform = `rotate(${needle.dataset.bearing || 0}deg)`;

  const uvFill = document.getElementById('uv-fill');
  if (uvFill) uvFill.style.width = `${uvFill.dataset.width || 0}%`;

  const uvDot = document.getElementById('uv-dot');
  if (uvDot) uvDot.style.left = `${uvDot.dataset.left || 0}%`;

  const aqiDot = document.getElementById('aqi-dot');
  if (aqiDot) aqiDot.style.left = `${aqiDot.dataset.left || 0}%`;

  const aqiCat = document.getElementById('aqi-category');
  if (aqiCat?.dataset.color) aqiCat.style.color = aqiCat.dataset.color;

  document.querySelectorAll('.daily-bar-fill').forEach(el => {
    if (el.dataset.left  != null) el.style.left  = `${el.dataset.left}%`;
    if (el.dataset.width != null) el.style.width = `${el.dataset.width}%`;
  });
}

// ── Sun arc ──────────────────────────────────────────────────────────────────
function updateSunDot() {
  const svg = document.querySelector('.sun-arc-svg');
  const dot = document.getElementById('sun-dot');
  if (!svg || !dot) return;
  const [rh, rm] = (svg.dataset.sunrise || '06:00').split(':').map(Number);
  const [sh, sm] = (svg.dataset.sunset  || '20:00').split(':').map(Number);
  const now        = new Date();
  const nowMin     = now.getHours() * 60 + now.getMinutes();
  const sunriseMin = rh * 60 + rm;
  const sunsetMin  = sh * 60 + sm;
  let t = nowMin <= sunriseMin ? 0 : nowMin >= sunsetMin ? 1
        : (nowMin - sunriseMin) / (sunsetMin - sunriseMin);
  // Quadratic bezier P0=(10,68) P1=(100,8) P2=(190,68)
  const cx = (1-t)**2 * 10 + 2*t*(1-t) * 100 + t**2 * 190;
  const cy = (1-t)**2 * 68 + 2*t*(1-t) * 8   + t**2 * 68;
  dot.setAttribute('cx', cx.toFixed(1));
  dot.setAttribute('cy', cy.toFixed(1));
}

// ── Realtime data update ─────────────────────────────────────────────────────
function updatePage(d) {
  const heroIcon = document.getElementById('hero-icon');
  if (heroIcon && d.icon) {
    heroIcon.src = `/static/images/${ICON_MAP[d.icon] || 'not-available.png'}`;
    heroIcon.alt = d.icon;
  }
  setEl('temp-now', d.temperature != null ? `${fmtInt(d.temperature)}°` : '—');
  setEl('temp-max', d.tempmax != null ? `${fmtInt(d.tempmax)}°` : '—');
  setEl('temp-min', d.tempmin != null ? `${fmtInt(d.tempmin)}°` : '—');
  setEl('description', d.description || '');

  const needle = document.getElementById('compass-needle');
  if (needle && d.windbearing != null) needle.style.transform = `rotate(${d.windbearing}deg)`;

  const windEl = document.getElementById('wind-speed');
  if (windEl) windEl.innerHTML = `${fmt(d.windspeedavg)} <span class="unit">m/s</span>`;

  setEl('wind-dir-label', windDir(d.windbearing));
  setEl('wind-gust', fmt(d.windgust));
  setEl('beaufort', d.beaufort != null ? d.beaufort : '—');

  const rainRateEl = document.getElementById('rain-rate');
  if (rainRateEl) rainRateEl.innerHTML = `${fmt(d.rainrate)} <span class="unit">mm/h</span>`;
  setEl('rain-today', d.raintoday != null ? `${fmt(d.raintoday)} mm` : '0.0 mm');
  setEl('rain-yesterday', d.rainyesterday != null ? `${fmt(d.rainyesterday)} mm` : '0.0 mm');

  const arc = document.getElementById('humidity-arc');
  if (arc) arc.setAttribute('stroke-dasharray', humidityDash(d.humidity));
  setEl('humidity-val', d.humidity != null ? `${d.humidity}%` : '—');
  setEl('dewpoint', d.dewpoint != null ? `${fmt(d.dewpoint)}°` : '—');

  const feelsLike = d.heatindex != null ? d.heatindex : d.windchill;
  setEl('feels-like', feelsLike != null ? `${fmtInt(feelsLike)}°` : '—');

  const pressureArc = document.getElementById('pressure-arc');
  if (pressureArc && d.sealevelpressure != null) {
    const frac = Math.min(1, Math.max(0, (d.sealevelpressure - 960) / 100));
    pressureArc.setAttribute('stroke-dasharray', `${(frac * 169.65).toFixed(1)} 169.65`);
  }
  setEl('pressure-val', d.sealevelpressure != null ? fmt(d.sealevelpressure) : '—');

  const trendEl = document.getElementById('pressure-trend');
  if (trendEl) trendEl.innerHTML = pressureTrendHtml(d.pressuretrend);

  const uvFill = document.getElementById('uv-fill');
  if (uvFill) uvFill.style.width = `${uvMaskWidth(d.uv)}%`;
  const uvDot = document.getElementById('uv-dot');
  if (uvDot) uvDot.style.left = `${d.uv != null ? Math.min(d.uv / 11 * 100, 100) : 0}%`;
  setEl('uv-val', fmt(d.uv));
  setEl('uv-max', fmt(d.uvdaymax));
  setEl('solar', d.solarrad != null ? `${fmtInt(d.solarrad)} W/m²` : '—');
  setEl('solar-max', d.solarraddaymax != null ? `${fmtInt(d.solarraddaymax)} W/m²` : '—');

  setEl('pm1', fmt(d.pm1));
  setEl('pm25', fmt(d.pm25));
  setEl('pm10', fmt(d.pm10));

  if (d.aqi) {
    const dot = document.getElementById('aqi-dot');
    if (dot) dot.style.left = `${d.aqi.percent}%`;
    setEl('aqi-number', d.aqi.aqi);
    const catEl = document.getElementById('aqi-category');
    if (catEl) {
      const cats = translations[currentLang].aqi_categories;
      catEl.textContent = cats?.[d.aqi.category] ?? d.aqi.category;
      catEl.style.color = d.aqi.color;
    }
  }

  if (d.sun) {
    const svg = document.querySelector('.sun-arc-svg');
    if (svg) { svg.dataset.sunrise = d.sun.sunrise; svg.dataset.sunset = d.sun.sunset; }
    updateSunDot();
  }

  if (d.moon) {
    const t = translations[currentLang];
    const phaseEl = document.getElementById('moon-phase-label');
    if (phaseEl) phaseEl.textContent = t.moon_phases?.[d.moon.phase] ?? d.moon.phase;
    setEl('moon-illumination', `${d.moon.illumination}%`);
    setEl('moon-days-to-full', `${d.moon.days_to_full} ${t.days}`);
  }

  setEl('temp15', d.temp15min != null ? `${fmt(d.temp15min)}°` : '—');
  setEl('windchill', d.windchill != null ? `${fmt(d.windchill)}°` : '—');
  setEl('heatindex', d.heatindex != null ? `${fmt(d.heatindex)}°` : '—');

  updateTimestamp();
  applyTranslations(currentLang);
}

// ── History Charts ───────────────────────────────────────────────────────────
const HISTORY_CONFIGS = {
  temperature: {
    title:   { en: 'Temperature — 36h', da: 'Temperatur — 36t' },
    fields:  'temperature,wind_chill,heat_index',
    yLabel:  '°C',
    datasets: [
      { field: 'temperature', label: { en: 'Temperature', da: 'Temperatur'  }, color: '#ef5350' },
      { field: 'wind_chill',  label: { en: 'Wind chill',  da: 'Vindafkøling'}, color: '#4fc3f7' },
      { field: 'heat_index',  label: { en: 'Heat index',  da: 'Varmeindeks' }, color: '#ff9800' },
    ],
  },
  wind: {
    title:   { en: 'Wind — 36h', da: 'Vind — 36t' },
    fields:  'wind_speed,wind_gust',
    yLabel:  'm/s',
    datasets: [
      { field: 'wind_speed', label: { en: 'Wind speed', da: 'Vindstyrke' }, color: '#66bb6a' },
      { field: 'wind_gust',  label: { en: 'Gusts',      da: 'Vindstød'  }, color: '#ffca28' },
    ],
  },
  rain: {
    title:   { en: 'Rain — 36h', da: 'Regn — 36t' },
    fields:  'rain_rate',
    yLabel:  'mm/h',
    datasets: [
      { field: 'rain_rate', label: { en: 'Rain rate', da: 'Regnintensitet' }, color: '#4fc3f7', fill: true },
    ],
  },
  humidity: {
    title:     { en: 'Humidity — 36h', da: 'Fugtighed — 36t' },
    fields:    'humidity,dewpoint',
    yLabel:    '%',
    y2Label:   '°C',
    dualAxis:  true,
    datasets: [
      { field: 'humidity', label: { en: 'Humidity',  da: 'Fugtighed' }, color: '#42a5f5', yAxisID: 'y'  },
      { field: 'dewpoint', label: { en: 'Dew point', da: 'Dugpunkt'  }, color: '#80cbc4', yAxisID: 'y2' },
    ],
  },
  pressure: {
    title:   { en: 'Pressure — 36h', da: 'Lufttryk — 36t' },
    fields:  'pressure',
    yLabel:  'hPa',
    datasets: [
      { field: 'pressure', label: { en: 'Pressure', da: 'Lufttryk' }, color: '#ab47bc' },
    ],
  },
  uvsolar: {
    title:    { en: 'UV & Solar — 36h', da: 'UV & Sol — 36t' },
    fields:   'solar_radiation,uv',
    yLabel:   'W/m²',
    y2Label:  'UV',
    dualAxis: true,
    datasets: [
      { field: 'solar_radiation', label: { en: 'Solar radiation', da: 'Solstråling' }, color: '#ffd54f', yAxisID: 'y',  fill: true },
      { field: 'uv',              label: { en: 'UV index',        da: 'UV-indeks'   }, color: '#ff9800', yAxisID: 'y2' },
    ],
  },
  airquality: {
    title:   { en: 'Air Quality — 36h', da: 'Luftkvalitet — 36t' },
    fields:  'air_Quality_pm1,air_Quality_pm25,air_Quality_pm10',
    yLabel:  'µg/m³',
    datasets: [
      { field: 'air_Quality_pm1',  label: { en: 'PM1',  da: 'PM1'  }, color: '#ef9a9a' },
      { field: 'air_Quality_pm25', label: { en: 'PM2.5',da: 'PM2.5'}, color: '#ef5350' },
      { field: 'air_Quality_pm10', label: { en: 'PM10', da: 'PM10' }, color: '#b71c1c' },
    ],
  },
};

let activeChart = null;

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function buildChart(rows, config) {
  const canvas = document.getElementById('chart-canvas');
  if (activeChart) { activeChart.destroy(); activeChart = null; }

  const gridColor  = hexToRgba('#888888', 0.18);
  const textColor  = cssVar('--text-dim') || '#aaa';

  const datasets = config.datasets.map(ds => ({
    label:           ds.label[currentLang] ?? ds.label.en,
    data:            rows.map(r => ({ x: r.logdate, y: r[ds.field] })),
    borderColor:     ds.color,
    backgroundColor: ds.fill ? hexToRgba(ds.color, 0.22) : 'transparent',
    fill:            ds.fill ?? false,
    borderWidth:     1.5,
    pointRadius:     0,
    tension:         0.3,
    yAxisID:         ds.yAxisID ?? 'y',
  }));

  const scales = {
    x: {
      type: 'time',
      time: {
        tooltipFormat:  'dd MMM HH:mm',
        displayFormats: { hour: 'HH:mm', day: 'dd MMM' },
      },
      ticks: { color: textColor, maxTicksLimit: 8 },
      grid:  { color: gridColor },
    },
    y: {
      title: { display: !!config.yLabel, text: config.yLabel, color: textColor },
      ticks: { color: textColor },
      grid:  { color: gridColor },
    },
  };

  if (config.dualAxis) {
    scales.y2 = {
      position: 'right',
      title:    { display: !!config.y2Label, text: config.y2Label, color: textColor },
      ticks:    { color: textColor },
      grid:     { drawOnChartArea: false },
    };
  }

  activeChart = new Chart(canvas, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend:  { labels: { color: textColor, boxWidth: 12, padding: 12 } },
        tooltip: { backgroundColor: hexToRgba('#1a3a5c', 0.95) },
      },
      scales,
    },
  });
}

async function openChart(chartKey) {
  const config = HISTORY_CONFIGS[chartKey];
  if (!config) return;
  const modal   = document.getElementById('chart-modal');
  const titleEl = document.getElementById('chart-modal-title');
  titleEl.textContent = config.title[currentLang] ?? config.title.en;
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  try {
    const res = await fetch(`/api/history?fields=${config.fields}`);
    if (!res.ok) throw new Error('fetch failed');
    buildChart(await res.json(), config);
  } catch (e) {
    console.warn('Chart fetch failed:', e);
  }
}

function closeChart() {
  document.getElementById('chart-modal').hidden = true;
  document.body.style.overflow = '';
  if (activeChart) { activeChart.destroy(); activeChart = null; }
}

document.querySelectorAll('.chart-btn').forEach(btn => {
  btn.addEventListener('click', () => openChart(btn.dataset.chart));
});
document.getElementById('chart-modal-close').addEventListener('click', closeChart);
document.getElementById('chart-modal-backdrop').addEventListener('click', closeChart);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeChart(); });

// ── Fetch all data ───────────────────────────────────────────────────────────
async function fetchAndUpdate() {
  try {
    const [dataRes, hourlyRes, dailyRes] = await Promise.all([
      fetch('/api/data'),
      fetch('/api/hourly'),
      fetch('/api/daily'),
    ]);
    if (dataRes.ok)   updatePage(await dataRes.json());
    if (hourlyRes.ok) buildHourlyStrip(await hourlyRes.json());
    if (dailyRes.ok)  buildDailyForecast(await dailyRes.json());
  } catch (e) {
    console.warn('Weather fetch failed:', e);
  }
}

// ── Boot ────────────────────────────────────────────────────────────────────
document.getElementById('theme-toggle').addEventListener('click', () => {
  applyTheme(themePref === 'auto' ? 'light' : themePref === 'light' ? 'dark' : 'auto');
});

applyTheme(themePref);

document.getElementById('lang-toggle').addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'da' : 'en';
  localStorage.setItem('lang', currentLang);
  applyTranslations(currentLang);
  fetchAndUpdate();
});

applyTranslations(currentLang);
initStyles();
fetchAndUpdate();
updateSunDot();

// Scroll the server-rendered hourly strip to "Now" immediately on load
(function () {
  const scroll = document.getElementById('hourly-scroll');
  if (!scroll) return;
  const idx   = parseInt(scroll.dataset.nowIndex || '0', 10);
  const items = scroll.querySelectorAll('.hour-item');
  if (items[idx]) scroll.scrollLeft = items[idx].offsetLeft;
})();

setInterval(fetchAndUpdate, REFRESH_INTERVAL);
