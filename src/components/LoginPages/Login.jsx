import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavBar from '../NavigationBar/NavBar';
import "./Login.css";
import logo from '../../assets/media/SCC.png';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || 'student';

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Shortcut for testing (email: 123, password: 123)
    if (email === "123" && password === "123") {
      navigate("/dashboard");
      return;
    }
    
    // Regular validation
    if (!email.endsWith("@scc.edu.ph")) {
      setError("Please use your school email (@scc.edu.ph)");
      return;
    }

    // Add your regular login logic here
    navigate("/dashboard");
  };

  return (
    <div className="login-wrapper">
      <NavBar />
      <div className="login-container">
        <div className="login-card">
          <div className="login-form">
            <div className="login-title">
              <h2>LOGGING IN AS</h2>
              <h3>{role.toUpperCase()}</h3>
            </div>

            <form onSubmit={handleLogin}>
              {error && <p className="login-error">{error}</p>}
              <input
                type="email"
                className="login-input"
                placeholder="School Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                className="login-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <a href="#" className="login-forgot">
                Forgot your password?
              </a>
              <button type="submit" className="login-button">
                LOG IN
              </button>
            </form>
          </div>
          <div className="login-logo">
            <img src={logo} alt="SCC Logo" />
          </div>
        </div>
        <div className="school-message">
          <div className="message-content">
            <h3>EXCELLENCE THROUGH QUALITY EDUCATION</h3>
            <p>St. Catherine's College Learning Management System</p>
            <div className="school-values">
              <span>Faith</span>
              <span>•</span>
              <span>Excellence</span>
              <span>•</span>
              <span>Service</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
