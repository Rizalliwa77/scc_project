import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
  const role = location.state?.role || 'student';

  const validateInputs = () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return false;
    }
    
    if (!email.endsWith("@scc.edu.ph")) {
      setError("Please use your school email (@scc.edu.ph)");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate inputs
    if (!validateInputs()) return;

    try {
      setLoading(true);
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // You can add additional user role verification here if needed
      // const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      // if (userDoc.data().role !== role) throw new Error("Unauthorized access");

      // Successful login
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      switch (error.code) {
        case 'auth/user-not-found':
          setError("No account found with this email");
          break;
        case 'auth/wrong-password':
          setError("Incorrect password");
          break;
        case 'auth/too-many-requests':
          setError("Too many failed attempts. Please try again later");
          break;
        default:
          setError("Failed to login. Please try again");
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
                minLength={6}
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
