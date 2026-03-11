import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import BASE_CROP_DATA from './cropData';
import './CropPrices.css';

// ── Categories (order matters for pills) ──
const CATEGORIES = [
    'All', 'Vegetables', 'Fruits', 'Flowers', 'Grains',
    'Pulses', 'Spices', 'Cash Crops', 'Oilseeds', 'Herbs & Dairy',
];

// Simulate a realistic market tick: ±0.5 – 3% change on ~30% of crops
function simulateTick(crops) {
    return crops.map(crop => {
        if (Math.random() > 0.30) return crop; // 70% crops unchanged each tick
        const changePercent = (Math.random() * 2.5 + 0.5) * (Math.random() < 0.5 ? 1 : -1);
        const rawNew = crop.price * (1 + changePercent / 100);
        // Keep price within ±25% of original base to avoid runaway
        const minPrice = crop.basePrice * 0.75;
        const maxPrice = crop.basePrice * 1.25;
        const newPrice = Math.round(Math.max(minPrice, Math.min(maxPrice, rawNew)));
        if (newPrice === crop.price) return crop;
        return { ...crop, prevPrice: crop.price, price: newPrice, changed: true };
    });
}

function getPctChange(price, prevPrice) {
    return (((price - prevPrice) / prevPrice) * 100).toFixed(1);
}

