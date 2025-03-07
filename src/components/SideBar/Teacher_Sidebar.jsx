import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Teacher_Sidebar.css';
import logo from '../../assets/media/SCC.png';
import { getAuth, signOut } from 'firebase/auth';

const Teacher_Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const menuItems = [
        {
            path: '/teacher/dashboard',
            icon: 'dashboard',
            label: 'DASHBOARD',
            notifications: 0
        },
        {
            path: '/teacher/workload',
            icon: 'assignment',
            label: 'WORKLOADS',
            notifications: 0
        },
        {
            path: '/teacher/messages',
            icon: 'message',
            label: 'MESSAGES',
            notifications: 0
        }
    ];

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleLogoutConfirm = () => {
        // Clear authentication
        sessionStorage.removeItem('isAuthenticated');
        sessionStorage.removeItem('userRole');
        
        // Redirect to login
        navigate('/prelogin');
    };

    const handleLogoutCancel = () => {
        setShowLogoutModal(false);
    };

    return (
        <>
            <div className="sidebar">
                <div className="sidebar-header">
                    <img src={logo} alt="School Logo" className="sidebar-logo" />
                    <h1>Catherinian Taskboard</h1>
                </div>

                <nav className="sidebar-menu">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span>{item.label}</span>
                            {item.notifications > 0 && (
                                <span className="notification-badge">
                                    {item.notifications}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-button" onClick={handleLogoutClick}>
                        <span className="material-symbols-outlined">logout</span>
                        <span>LOG OUT</span>
                    </button>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="modal-overlay">
                    <div className="logout-modal">
                        <div className="modal-header">
                            <h2>Confirm Logout</h2>
                        </div>
                        <div className="modal-content">
                            <p>Are you sure you want to log out?</p>
                        </div>
                        <div className="modal-actions">
                            <button 
                                className="cancel-button"
                                onClick={handleLogoutCancel}
                            >
                                Cancel
                            </button>
                            <button 
                                className="confirm-button"
                                onClick={handleLogoutConfirm}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Teacher_Sidebar;
