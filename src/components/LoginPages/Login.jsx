import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import NavBar from '../NavigationBar/NavBar';
import "./Login.css";
import logo from '../../assets/media/SCC.png';
import ForgotPasswordModal from './ForgotPasswordModal';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      // Fetch from sign-in collection with correct document ID
      const signInRef = doc(db, 'sign-in', 'PEQz5kwuehQldRsByTrA');
      const docSnap = await getDoc(signInRef);
      
      if (!docSnap.exists()) {
        setError("Database not found");
        setLoading(false);
        return;
      }

      const allData = docSnap.data();
      console.log("Fetched data:", allData); // Debug log
      let userData = null;

      // Find user by email (case insensitive)
      Object.entries(allData).forEach(([key, value]) => {
        if (value.email?.toLowerCase() === email.toLowerCase()) {
          userData = {
            ...value,
            id: key
          };
        }
      });

      console.log("Found user data:", userData); // Debug log

      // Validate user exists and role matches
      if (!userData) {
        setError("Account not found in database");
        setLoading(false);
        return;
      }

      if (userData.role !== role) {
        setError(`This account is not registered as a ${role}`);
        setLoading(false);
        return;
      }

      // If validation passes, attempt to sign in
      const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
      const user = userCredential.user;

      // Update messaging functionality collections
      const messagingRef = doc(db, 'messagingFunctionality', 'availableMessage');
      
      // Update main document with user data
      await setDoc(messagingRef, {
        [user.uid]: {
          fullName: userData.fullName,
          role: userData.role,
          email: userData.email,
          lastActive: new Date().toISOString()
        }
      }, { merge: true });

      // Set session data
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('userRole', role);
      sessionStorage.setItem('userData', JSON.stringify(userData));

      // Navigate based on role
      navigate(role === 'teacher' ? '/teacher/dashboard' : '/dashboard');

    } catch (error) {
      console.error("Login error:", error);
      if (error.code === 'auth/wrong-password') {
        setError("Incorrect password");
      } else if (error.code === 'auth/user-not-found') {
        setError("Account not found");
      } else if (error.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Please try again later");
      } else {
        setError("Login failed. Please try again");
      }
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
              <a 
                href="#" 
                className="login-forgot"
                onClick={(e) => {
                  e.preventDefault();
                  setIsModalOpen(true);
                }}
              >
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
      
      <ForgotPasswordModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Login;
