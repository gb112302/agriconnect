import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './RoleSelector.css';

function RoleSelector({ onRoleSelect, availableRoles = ['buyer', 'farmer'] }) {
    const { t } = useTranslation();
    const [selectedRole, setSelectedRole] = useState(null);

    const roles = [
        {
            id: 'buyer',
            title: t('dashboard.buyer_welcome') || 'Buyer',
            description: 'Browse and purchase fresh farm products',
            icon: '🛒',
            color: '#667eea'
        },
        {
            id: 'farmer',
            title: t('dashboard.farmer_welcome') || 'Farmer',
            description: 'Sell your products directly to consumers',
            icon: '🌾',
            color: '#27ae60'
        }
    ];

    const handleRoleClick = (role) => {
        if (availableRoles.includes(role.id)) {
            setSelectedRole(role.id);
        }
    };

    const handleContinue = () => {
        if (selectedRole && onRoleSelect) {
            onRoleSelect(selectedRole);
        }
    };

    return (
        <div className="role-selector-overlay">
            <div className="role-selector-container">
                <div className="role-selector-header">
                    <h2>Choose Your Role</h2>
                    <p>Select how you want to use AgriConnect</p>
                </div>

                <div className="roles-grid">
                    {roles
                        .filter(role => availableRoles.includes(role.id))
                        .map((role) => (
                            <div
                                key={role.id}
                                className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
                                onClick={() => handleRoleClick(role)}
                                style={{ '--role-color': role.color }}
                            >
                                <div className="role-icon">{role.icon}</div>
                                <h3>{role.title}</h3>
                                <p>{role.description}</p>
                                {selectedRole === role.id && (
                                    <div className="role-checkmark">✓</div>
                                )}
                            </div>
                        ))}
                </div>

                <button
                    className="btn-continue"
                    disabled={!selectedRole}
                    onClick={handleContinue}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}

export default RoleSelector;
