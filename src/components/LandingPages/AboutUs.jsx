import { useNavigate } from "react-router-dom";
import NavBar from '../NavigationBar/NavBar';
import "./LandingPage.css";

function AboutUs() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/prelogin");
  };

  return (
    <div className="landing-page-wrapper">
      <NavBar />
      <div className="landing-content" style={{ 
        gap: '1.5rem', 
        marginTop: '2rem',
        maxHeight: '85vh'
      }}>
        <div className="landing-description" style={{ 
          padding: '1.5rem', 
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '1rem', lineHeight: '1.5' }}>
            Catherinian Taskboard is a dedicated platform designed to enhance productivity, organization, and collaboration. 
            It provides a structured space for managing tasks efficiently, ensuring seamless workflow and effective communication.
          </p>
        </div>

        <div className="landing-description" style={{ 
          padding: '1.5rem', 
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.8rem' }}>What Makes Catherinian Taskboard Unique</h2>
          <p style={{ fontSize: '1rem', lineHeight: '1.5' }}>
            Catherinian Taskboard stands out for its user-friendly interface, intuitive task management features, and adaptability to different work styles. 
            It fosters teamwork, streamlines task delegation, and helps users stay on top of deadlines and priorities.
          </p>
        </div>
        
        <div className="landing-description" style={{ 
          padding: '1.5rem', 
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.8rem', textAlign: 'center' }}>Catherinian Taskboard is your space to:</h2>
          <ul style={{ 
            textAlign: 'left', 
            paddingLeft: '2rem',
            fontSize: '1rem',
            lineHeight: '1.5',
            margin: '0'
          }}>
            <li>Organize tasks effectively with clear priorities and deadlines.</li>
            <li>Collaborate seamlessly with teams and individuals.</li>
            <li>Track progress and ensure productivity in personal and professional projects.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
