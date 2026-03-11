import React, { useState, useRef, useEffect } from 'react';
import './Notifications.css';

const SAMPLE_NOTIFICATIONS = [
    { id: 1, icon: '🛒', text: 'Your order #A1B2C was confirmed', time: '2m ago', read: false },
    { id: 2, icon: '🚚', text: 'Order #D3E4F is out for delivery', time: '1h ago', read: false },
    { id: 3, icon: '⭐', text: 'You received a 5-star review!', time: '3h ago', read: true },
    { id: 4, icon: '💬', text: 'New message from Ramesh Kumar', time: '5h ago', read: true },
    { id: 5, icon: '🌾', text: 'Price drop on Basmati Rice', time: '1d ago', read: true },
];

function Notifications() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
    const ref = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const markRead = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    };

    return (
        <div className="notif-wrapper" ref={ref}>
            <button
                className="notif-btn"
                onClick={() => setOpen(prev => !prev)}
                aria-label="Notifications"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount}</span>
                )}
            </button>

            {open && (
                <div className="notif-dropdown">
                    <div className="notif-header">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="notif-mark-all">
                                Mark all read
                            </button>
                        )}
                    </div>
                    <ul className="notif-list">
                        {notifications.map(n => (
                            <li
                                key={n.id}
                                className={`notif-item${n.read ? '' : ' unread'}`}
                                onClick={() => markRead(n.id)}
                            >
                                <span className="notif-icon">{n.icon}</span>
                                <div className="notif-content">
                                    <p>{n.text}</p>
                                    <span className="notif-time">{n.time}</span>
                                </div>
                                {!n.read && <span className="notif-dot" />}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Notifications;
