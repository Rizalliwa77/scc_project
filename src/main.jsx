import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';

// Landing and Login Pages
import LandingPage from './components/LandingPages/LandingPage.jsx';
import SignIn from './components/LoginPages/SignIn/SignIn.jsx';
import Login from './components/LoginPages/Login.jsx';
import PreLogin from './components/LoginPages/PreLogin.jsx';
import AboutUs from './components/LandingPages/AboutUs.jsx';

// Student Dashboard Components
import Dashboard from './components/Dashboard/Dashboard.jsx';
import Workloads from './components/Dashboard/Workloads.jsx';

// Teacher Dashboard Components
import TeacherDashboard from './components/Teacher Dashboard/tDashboard.jsx';
import TeacherWorkload from './components/Teacher Dashboard/tWorkload.jsx';

// Protected Route wrapper component
const ProtectedRoute = ({ children, allowedRole }) => {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
  const userRole = sessionStorage.getItem('userRole');
  
  if (!isAuthenticated) {
    return <Navigate to="/prelogin" />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to={userRole === 'teacher' ? '/teacher/dashboard' : '/dashboard'} />;
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
        <Route path="/about" element={<AboutUs />} />

        {/* Student Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRole="student">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/workloads" element={
          <ProtectedRoute allowedRole="student">
            <Workloads />
          </ProtectedRoute>
        } />

        {/* Teacher Protected routes */}
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute allowedRole="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="/teacher/workload" element={
          <ProtectedRoute allowedRole="teacher">
            <TeacherWorkload />
          </ProtectedRoute>
        } />
        
        {/* Catch all route - redirect based on role */}
        <Route path="*" element={
          <ProtectedRoute>
            {sessionStorage.getItem('userRole') === 'teacher' ? 
              <Navigate to="/teacher/dashboard" replace /> : 
              <Navigate to="/dashboard" replace />
            }
          </ProtectedRoute>
        } />
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