function Ticker({ crops, label }) {
    return (
        <div className="price-ticker-wrap">
            <div className="price-ticker-label">📡 {label}</div>
            <div className="price-ticker-track">
                <div className="price-ticker-items">
                    {[...crops, ...crops].map((c, i) => {
                        const pct = getPctChange(c.price, c.prevPrice);
                        const up = pct >= 0;
                        return (
                            <span key={i} className="ticker-item">
                                {c.emoji} <strong>{c.name}</strong>
                                &nbsp;₹{c.price.toLocaleString('en-IN')}/{c.unit}
                                &nbsp;<span className={up ? 'tick-up' : 'tick-down'}>{up ? '▲' : '▼'}{Math.abs(pct)}%</span>
                                <span className="ticker-dot">·</span>
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function StatCard({ emoji, label, value, sub }) {
    return (
        <div className="cp-stat-card">
            <div className="cp-stat-icon">{emoji}</div>
            <div>
                <div className="cp-stat-value">{value}</div>
                <div className="cp-stat-label">{label}</div>
                {sub && <div className="cp-stat-sub">{sub}</div>}
            </div>
        </div>
    );
}

function CropCard({ crop, prev }) {
    const pct = getPctChange(crop.price, crop.prevPrice);
    const up = parseFloat(pct) >= 0;
    const flashClass = crop.changed ? (up ? 'card-flash-up' : 'card-flash-down') : '';

    return (
        <div className={`crop-card ${flashClass}`}>
            <div className="crop-card-header">
                <span className="crop-emoji">{crop.emoji}</span>
                <span className={`crop-badge ${up ? 'badge-up' : 'badge-down'}`}>
                    {up ? '▲' : '▼'} {Math.abs(pct)}%
                </span>
            </div>
            <div className="crop-name">{crop.name}</div>
            <div className="crop-category-pill">{crop.category}</div>
            <div className="crop-price">
                ₹{crop.price.toLocaleString('en-IN')}
                <small>/{crop.unit}</small>
            </div>
            <div className="crop-prev-price">
                {prev}: ₹{crop.prevPrice.toLocaleString('en-IN')}/{crop.unit}
            </div>
            <div className="crop-meta">
                <span>📍 {crop.state}</span>
                <span>{crop.market}</span>
            </div>
            <div className={`crop-trend-bar ${up ? 'trend-up' : 'trend-down'}`}
                style={{ '--trend-width': `${Math.min(Math.abs(pct) * 10, 100)}%` }} />
        </div>
    );
}

// Attach basePrice to each crop (original price from data file)
const INITIAL_CROPS = BASE_CROP_DATA.map(c => ({
    ...c,
    basePrice: c.price,
    changed: false,
}));

function CropPrices() {
    const { t } = useTranslation();
    const [crops, setCrops] = useState(INITIAL_CROPS);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sort, setSort] = useState('name');
    const [lastUpdated, setLastUpdated] = useState('');
    const [tickCount, setTickCount] = useState(0);
    const flashTimerRef = useRef(null);

    // Set initial timestamp
    useEffect(() => {
        const fmt = () => new Date().toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
        });
        setLastUpdated(fmt());
    }, []);

    // Live market tick every 5 seconds
    const tick = useCallback(() => {
        setCrops(prev => {
            const updated = simulateTick(prev.map(c => ({ ...c, changed: false })));
            return updated;
        });
        setLastUpdated(new Date().toLocaleString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
        }));
        setTickCount(n => n + 1);

        // Clear flash indicators after 800ms
        if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
        flashTimerRef.current = setTimeout(() => {
            setCrops(prev => prev.map(c => ({ ...c, changed: false })));
        }, 800);
    }, []);

    useEffect(() => {
        const interval = setInterval(tick, 5000);
        return () => {
            clearInterval(interval);
            if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
        };
    }, [tick]);

    const filtered = useMemo(() => {
        let list = [...crops];
        if (category !== 'All') list = list.filter(c => c.category === category);
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.state.toLowerCase().includes(q) ||
                c.market.toLowerCase().includes(q)
            );
        }
        if (sort === 'name')       list.sort((a, b) => a.name.localeCompare(b.name));
        if (sort === 'price_asc')  list.sort((a, b) => a.price - b.price);
        if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
        if (sort === 'change')     list.sort((a, b) => parseFloat(getPctChange(b.price, b.prevPrice)) - parseFloat(getPctChange(a.price, a.prevPrice)));
        return list;
    }, [crops, search, category, sort]);

    const gainers  = crops.filter(c => c.price > c.prevPrice).length;
    const losers   = crops.filter(c => c.price < c.prevPrice).length;
    const topGainer = [...crops].sort((a, b) =>
        parseFloat(getPctChange(b.price, b.prevPrice)) - parseFloat(getPctChange(a.price, a.prevPrice))
    )[0];

    return (
        <div className="cp-page">
            {/* Ticker */}
            <Ticker crops={crops} label={t('crop_prices.live_label')} />

            <div className="container" style={{ paddingTop: '28px', paddingBottom: '60px' }}>

                {/* Header */}
                <div className="cp-header">
                    <div>
                        <h1 className="cp-title">📈 {t('crop_prices.title')}</h1>
                        <p className="cp-subtitle">{t('crop_prices.subtitle')}</p>
                    </div>
                    <div className="cp-last-updated">
                        <span className="live-dot" /> LIVE &nbsp;|&nbsp; 🕐 {t('crop_prices.updated')}: {lastUpdated}
                        <span className="tick-badge">#{tickCount} ticks</span>
                    </div>
                </div>

                {/* Stat Strip */}
                <div className="cp-stats-strip">
                    <StatCard emoji="🌾" label={t('crop_prices.total_crops')} value={crops.length} sub={t('crop_prices.tracked_live')} />
                    <StatCard emoji="📈" label={t('crop_prices.gainers')} value={gainers} sub={t('crop_prices.prices_rising')} />
                    <StatCard emoji="📉" label={t('crop_prices.losers')}  value={losers}  sub={t('crop_prices.prices_falling')} />
                    <StatCard emoji="🏆" label={t('crop_prices.top_gainer')} value={topGainer.emoji + ' ' + topGainer.name}
                        sub={`+${getPctChange(topGainer.price, topGainer.prevPrice)}% ${t('crop_prices.today')}`} />
                </div>

                {/* Filter Bar */}
                <div className="cp-filter-bar">
                    <input
                        type="text"
                        placeholder={`🔍 ${t('crop_prices.search_placeholder')}`}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="cp-search"
                    />
                    <select value={sort} onChange={e => setSort(e.target.value)} className="cp-select">
                        <option value="name">{t('crop_prices.sort_az')}</option>
                        <option value="price_desc">{t('crop_prices.sort_price_desc')}</option>
                        <option value="price_asc">{t('crop_prices.sort_price_asc')}</option>
                        <option value="change">{t('crop_prices.sort_change')}</option>
                    </select>
                </div>

                {/* Category Pills */}
                <div className="cp-category-pills">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`cp-pill ${category === cat ? 'cp-pill-active' : ''}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Results count */}
                <div className="cp-result-count">
                    {t('crop_prices.showing')} <strong>{filtered.length}</strong> {t('crop_prices.crops')}
                    {category !== 'All' ? ` ${t('crop_prices.in_category')} ${category}` : ''}
                    {search ? ` ${t('crop_prices.for')} "${search}"` : ''}
                </div>

                {/* Grid */}
                {filtered.length === 0 ? (
                    <div className="cp-empty">
                        <div style={{ fontSize: 48 }}>🌾</div>
                        <p>{t('crop_prices.no_crops')}</p>
                    </div>
                ) : (
                    <div className="crop-grid">
                        {filtered.map(crop => <CropCard key={crop.id} crop={crop} prev={t('crop_prices.prev')} />)}
                    </div>
                )}

                {/* Disclaimer */}
                <div className="cp-disclaimer">
                    ⚠️ {t('crop_prices.disclaimer')}{' '}
                    <a href="https://agmarknet.gov.in" target="_blank" rel="noopener noreferrer">Agmarknet</a>.
                </div>
            </div>
        </div>
    );
}

export default CropPrices;
