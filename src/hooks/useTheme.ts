import { useState, useEffect } from 'react';

export const useTheme = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const saved = localStorage.getItem('theme');
        return (saved as 'light' | 'dark') || 'dark';
    });

    useEffect(() => {
        const root = window.document.body;
        if (theme === 'light') {
            root.classList.add('light-theme');
        } else {
            root.classList.remove('light-theme');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return { theme, toggleTheme };
};
