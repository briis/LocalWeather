// cSpell:words uvsolar airquality dewpoint feelslike uvindex uvmax solarrad solarmax heatindex windbearing windgust windspeedavg tempmax tempmin pressuretrend raintoday rainyesterday solarraddaymax uvdaymax temp15min windchill
// cSpell:words VIND REGN FUGTIGHED LUFTTRYK LUFTKVALITET TEMPERATUR Vindstød Dugpunkt Føles Stigende Faldende Stabilt indeks maks Solstråling Vindafkøling Varmeindeks Højde Opdateret
const REFRESH_INTERVAL = 60000;

// ── Translations ────────────────────────────────────────────────────────────
const translations = {
  en: {
    wind:        'WIND',
    rain:        'RAIN',
    humidity:    'HUMIDITY',
    pressure:    'PRESSURE',
    uvsolar:     'UV & SOLAR',
    airquality:  'AIR QUALITY',
    temperature: 'TEMPERATURE',
    high:        'H',
    low:         'L',
    gusts:       'Gusts',
    beaufort:    'Beaufort',
    today:       'Today',
    yesterday:   'Yesterday',
    dewpoint:    'Dew point',
    feelslike:   'Feels like',
    rising:      'Rising',
    falling:     'Falling',
    steady:      'Steady',
    uvindex:     'UV Index',
    uvmax:       'UV Max today',
    solarrad:    'Solar Rad',
    solarmax:    'Solar Max',
    avg15:       '15 min avg',
    windchill:   'Wind chill',
    heatindex:   'Heat index',
    elevation:   'Elevation',
    updated:     'Updated',
  },
  da: {
    wind:        'VIND',
    rain:        'REGN',
    humidity:    'FUGTIGHED',
    pressure:    'LUFTTRYK',
    uvsolar:     'UV & SOL',
    airquality:  'LUFTKVALITET',
    temperature: 'TEMPERATUR',
    high:        'H',
    low:         'L',
    gusts:       'Vindstød',
    beaufort:    'Beaufort',
    today:       'I dag',
    yesterday:   'I går',
    dewpoint:    'Dugpunkt',
    feelslike:   'Føles som',
    rising:      'Stigende',
    falling:     'Faldende',
    steady:      'Stabilt',
    uvindex:     'UV-indeks',
    uvmax:       'UV maks i dag',
    solarrad:    'Solstråling',
    solarmax:    'Sol maks',
    avg15:       '15 min gns.',
    windchill:   'Vindafkøling',
    heatindex:   'Varmeindeks',
    elevation:   'Højde',
    updated:     'Opdateret',
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
function windDir(deg) {
  if (deg == null) return '—';
  const dirs = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
}

function fmt(val, decimals = 1) {
  return val != null ? Number(val).toFixed(decimals) : '—';
}

function fmtInt(val) {
  return val != null ? Math.round(val) : '—';
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

// ── Data update ─────────────────────────────────────────────────────────────
function updatePage(d) {
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
  if (trendEl) {
    trendEl.innerHTML = pressureTrendHtml(d.pressuretrend);
  }

  const uvFill = document.getElementById('uv-fill');
  if (uvFill) uvFill.style.width = `${uvMaskWidth(d.uv)}%`;
  setEl('uv-val', fmt(d.uv));
  setEl('uv-max', fmt(d.uvdaymax));
  setEl('solar', d.solarrad != null ? `${fmtInt(d.solarrad)} W/m²` : '—');
  setEl('solar-max', d.solarraddaymax != null ? `${fmtInt(d.solarraddaymax)} W/m²` : '—');

  setEl('pm1', fmt(d.pm1));
  setEl('pm25', fmt(d.pm25));
  setEl('pm10', fmt(d.pm10));

  setEl('temp15', d.temp15min != null ? `${fmt(d.temp15min)}°` : '—');
  setEl('windchill', d.windchill != null ? `${fmt(d.windchill)}°` : '—');
  setEl('heatindex', d.heatindex != null ? `${fmt(d.heatindex)}°` : '—');

  updateTimestamp();

  // Re-apply translations so any newly injected data-i18n spans are translated
  applyTranslations(currentLang);
}

async function fetchAndUpdate() {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) return;
    const data = await res.json();
    updatePage(data);
  } catch (e) {
    console.warn('Weather fetch failed:', e);
  }
}

// ── Boot ────────────────────────────────────────────────────────────────────
document.getElementById('lang-toggle').addEventListener('click', () => {
  currentLang = currentLang === 'en' ? 'da' : 'en';
  localStorage.setItem('lang', currentLang);
  applyTranslations(currentLang);
});

applyTranslations(currentLang);
setInterval(fetchAndUpdate, REFRESH_INTERVAL);
