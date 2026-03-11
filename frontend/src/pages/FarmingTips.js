import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './FarmingTips.css';

const SEASONS = ['All', 'kharif', 'rabi', 'zaid', 'year_round'];

const TIPS = [
    {
        id: 1, season: 'kharif', crop: 'Rice', emoji: '🍚',
        title: 'Transplanting Rice in Monsoon',
        summary: 'Transplant 25–30 day old seedlings. Maintain 2–3 cm water depth.',
        steps: [
            'Prepare nursery beds 30 days before monsoon onset.',
            'Transplant seedlings at 20×15 cm spacing.',
            'Apply basal dose of NPK (80:40:40 kg/ha) before transplanting.',
            'Maintain 2–3 cm standing water during tillering stage.',
            'Apply nitrogen in 3 splits: Basal, Tillering, Panicle initiation.',
        ],
        tags: ['Irrigation', 'Fertilizer', 'Transplanting'],
        difficulty: 'medium', yield: '+15–20%',
    },
    {
        id: 2, season: 'rabi', crop: 'Wheat', emoji: '🌾',
        title: 'High-Yield Wheat Cultivation',
        summary: 'Sow in Oct–Nov for best results. Use certified seed varieties like HD-2967.',
        steps: [
            'Sow between October 25 – November 25 for optimum yield.',
            'Seed rate: 100 kg/ha for timely sown, 125 kg/ha for late sown.',
            'Apply 60 kg phosphorus/ha as basal dressing.',
            'First irrigation (Crown Root Initiation) is the most critical — irrigate at 21 days.',
            'Apply zinc sulphate (25 kg/ha) every 3rd year to avoid deficiency.',
        ],
        tags: ['Sowing', 'Irrigation', 'Zinc', 'Seed Selection'],
        difficulty: 'easy', yield: '+25%',
    },
    {
        id: 3, season: 'kharif', crop: 'Cotton', emoji: '🌿',
        title: 'Bt Cotton Pest Management',
        summary: 'Scout weekly for bollworms. Use pheromone traps as early warning.',
        steps: [
            'Install pheromone traps @ 5/ha for American bollworm monitoring.',
            'Scout crop weekly — if larval count > 8/100 plants, spray recommended insecticide.',
            'Avoid prophylactic sprays — they disrupt natural enemy populations.',
            'Use neem-based biopesticides (5%) as a first line of defense.',
            'Rotate insecticide classes to prevent resistance buildup.',
        ],
        tags: ['Pest Control', 'IPM', 'Organic'],
        difficulty: 'hard', yield: 'Protects yield',
    },
    {
        id: 4, season: 'year_round', crop: 'Soil Health', emoji: '🌱',
        title: 'Soil Health Card — Act on Results',
        summary: 'Test soil every 2 years. Match fertilizer doses to actual deficiencies.',
        steps: [
            'Collect soil sample from 0–15 cm depth, at least 10 sub-samples per field.',
            'Submit to the nearest Krishi Vigyan Kendra (KVK) for testing.',
            'Apply only deficient nutrients; stop blanket fertilizer application.',
            'Add organic matter (FYM 5 t/ha) to improve structure and microbial activity.',
            'Target optimal pH 6.5–7.5 for most crops; apply lime if too acidic.',
        ],
        tags: ['Soil', 'Organic', 'Fertilizer'],
        difficulty: 'easy', yield: 'Sustainable',
    },
    {
        id: 5, season: 'zaid', crop: 'Vegetables', emoji: '🥦',
        title: 'Summer Vegetable Water Management',
        summary: 'Drip irrigation saves 40–50% water. Mulching is essential in hot months.',
        steps: [
            'Install drip or sprinkler systems — reduce water use by up to 50%.',
            'Apply plastic or straw mulch (5 cm thick) to conserve soil moisture.',
            'Irrigate in early morning or evening to reduce evaporation losses.',
            'Use anti-transpirants (like Kaolin) spray to reduce heat stress.',
            'Provide shade nets (30–50% shade) for tender crops in peak summer.',
        ],
        tags: ['Irrigation', 'Water Saving', 'Mulching'],
        difficulty: 'medium', yield: '+30% water efficiency',
    },
    {
        id: 6, season: 'rabi', crop: 'Mustard', emoji: '🌼',
        title: 'Mustard Aphid Control',
        summary: 'Aphids can devastate mustard. Early monitoring is key.',
        steps: [
            'Sow at recommended time (Oct 1–15) to avoid peak aphid season.',
            'Choose aphid-tolerant varieties like Pusa Tarak or Pusa Mustard 30.',
            'Spray Oxydemeton-methyl 0.025% or Dimethoate 30 EC @ 1 L/ha.',
            'Install yellow sticky traps @ 15/ha for early detection.',
            'Leave border rows of mustard unharvested as a trap crop.',
        ],
        tags: ['Pest Control', 'IPM', 'Rabi'],
        difficulty: 'medium', yield: 'Saves 20–40% losses',
    },
    {
        id: 7, season: 'year_round', crop: 'Post-Harvest', emoji: '📦',
        title: 'Reduce Post-Harvest Losses',
        summary: 'India loses 30% of produce post-harvest. Basic steps can cut losses in half.',
        steps: [
            'Harvest at correct maturity stage — too early or late increases losses.',
            'Use clean, ventilated crates instead of open sacks for transport.',
            'Pre-cool produce within 2 hours of harvest if selling in distant markets.',
            'Store at recommended temperature: Tomato 13–18°C, Potato 3–4°C, Onion 2–4°C.',
            'Avoid stacking more than 10 layers for soft fruits like mango and banana.',
        ],
        tags: ['Storage', 'Logistics', 'Quality'],
        difficulty: 'easy', yield: 'Save 25–30% losses',
    },
    {
        id: 8, season: 'kharif', crop: 'Soybean', emoji: '🟩',
        title: 'Soybean Nodulation & Rhizobium',
        summary: 'Seed treatment with Rhizobium fixes atmospheric nitrogen, cutting fertilizer costs by 40%.',
        steps: [
            'Always treat soybean seed with Rhizobium + PSB culture before sowing.',
            'Use slurry method: mix 200 g culture + 300 ml water per 10 kg seed.',
            'Dry treated seeds in shade; sow within 24 hours.',
            'Do NOT apply nitrogen fertilizer if nodulation is good (check roots at 30 days).',
            'Ensure soil pH 6.5–7.0 for optimal Rhizobium activity.',
        ],
        tags: ['Organic', 'Biofertilizer', 'Nitrogen'],
        difficulty: 'easy', yield: 'Cut fertilizer cost 40%',
    },
];

