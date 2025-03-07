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
            <li><a href="#">Home</a></li>
            <li><a href="#">About</a></li>
            <li><a href="#">Admissions</a></li>
            <li><a href="#">Contact</a></li>
          </ul>
        </div>
      </nav>
    );
  };
  
  export default NavBar; 
  