import { useNavigate } from "react-router-dom";
import NavBar from '../NavigationBar/NavBar';
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/prelogin");
  };

  return (
    <div className="landing-page-wrapper">
      <NavBar />
      <div className="landing-content">
        <div className="landing-motto">
          <h1>Faith, Community and Excellence</h1>
          <p>Education in an environment of faith and virtue.</p>
        </div>

        <div className="landing-description">
          <p>
            St. Catherine's College is a prestigious institution offering a rich
            blend of academic excellence and holistic development. Our students
            are prepared for a bright future in various fields, empowered by a
            nurturing environment that fosters growth, innovation, and leadership.
          </p>
        </div>

        <button className="landing-button" onClick={handleLoginClick}>
          Login
        </button>
      </div>
    </div>
  );
}

export default LandingPage;
