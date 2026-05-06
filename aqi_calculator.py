"""AQI Calculator for PM2.5 and PM10.

Based on US EPA breakpoints (revised 2024).
"""

from dataclasses import dataclass

_PM25_BREAKPOINTS = [
    (0.0, 9.0, 0, 50),
    (9.1, 35.4, 51, 100),
    (35.5, 55.4, 101, 150),
    (55.5, 125.4, 151, 200),
    (125.5, 225.4, 201, 300),
    (225.5, 325.4, 301, 500),
]

_PM10_BREAKPOINTS = [
    (0, 54, 0, 50),
    (55, 154, 51, 100),
    (155, 254, 101, 150),
    (255, 354, 151, 200),
    (355, 424, 201, 300),
    (425, 604, 301, 500),
]

AQI_CATEGORIES = [
    (0, 50, "Good", "#00E400"),
    (51, 100, "Moderate", "#FFFF00"),
    (101, 150, "Unhealthy for Sensitive Groups", "#FF7E00"),
    (151, 200, "Unhealthy", "#FF0000"),
    (201, 300, "Very Unhealthy", "#8F3F97"),
    (301, 500, "Hazardous", "#7E0023"),
]


@dataclass
class AQIResult:
    """Holds the computed AQI value, category, color, and per-pollutant sub-indices."""

    aqi: int
    category: str
    color: str
    pollutant: str
    pm25_aqi: int | None
    pm10_aqi: int | None


def _find_breakpoint(concentration: float, breakpoints: list) -> tuple | None:
    for c_low, c_high, aqi_low, aqi_high in breakpoints:
        if c_low <= concentration <= c_high:
            return c_low, c_high, aqi_low, aqi_high
    return None


def _linear_interpolation(concentration: float, breakpoints: list) -> int | None:
    row = _find_breakpoint(concentration, breakpoints)
    if row is None:
        return None
    c_low, c_high, aqi_low, aqi_high = row
    aqi = ((aqi_high - aqi_low) / (c_high - c_low)) * (concentration - c_low) + aqi_low
    return round(aqi)


def _truncate_pm25(value: float) -> float:
    return int(value * 10) / 10


def _truncate_pm10(value: float) -> float:
    return int(value)


def _aqi_to_category(aqi: int) -> tuple[str, str]:
    for low, high, name, color in AQI_CATEGORIES:
        if low <= aqi <= high:
            return name, color
    return "Hazardous", "#7E0023"


def calculate_aqi(
    pm25: float | None = None,
    pm10: float | None = None,
) -> AQIResult | None:
    """Calculate AQI from PM2.5 and/or PM10 concentrations; returns None if neither is provided."""
    pm25_aqi: int | None = None
    pm10_aqi: int | None = None

    if pm25 is not None:
        pm25_aqi = _linear_interpolation(_truncate_pm25(pm25), _PM25_BREAKPOINTS)
    if pm10 is not None:
        pm10_aqi = _linear_interpolation(_truncate_pm10(pm10), _PM10_BREAKPOINTS)

    valid = {
        k: v for k, v in {"PM2.5": pm25_aqi, "PM10": pm10_aqi}.items() if v is not None
    }
    if not valid:
        return None

    dominant = max(valid, key=lambda k: valid[k])
    dominant_aqi = valid[dominant]
    category, color = _aqi_to_category(dominant_aqi)

    return AQIResult(
        aqi=dominant_aqi,
        category=category,
        color=color,
        pollutant=dominant,
        pm25_aqi=pm25_aqi,
        pm10_aqi=pm10_aqi,
    )
