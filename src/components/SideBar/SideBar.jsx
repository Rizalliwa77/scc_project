import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';
import logo from '../../assets/media/SCC.png';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      navigate('/');
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="SCC Logo" className="sidebar-logo" />
        <h1>ST. CATHERINE'S<br />COLLEGE</h1>
      </div>

      <div className="sidebar-menu">
        <Link 
          to="/dashboard" 
          className={`menu-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          DASHBOARD
        </Link>
        <Link 
          to="/workloads" 
          className={`menu-item ${location.pathname === '/workloads' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">assignment</span>
          WORKLOADS
        </Link>
        <Link 
          to="/messages" 
          className={`menu-item ${location.pathname === '/messages' ? 'active' : ''}`}
        >
          <span className="material-symbols-outlined">chat</span>
          MESSAGES
        </Link>
      </div>

      <div className="sidebar-footer">
        <button className="logout-button" onClick={handleLogout}>
          <span className="material-symbols-outlined">logout</span>
          LOG OUT
        </button>

        <div className="user-profile">
          <div className="avatar">
            <span className="material-symbols-outlined">account_circle</span>
          </div>
          <div className="user-info">
            <span className="user-type">STUDENT</span>
            <span className="user-grade">Grade 10</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
