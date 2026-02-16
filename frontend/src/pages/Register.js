import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RoleSelector from '../components/RoleSelector';
import { useTranslation } from 'react-i18next';

function Register() {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        location: {
            state: '',
            district: '',
        },
    });
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showRoleSelector, setShowRoleSelector] = useState(false);
    const [registeredUser, setRegisteredUser] = useState(null);

    const { register, selectRole } = useAuth();
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePassword = (password) => {
        if (password.length < 6) {
            return 'Password must be at least 6 characters';
        }
        if (!/[A-Z]/.test(password)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/[a-z]/.test(password)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/[0-9]/.test(password)) {
            return 'Password must contain at least one number';
        }
        return null;
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^[6-9]\d{9}$/; // Indian phone number format
        return phoneRegex.test(phone);
    };

    const validateField = (name, value) => {
        let error = '';

        switch (name) {
            case 'name':
                if (value.trim().length < 2) {
                    error = 'Name must be at least 2 characters';
                }
                break;
            case 'email':
                if (!validateEmail(value)) {
                    error = 'Please enter a valid email address';
                }
                break;
            case 'password':
                error = validatePassword(value) || '';
                break;
            case 'phone':
                if (!validatePhone(value)) {
                    error = 'Please enter a valid 10-digit phone number';
                }
                break;
            case 'state':
            case 'district':
                if (value.trim().length < 2) {
                    error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required`;
                }
                break;
            default:
                break;
        }

        return error;
    };



    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'state' || name === 'district') {
            setFormData({
                ...formData,
                location: {
                    ...formData.location,
                    [name]: value,
                },
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }

        // Clear field error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors({
                ...fieldErrors,
                [name]: '',
            });
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        const error = validateField(name, value);

        if (error) {
            setFieldErrors({
                ...fieldErrors,
                [name]: error,
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate all fields
        const errors = {};
        errors.name = validateField('name', formData.name);
        errors.email = validateField('email', formData.email);
        errors.password = validateField('password', formData.password);
        errors.phone = validateField('phone', formData.phone);
        errors.state = validateField('state', formData.location.state);
        errors.district = validateField('district', formData.location.district);

        // Filter out empty errors
        const validErrors = Object.keys(errors).reduce((acc, key) => {
            if (errors[key]) acc[key] = errors[key];
            return acc;
        }, {});

        if (Object.keys(validErrors).length > 0) {
            setFieldErrors(validErrors);
            setError('Please fix the errors in the form');
            return;
        }

        setLoading(true);

        const result = await register(formData);

        if (result.success) {
            // Show role selector instead of navigating directly
            setRegisteredUser(result.user);
            setShowRoleSelector(true);
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

    if (showRoleSelector && registeredUser) {
        return (
            <RoleSelector
                onRoleSelect={handleRoleSelect}
                availableRoles={registeredUser.availableRoles || ['buyer', 'farmer']}
            />
        );
    }

    return (
        <div className="auth-container">
            <h2>{t('app_name')} - {t('nav.register')}</h2>
            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>{t('admin.name')}</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                    />
                    {fieldErrors.name && <div className="error">{fieldErrors.name}</div>}
                </div>

                <div className="form-group">
                    <label>{t('auth.email')}</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                    />
                    {fieldErrors.email && <div className="error">{fieldErrors.email}</div>}
                </div>

                <div className="form-group">
                    <label>{t('auth.password')}</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        minLength="6"
                    />
                    {fieldErrors.password && <div className="error">{fieldErrors.password}</div>}
                </div>

                <div className="form-group">
                    <label>Phone</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        placeholder="10-digit mobile number"
                    />
                    {fieldErrors.phone && <div className="error">{fieldErrors.phone}</div>}
                </div>

                <div className="form-group">
                    <label>State</label>
                    <input
                        type="text"
                        name="state"
                        value={formData.location.state}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                    />
                    {fieldErrors.state && <div className="error">{fieldErrors.state}</div>}
                </div>

                <div className="form-group">
                    <label>District</label>
                    <input
                        type="text"
                        name="district"
                        value={formData.location.district}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                    />
                    {fieldErrors.district && <div className="error">{fieldErrors.district}</div>}
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Registering...' : 'Register'}
                </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px' }}>
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
}

export default Register;
