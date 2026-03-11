import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Weather.css';

const CITIES = [
    { name: 'Pune',        state: 'Maharashtra',    temp: 28, feels: 30, humidity: 62, wind: 14, condition: 'partly_cloudy', icon: '⛅', rain: 20, uv: 6, forecast: [28,29,31,30,27,26,28] },
    { name: 'Ludhiana',    state: 'Punjab',          temp: 22, feels: 20, humidity: 55, wind: 18, condition: 'sunny',         icon: '☀️', rain: 5,  uv: 7, forecast: [22,24,25,23,21,20,22] },
    { name: 'Nashik',      state: 'Maharashtra',    temp: 25, feels: 27, humidity: 70, wind: 12, condition: 'cloudy',        icon: '☁️', rain: 40, uv: 4, forecast: [25,24,22,21,23,25,26] },
    { name: 'Guntur',      state: 'Andhra Pradesh', temp: 34, feels: 38, humidity: 72, wind: 10, condition: 'hot_humid',   icon: '🌤️', rain: 15, uv: 9, forecast: [34,35,33,32,34,36,35] },
    { name: 'Indore',      state: 'Madhya Pradesh', temp: 30, feels: 33, humidity: 58, wind: 16, condition: 'windy',         icon: '🌬️', rain: 10, uv: 7, forecast: [30,31,29,28,30,32,30] },
    { name: 'Shimla',      state: 'Himachal Pradesh',temp:12, feels: 9,  humidity: 80, wind: 22, condition: 'rain_showers',  icon: '🌧️', rain: 80, uv: 2, forecast: [12,10,8,11,13,14,12]  },
    { name: 'Jaipur',      state: 'Rajasthan',       temp: 35, feels: 38, humidity: 30, wind: 20, condition: 'very_hot',     icon: '🔆', rain: 2,  uv: 10,forecast: [35,36,38,37,34,33,35] },
    { name: 'Bengaluru',   state: 'Karnataka',       temp: 24, feels: 25, humidity: 68, wind: 11, condition: 'pleasant',     icon: '🌥️', rain: 25, uv: 5, forecast: [24,23,22,24,25,26,24] },
    { name: 'Patna',       state: 'Bihar',            temp: 27, feels: 30, humidity: 75, wind: 9,  condition: 'foggy',       icon: '🌫️', rain: 30, uv: 3, forecast: [27,26,28,29,27,25,26] },
    { name: 'Bhopal',      state: 'Madhya Pradesh', temp: 29, feels: 32, humidity: 65, wind: 13, condition: 'partly_cloudy', icon: '⛅', rain: 35, uv: 6, forecast: [29,30,28,27,29,31,30] },
];

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

const SOIL_TEMP_DATA = [
    { region: 'Punjab',       soilTemp: 18, moisture: 'high',   advisory: 'Ideal for wheat sowing' },
    { region: 'Maharashtra',  soilTemp: 24, moisture: 'medium', advisory: 'Good for cotton, soybean' },
    { region: 'Andhra Pradesh',soilTemp:28, moisture: 'low',    advisory: 'Irrigate before planting rice' },
    { region: 'Karnataka',    soilTemp: 22, moisture: 'high',   advisory: 'Perfect for ragi cultivation' },
    { region: 'Rajasthan',    soilTemp: 30, moisture: 'very_low',advisory:'Pre-sown irrigation critical' },
    { region: 'Himachal Pradesh',soilTemp:10,moisture:'high',   advisory: 'Root crops are thriving' },
];

function getMoistureColor(m) {
    const map = { 'very_low': '#ef4444', 'low': '#f97316', 'medium': '#f59e0b', 'high': '#22c55e' };
    return map[m] || '#6b7280';
}

function WeatherCard({ city, onClick, selected, t }) {
    return (
        <div className={`wc-card ${selected ? 'wc-card-selected' : ''}`} onClick={() => onClick(city)}>
            <div className="wc-card-top">
                <div>
                    <div className="wc-city">{city.name}</div>
                    <div className="wc-state">{city.state}</div>
                </div>
                <div className="wc-icon">{city.icon}</div>
            </div>
            <div className="wc-temp">{city.temp}°C</div>
            <div className="wc-condition">{t(`weather.conditions.${city.condition}`)}</div>
            <div className="wc-chips">
                <span>💧 {city.humidity}%</span>
                <span>🌬️ {city.wind} km/h</span>
                <span>🌧️ {city.rain}%</span>
            </div>
        </div>
    );
}

