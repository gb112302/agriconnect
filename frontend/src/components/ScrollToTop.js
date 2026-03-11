import React, { useState, useEffect } from 'react';
import './ScrollToTop.css';

function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 300);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <button
            className={`scroll-to-top ${visible ? 'show' : ''}`}
            onClick={scrollUp}
            aria-label="Scroll to top"
        >
            ↑
        </button>
    );
}

export default ScrollToTop;
