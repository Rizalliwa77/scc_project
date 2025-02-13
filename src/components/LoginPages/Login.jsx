import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import NavBar from '../NavigationBar/NavBar';
import "./Login.css";
import logo from '../../assets/media/SCC.png';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role;

  // Verify role is present
  useEffect(() => {
    if (!role) {
      navigate('/prelogin', { replace: true });
    }
  }, [role, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Basic validation
      if (!email || !password) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user data from Firestore
      const docRef = doc(db, 'sign-in', role === 'teacher' ? 'PEQz5kwuehQldRsByTrA' : '1qo1S53fQK4y4HT8GFrS');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data()[user.uid];
        
        if (userData && userData.role === role) {
          // Set session data
          sessionStorage.setItem('isAuthenticated', 'true');
          sessionStorage.setItem('userRole', role);
          sessionStorage.setItem('userData', JSON.stringify(userData));

          // Navigate based on role
          navigate(role === 'teacher' ? '/teacher/dashboard' : '/dashboard');
        } else {
          setError(`Invalid ${role} credentials`);
        }
      } else {
        setError("User data not found");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <NavBar />
      <div className="login-container">
        <div className="login-card">
          <div className="login-form">
            <div className="login-title">
              <h2>LOGGING IN AS</h2>
              <h3>{role?.toUpperCase()}</h3>
            </div>

            <form onSubmit={handleLogin}>
              {error && <p className="login-error">{error}</p>}
              <input
                type="email"
                className="login-input"
                placeholder="School Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
              <input
                type="password"
                className="login-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <a href="#" className="login-forgot">
                Forgot your password?
              </a>
              <button 
                type="submit" 
                className="login-button"
                disabled={loading}
              >
                {loading ? "LOGGING IN..." : "LOG IN"}
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
