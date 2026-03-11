import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('agri-theme') === 'dark';
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('agri-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('agri-theme', 'light');
        }
    }, [darkMode]);

    const toggleDarkMode = () => setDarkMode(prev => !prev);

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
