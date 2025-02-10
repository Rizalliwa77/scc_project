import { useNavigate } from 'react-router-dom';
import NavBar from '../NavigationBar/NavBar';
import './PreLogin.css';

function PreLogin() {
    const navigate = useNavigate();

    const handleRoleSelect = (role) => {
        navigate('/login', { state: { role } });
    };

    return (
        <div className="prelogin-wrapper">
            <NavBar />
            <div className="prelogin-content">
                <div className="prelogin-card">
                    <h2 className="prelogin-title">
                        What is your<br />SCC role?
                    </h2>
                    <div className="prelogin-buttons">
                        <button 
                            className="prelogin-button"
                            onClick={() => handleRoleSelect('teacher')}
                        >
                            Teacher
                        </button>
                        <button 
                            className="prelogin-button"
                            onClick={() => handleRoleSelect('student')}
                        >
                            Student
                        </button>
                    </div>
                </div>
                <div className="prelogin-signin">
                    <p>Don't have an account yet? <a href="/signin">Sign in now</a></p>
                </div>
            </div>
        </div>
    );
}

export default PreLogin;