function DetailPanel({ city, t }) {
    const today = new Date();
    return (
        <div className="wd-panel">
            <div className="wd-panel-header">
                <div>
                    <div className="wd-panel-city">{city.icon} {city.name}</div>
                    <div className="wd-panel-state">{city.state}</div>
                </div>
                <div className="wd-panel-temp">{city.temp}°<span>C</span></div>
            </div>

            <div className="wd-panel-condition">{t(`weather.conditions.${city.condition}`)}</div>
            <div className="wd-feels">{t('weather.feels_like')} {city.feels}°C</div>

            <div className="wd-metrics-grid">
                <div className="wd-metric"><span className="wd-metric-icon">💧</span><span className="wd-metric-val">{city.humidity}%</span><span className="wd-metric-label">{t('weather.humidity')}</span></div>
                <div className="wd-metric"><span className="wd-metric-icon">🌬️</span><span className="wd-metric-val">{city.wind}</span><span className="wd-metric-label">{t('weather.wind')}</span></div>
                <div className="wd-metric"><span className="wd-metric-icon">🌧️</span><span className="wd-metric-val">{city.rain}%</span><span className="wd-metric-label">{t('weather.rain_chance')}</span></div>
                <div className="wd-metric"><span className="wd-metric-icon">☀️</span><span className="wd-metric-val">{city.uv}</span><span className="wd-metric-label">{t('weather.uv_index')}</span></div>
            </div>

            {/* 7-day forecast */}
            <div className="wd-forecast-label">{t('weather.forecast_label')}</div>
            <div className="wd-forecast-bar">
                {city.forecast.map((temp, i) => {
                    const d = new Date(today);
                    d.setDate(d.getDate() + i);
                    const day = DAYS[d.getDay()];
                    const maxT = Math.max(...city.forecast);
                    const minT = Math.min(...city.forecast);
                    const pct  = ((temp - minT) / (maxT - minT + 1)) * 100;
                    return (
                        <div key={i} className="wd-day-col">
                            <div className="wd-day-name">{i === 0 ? t('weather.today') : day}</div>
                            <div className="wd-day-bar-wrap">
                                <div className="wd-day-bar" style={{ height: `${Math.max(pct, 15)}%` }} />
                            </div>
                            <div className="wd-day-temp">{temp}°</div>
                        </div>
                    );
                })}
            </div>

            {/* Farm advisory for this city */}
            <div className="wd-advisory">
                <div className="wd-advisory-title">🌾 {t('weather.farm_advisory')} {city.name}</div>
                {city.rain > 60
                    ? <p>{t('weather.advisory_rain')}</p>
                    : city.temp > 33
                    ? <p>{t('weather.advisory_heat')}</p>
                    : city.temp < 15
                    ? <p>{t('weather.advisory_cold')}</p>
                    : <p>{t('weather.advisory_good')}</p>
                }
            </div>
        </div>
    );
}

function Weather() {
    const { t, i18n } = useTranslation();
    const [selected, setSelected] = useState(CITIES[0]);
    const [search, setSearch] = useState('');
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        const now = new Date();
        setLastUpdated(now.toLocaleString(i18n.language === 'en' ? 'en-IN' : i18n.language === 'hi' ? 'hi-IN' : 'gu-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }));
    }, [i18n.language]);

    const filtered = CITIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.state.toLowerCase().includes(search.toLowerCase())
    );

    const alerts = t('weather.alerts', { returnObjects: true }) || [];

    return (
        <div className="container" style={{ paddingTop: '28px', paddingBottom: '60px' }}>

            {/* Header */}
            <div className="w-header">
                <div>
                    <h1 className="w-title">🌦️ {t('weather.title')}</h1>
                    <p className="w-subtitle">{t('weather.subtitle')}</p>
                </div>
                <div className="cp-last-updated">🕐 {t('weather.updated')}: {lastUpdated}</div>
            </div>

            {/* Farm Alerts */}
            <div className="w-alerts">
                {Array.isArray(alerts) && alerts.map((a, i) => (
                    <div key={i} className={`w-alert w-alert-${a.level}`}>
                        {a.level === 'warning' ? '⚠️' : a.level === 'danger' ? '🔥' : a.level === 'success' ? '🌱' : '💧'} {a.msg}
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="w-search-wrap">
                <input
                    type="text"
                    className="cp-search"
                    placeholder={`🔍 ${t('weather.search_placeholder')}`}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ maxWidth: 360 }}
                />
            </div>

            {/* Main layout: grid + detail */}
            <div className="w-layout">
                <div className="w-grid">
                    {filtered.length === 0
                        ? <div className="cp-empty">{t('weather.no_cities')}</div>
                        : filtered.map(c => (
                            <WeatherCard key={c.name} city={c} selected={selected?.name === c.name} onClick={setSelected} t={t} />
                        ))
                    }
                </div>
                {selected && (
                    <div className="w-detail-col">
                        <DetailPanel city={selected} t={t} />
                    </div>
                )}
            </div>

            {/* Soil Temperature Table */}
            <div className="w-soil-section">
                <h2 className="w-section-title">🌱 {t('weather.soil_section')}</h2>
                <div className="w-soil-grid">
                    {SOIL_TEMP_DATA.map(s => (
                        <div key={s.region} className="w-soil-card">
                            <div className="w-soil-region">{s.region}</div>
                            <div className="w-soil-row">
                                <span className="w-soil-label">{t('weather.soil_temp')}</span>
                                <span className="w-soil-val">{s.soilTemp}°C</span>
                            </div>
                            <div className="w-soil-row">
                                <span className="w-soil-label">{t('weather.moisture')}</span>
                                <span className="w-soil-moisture" style={{ color: getMoistureColor(s.moisture) }}>
                                    ● {t(`weather.moisture_levels.${s.moisture}`)}
                                </span>
                            </div>
                            <div className="w-soil-advisory">{s.advisory}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="cp-disclaimer">
                ⚠️ {t('weather.disclaimer')}{' '}
                <a href="https://mausam.imd.gov.in" target="_blank" rel="noopener noreferrer">IMD (India Meteorological Dept)</a>.
            </div>
        </div>
    );
}

export default Weather;