const DIFF_COLOR = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };

function TipCard({ tip, onClick, t }) {
    return (
        <div className="tip-card" onClick={() => onClick(tip)}>
            <div className="tip-card-header">
                <span className="tip-emoji">{tip.emoji}</span>
                <span className="tip-season-badge">{t(`farming_tips.seasons.${tip.season}`).split(' ')[0]}</span>
            </div>
            <div className="tip-crop">{tip.crop}</div>
            <h3 className="tip-title">{tip.title}</h3>
            <p className="tip-summary">{tip.summary}</p>
            <div className="tip-footer">
                <span className="tip-diff" style={{ color: DIFF_COLOR[tip.difficulty] }}>
                    ● {t(`farming_tips.difficulty.${tip.difficulty}`)}
                </span>
                <span className="tip-yield">📈 {tip.yield}</span>
            </div>
            <div className="tip-tags">
                {tip.tags.map(tag => <span key={tag} className="tip-tag">{tag}</span>)}
            </div>
        </div>
    );
}

function TipModal({ tip, onClose, t }) {
    if (!tip) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box tip-modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{tip.emoji} {tip.title}</h3>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="tip-modal-body">
                    <div className="tip-modal-meta">
                        <span className="tip-season-badge">{t(`farming_tips.seasons.${tip.season}`)}</span>
                        <span className="tip-diff" style={{ color: DIFF_COLOR[tip.difficulty] }}>
                            ● {t(`farming_tips.difficulty.${tip.difficulty}`)}
                        </span>
                        <span className="tip-yield">📈 {tip.yield}</span>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>Crop: {tip.crop}</span>
                    </div>
                    <p className="tip-modal-summary">{tip.summary}</p>
                    <div className="tip-steps-title">📋 {t('farming_tips.step_guide')}</div>
                    <ol className="tip-steps">
                        {tip.steps.map((s, i) => (
                            <li key={i} className="tip-step-item">{s}</li>
                        ))}
                    </ol>
                    <div className="tip-tags" style={{ marginTop: 16 }}>
                        {tip.tags.map(tag => <span key={tag} className="tip-tag">{tag}</span>)}
                    </div>
                </div>
            </div>
        </div>
    );
}

