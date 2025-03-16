import { Link } from 'react-router-dom';
import "./NavBar.css";
import SCCLogo from '../../assets/media/SCC.png';

const NavBar = () => {
    return (
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo-section">
            <img src={SCCLogo} alt="SCC Logo" className="logo" />
            <h1 className="title">ST. CATHERINE'S COLLEGE TASKBOARD</h1>
          </div>
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About Us</Link></li>
          </ul>
        </div>
      </nav>
    );
  };
  
  export default NavBar; 
  