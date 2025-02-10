import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPages/LandingPage.jsx';
import SignIn from './components/LoginPages/SignIn/SignIn.jsx';
import Login from './components/LoginPages/Login.jsx';
import PreLogin from './components/LoginPages/PreLogin.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import Workloads from './components/Dashboard/Workloads.jsx';
import Messages from './components/Dashboard/Messages.jsx';
import { createRoot } from 'react-dom/client';

// Protected Route wrapper component
const ProtectedRoute = ({ children }) => {
  // Add your authentication logic here
  const isAuthenticated = true; // Replace with your actual auth check
  
  if (!isAuthenticated) {
    return <Navigate to="/prelogin" />;
  }

  return children;
};

function Main() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/login" element={<Login />} />
        <Route path="/prelogin" element={<PreLogin />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/workloads" element={
          <ProtectedRoute>
            <Workloads />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />

        {/* Catch all route - redirect to dashboard if authenticated, otherwise to landing */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);

export default Main;