function FarmingTips() {
    const { t } = useTranslation();
    const [season, setSeason] = useState('All');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);

    const filtered = TIPS.filter(tip => {
        const matchSeason  = season === 'All' || tip.season === season;
        const q = search.toLowerCase();
        const matchSearch  = !q || tip.title.toLowerCase().includes(q) ||
            tip.crop.toLowerCase().includes(q) ||
            tip.tags.some(tag => tag.toLowerCase().includes(q));
        return matchSeason && matchSearch;
    });

    return (
        <div className="container" style={{ paddingTop: '28px', paddingBottom: '60px' }}>

            {/* Header */}
            <div className="w-header">
                <div>
                    <h1 className="w-title">🌱 {t('farming_tips.title')}</h1>
                    <p className="w-subtitle">{t('farming_tips.subtitle')}</p>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="cp-last-updated">📚 {TIPS.length} {t('farming_tips.expert_tips')}</span>
                </div>
            </div>

            {/* Search + Filter */}
            <div className="cp-filter-bar" style={{ marginBottom: 16 }}>
                <input
                    type="text"
                    className="cp-search"
                    placeholder={`🔍 ${t('farming_tips.search_placeholder')}`}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Season pills */}
            <div className="cp-category-pills" style={{ marginBottom: 24 }}>
                {SEASONS.map(s => (
                    <button
                        key={s}
                        onClick={() => setSeason(s)}
                        className={`cp-pill ${season === s ? 'cp-pill-active' : ''}`}
                    >
                        {s === 'kharif' ? `🌧️ ${t('farming_tips.kharif')}`
                            : s === 'rabi'   ? `❄️ ${t('farming_tips.rabi')}`
                            : s === 'zaid'   ? `☀️ ${t('farming_tips.zaid')}`
                            : s === 'year_round'      ? `🔄 ${t('farming_tips.year_round')}`
                            : `🌿 ${t('farming_tips.all')}`}
                    </button>
                ))}
            </div>

            <div className="cp-result-count">
                {t('farming_tips.showing')} <strong>{filtered.length}</strong> {t('farming_tips.tips')}
                {season !== 'All' ? ` ${t('farming_tips.for')} ${t(`farming_tips.seasons.${season}`)}` : ''}
                {search ? ` ${t('farming_tips.matching')} "${search}"` : ''}
            </div>

            {filtered.length === 0 ? (
                <div className="cp-empty">
                    <div style={{ fontSize: 48 }}>🌱</div>
                    <p>{t('farming_tips.no_tips')}</p>
                </div>
            ) : (
                <div className="tips-grid">
                    {filtered.map(tip => (
                        <TipCard key={tip.id} tip={tip} onClick={setSelected} t={t} />
                    ))}
                </div>
            )}

            {/* Info Banner */}
            <div className="tips-info-banner">
                <span style={{ fontSize: 24 }}>📞</span>
                <div>
                    <strong>{t('farming_tips.helpline_title')}</strong>
                    <p>{t('farming_tips.helpline_desc')}</p>
                </div>
            </div>

            {selected && <TipModal tip={selected} onClose={() => setSelected(null)} t={t} />}
        </div>
    );
}

export default FarmingTips;
