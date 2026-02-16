import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSelector.css';

function LanguageSelector() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
    };

    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
        { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' }
    ];

    return (
        <div className="language-selector">
            <select
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
                className="language-dropdown"
            >
                {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default LanguageSelector;
