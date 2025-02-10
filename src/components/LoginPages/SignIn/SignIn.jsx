import React, { useState } from 'react';
import NavBar from '../../NavigationBar/NavBar';
import './SignIn.css';
import { useNavigate } from 'react-router-dom';

function SignIn() {
    const [showPopup, setShowPopup] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowPopup(true);
    };

    const handleLogin = () => {
        navigate('/prelogin');  // Changed from '/login' to '/prelogin'
    };

    const handleHome = () => {
        navigate('/');  // This will navigate to home
    };

    return (
        <div className="signin-wrapper">
            <NavBar />
            <div className="signin-content">
                <div className="signin-card">
                    <h2 className="signin-title">SCC Sign Up</h2>
                    <form className="signin-form" onSubmit={handleSubmit}>
                        <input type="text" placeholder="Full Name" className="signin-input" />
                        <input type="email" placeholder="Email" className="signin-input" />
                        <input type="password" placeholder="Password" className="signin-input" />
                        <input type="text" placeholder="Contact Number" className="signin-input" />
                        <select className="signin-input">
                            <option value="">Select Grade Level</option>
                            <option value="7">Grade 7</option>
                            <option value="8">Grade 8</option>
                            <option value="9">Grade 9</option>
                            <option value="10">Grade 10</option>
                        </select>
                        <input type="file" className="signin-input" accept="image/*" />
                        <button type="submit" className="signin-button">Sign Up</button>
                    </form>
                </div>
            </div>
            {showPopup && (
                <div className="popup">
                    <div className="popup-content">
                        <p>Please check your email to confirm your account setup.</p>
                        <div className="popup-buttons">
                            <button onClick={handleLogin} className="popup-button primary">
                                Proceed to Login
                            </button>
                            <button onClick={handleHome} className="popup-button secondary">
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SignIn;
