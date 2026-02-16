import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import RoleSelector from '../components/RoleSelector';
import './Login.css';

function Login() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showRoleSelector, setShowRoleSelector] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);

    const { login, selectRole } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(formData);

        if (result.success) {
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }

            // Check if user needs to select a role
            if (!result.user.currentRole) {
                setLoggedInUser(result.user);
                setShowRoleSelector(true);
            } else {
                navigate('/dashboard');
            }
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const handleRoleSelect = async (role) => {
        setLoading(true);
        const result = await selectRole(role);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Failed to select role');
            setShowRoleSelector(false);
        }

        setLoading(false);
    };

    if (showRoleSelector && loggedInUser) {
        return (
            <RoleSelector
                onRoleSelect={handleRoleSelect}
                availableRoles={loggedInUser.availableRoles || ['buyer', 'farmer']}
            />
        );
    }

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <h2>{t('auth.welcome_back')}</h2>
                        <p>{t('auth.login_subtitle')}</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label htmlFor="email">{t('auth.email')}</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder={t('auth.email')}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">{t('auth.password')}</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder={t('auth.password')}
                                required
                            />
                        </div>

                        <div className="form-options">
                            <label className="remember-me">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                                <span>{t('auth.remember_me')}</span>
                            </label>
                            <Link to="/forgot-password" className="forgot-link">
                                {t('auth.forgot_password')}
                            </Link>
                        </div>

                        <button
                            type="submit"
                            className="btn-login"
                            disabled={loading}
                        >
                            {loading ? t('auth.logging_in') : t('auth.login_button')}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>
                            {t('auth.no_account')}
                            <Link to="/register" className="register-link"> {t('auth.register_here')}</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;

