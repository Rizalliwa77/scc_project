import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from '../../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
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

  const verifyUserRole = async (uid) => {
    try {
      // Check both Firestore documents for verification with error handling
      const mainDocRef = doc(db, 'sign-in', 'PEQz5kwuehQldRsByTrA');
      const userInfoDocRef = doc(db, 'sign-in', '1qo1S53fQK4y4HT8GFrS');

      let mainDocSnap, userInfoDocSnap;

      try {
        [mainDocSnap, userInfoDocSnap] = await Promise.all([
          getDoc(mainDocRef),
          getDoc(userInfoDocRef)
        ]);
      } catch (fetchError) {
        console.error("Error fetching documents:", fetchError);
        throw new Error('Unable to verify user credentials. Please try again.');
      }

      if (!mainDocSnap.exists() || !userInfoDocSnap.exists()) {
        throw new Error('System configuration error. Please contact administrator.');
      }

      const mainData = mainDocSnap.data()[uid];
      const userInfoData = userInfoDocSnap.data()[uid];

      // Verify user exists in both documents
      if (!mainData || !userInfoData) {
        throw new Error('User account not found. Please contact administrator.');
      }

      // Verify roles match in both documents
      if (mainData.role !== userInfoData.role || mainData.role !== role) {
        throw new Error(`Access denied. Please use the ${mainData.role} login form.`);
      }

      // Verify account status
      if (mainData.status === 'pending') {
        throw new Error('Your account is pending approval. Please wait for administrator confirmation.');
      }

      return true;
    } catch (error) {
      console.error("Verification error:", error);
      throw error;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateInputs()) return;

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Verify user role and status
      await verifyUserRole(userCredential.user.uid);

      // If verification passes, navigate to dashboard
      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      
      // Sign out user if verification fails
      if (error.message !== 'auth/wrong-password' && error.message !== 'auth/user-not-found') {
        await signOut(auth);
      }

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
          setError(error.message || "Failed to login. Please try again");
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
              <h3>{role?.toUpperCase() || 'student'}</h3>
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
