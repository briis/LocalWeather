// cSpell:words uvsolar airquality dewpoint feelslike uvindex uvmax solarrad solarmax heatindex windbearing windgust windspeedavg tempmax tempmin pressuretrend raintoday rainyesterday solarraddaymax uvdaymax temp15min windchill
// cSpell:words VIND REGN FUGTIGHED LUFTTRYK LUFTKVALITET TEMPERATUR Vindstød Dugpunkt Føles Stigende Faldende Stabilt indeks maks Solstråling Vindafkøling Varmeindeks Højde Opdateret NNØ NØ ØNØ ØSØ SSØ SSV VSV VNV
// cSpell:words TIMEPROGNOSER DAGES Prognose gmin gmax Moderat Usund følsomme Meget Farlig
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

// ── Language state ──────────────────────────────────────────────────────────
let currentLang = localStorage.getItem('lang') || 'en';

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
  container.innerHTML = hours.map((h, i) => {
    const time = i === 0
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
}

function buildDailyForecast(days) {
  const container = document.getElementById('daily-forecast');
  if (!container || !days.length) return;
  const t = translations[currentLang];

  const temps = days.flatMap(d => [d.temperature, d.temp_low].filter(v => v != null));
  const gmin = Math.min(...temps);
  const gmax = Math.max(...temps);
  const span = gmax - gmin || 1;

  const label = container.querySelector('.card-label');
  const rows = days.map((d, i) => {
    const lo   = d.temp_low ?? gmin;
    const hi   = d.temperature ?? gmin;
    const left  = Math.max(0, (lo - gmin) / span * 100).toFixed(1);
    const width = Math.max(2, (hi - lo)   / span * 100).toFixed(1);
    const divider = i < days.length - 1 ? '<div class="daily-divider"></div>' : '';
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
    ${rows}`;
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

  const pressureEl = document.getElementById('pressure');
  if (pressureEl) pressureEl.innerHTML = `${fmt(d.sealevelpressure)} <span class="unit">hPa</span>`;

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

  setEl('temp15', d.temp15min != null ? `${fmt(d.temp15min)}°` : '—');
  setEl('windchill', d.windchill != null ? `${fmt(d.windchill)}°` : '—');
  setEl('heatindex', d.heatindex != null ? `${fmt(d.heatindex)}°` : '—');

  updateTimestamp();
  applyTranslations(currentLang);
}

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
document.getElementById('lang-toggle').addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'da' : 'en';
  localStorage.setItem('lang', currentLang);
  applyTranslations(currentLang);
  fetchAndUpdate();
});

applyTranslations(currentLang);
fetchAndUpdate();
setInterval(fetchAndUpdate, REFRESH_INTERVAL);
