import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleSelector from '../components/RoleSelector';
import { useTranslation } from 'react-i18next';
import './Login.css';
import './Register.css';

function getStrength(pw) {
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
}

const STRENGTH_COLORS = ['', '#ef4444', '#f59e0b', '#84cc16', '#22c55e', '#16a34a'];

function Register() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', phone: '',
        location: { state: '', district: '' },
    });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showRoleSelector, setShowRoleSelector] = useState(false);
    const [registeredUser, setRegisteredUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const { register, selectRole } = useAuth();
    const navigate = useNavigate();

    const STRENGTH_LABELS = [
        '',
        t('auth.pw_strength.very_weak'),
        t('auth.pw_strength.weak'),
        t('auth.pw_strength.fair'),
        t('auth.pw_strength.good'),
        t('auth.pw_strength.strong'),
        t('auth.pw_strength.very_strong')
    ];

    const validateField = (name, value) => {
        switch (name) {
            case 'name':     return value.trim().length < 2 ? t('auth.validation.name_short') : '';
            case 'email':    return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? t('auth.validation.email_invalid') : '';
            case 'password': {
                if (value.length < 6) return t('auth.validation.pw_short');
                if (!/[A-Z]/.test(value)) return t('auth.validation.pw_upper');
                if (!/[0-9]/.test(value)) return t('auth.validation.pw_number');
                return '';
            }
            case 'phone':    return !/^[6-9]\d{9}$/.test(value) ? t('auth.validation.phone_invalid') : '';
            case 'state':
            case 'district': return value.trim().length < 2 ? t(`auth.validation.${name}_req`) : '';
            default:         return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'state' || name === 'district') {
            setFormData(f => ({ ...f, location: { ...f.location, [name]: value } }));
        } else {
            setFormData(f => ({ ...f, [name]: value }));
        }
        if (fieldErrors[name]) setFieldErrors(f => ({ ...f, [name]: '' }));
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const err = validateField(name, value);
        if (err) setFieldErrors(f => ({ ...f, [name]: err }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const errors = {
            name:     validateField('name', formData.name),
            email:    validateField('email', formData.email),
            password: validateField('password', formData.password),
            phone:    validateField('phone', formData.phone),
            state:    validateField('state', formData.location.state),
            district: validateField('district', formData.location.district),
        };
        if (Object.values(errors).some(Boolean)) { setFieldErrors(errors); setError(t('auth.validation.fix_errors')); return; }
        setLoading(true);
        const result = await register(formData);
        if (result.success) { setRegisteredUser(result.user); setShowRoleSelector(true); }
        else setError(result.error);
        setLoading(false);
    };

    const handleRoleSelect = async (role) => {
        setLoading(true);
        const result = await selectRole(role);
        if (result.success) navigate('/dashboard');
        else { setError(result.error || 'Failed to select role'); setShowRoleSelector(false); }
        setLoading(false);
    };

    if (showRoleSelector && registeredUser) {
        return <RoleSelector onRoleSelect={handleRoleSelect} availableRoles={registeredUser.availableRoles || ['buyer', 'farmer']} />;
    }

    const strength = getStrength(formData.password);

    return (
        <div className="login-wrapper" style={{ alignItems: 'flex-start', paddingTop: '32px' }}>
            <div className="login-container" style={{ maxWidth: '520px' }}>
                <div className="login-card">
                    <div className="login-logo">🌱</div>
                    <div className="login-header">
                        <h2>{t('auth.register_title')}</h2>
                        <p>{t('auth.register_subtitle')}</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="reg-grid">
                            <div className="form-group">
                                <label>{t('auth.full_name')}</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} placeholder={t('auth.name_placeholder')} required />
                                {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
                            </div>
                            <div className="form-group">
                                <label>{t('auth.phone')}</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} placeholder={t('auth.phone_placeholder')} required />
                                {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label>{t('auth.email')}</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} placeholder={t('auth.email_placeholder')} required />
                            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                        </div>

                        <div className="form-group">
                            <label>{t('auth.password')}</label>
                            <div className="password-wrapper">
                                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                                    onChange={handleChange} onBlur={handleBlur}
                                    placeholder={t('auth.password_placeholder')} required minLength={6} />
                                <button type="button" className="password-toggle"
                                    onClick={() => setShowPassword(p => !p)}>
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="pw-strength">
                                    <div className="pw-bar">
                                        {[1,2,3,4,5].map(i => (
                                            <div key={i} className="pw-segment"
                                                style={{ background: i <= strength ? STRENGTH_COLORS[strength] : '#e5e7eb' }} />
                                        ))}
                                    </div>
                                    <span style={{ color: STRENGTH_COLORS[strength], fontSize: '12px', fontWeight: 600 }}>
                                        {STRENGTH_LABELS[strength]}
                                    </span>
                                </div>
                            )}
                            {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
                        </div>

                        <div className="reg-grid">
                            <div className="form-group">
                                <label>{t('auth.state')}</label>
                                <input type="text" name="state" value={formData.location.state}
                                    onChange={handleChange} onBlur={handleBlur} placeholder={t('auth.state_placeholder')} required />
                                {fieldErrors.state && <span className="field-error">{fieldErrors.state}</span>}
                            </div>
                            <div className="form-group">
                                <label>{t('auth.district')}</label>
                                <input type="text" name="district" value={formData.location.district}
                                    onChange={handleChange} onBlur={handleBlur} placeholder={t('auth.district_placeholder')} required />
                                {fieldErrors.district && <span className="field-error">{fieldErrors.district}</span>}
                            </div>
                        </div>

                        <button type="submit" className="btn-login" style={{ marginTop: '8px' }} disabled={loading}>
                            {loading ? t('auth.creating_account') : t('auth.register_button')}
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>{t('auth.already_have_account')} <Link to="/login" className="register-link">{t('auth.login_here')}</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
