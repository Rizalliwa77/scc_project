import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import logo from '../../assets/media/SCC.png';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState({ name: 'Unknown User', role: 'No Role' });

  useEffect(() => {
    const auth = getAuth();
    const db = getFirestore();
    const documentId = '1qo1S53fQK4y4HT8GFrS'; // Firestore document ID
    const documentRef = doc(db, 'sign-in', documentId); // Reference to the document

    const fetchUserData = async () => {
      try {
        // Fetch the document
        const docSnap = await getDoc(documentRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Firestore Data Retrieved:", data);

          // Extract the first object's data
          const firstKey = Object.keys(data)[0]; // Gets the first key (e.g., "6HAL5ErMU7TaESyRQU83eV9MVvv1")
          const userData = data[firstKey]; // Accesses { fullName: "Rizal Liwa", role: "student" }

          console.log("Extracted User Data:", userData);

          setUserInfo({
            name: userData?.fullName || 'Unknown User',
            role: userData?.role || 'No Role'
          });
        } else {
          console.error('User document not found');
          setUserInfo({ name: 'Unknown User', role: 'No Role' });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserInfo({ name: 'Unknown User', role: 'No Role' });
      }
    };

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchUserData();
      } else {
        setUserInfo({ name: 'Unknown User', role: 'No Role' });
      }
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to log out?')) {
      const auth = getAuth();
      await signOut(auth);
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
            <span className="user-type">{userInfo.name}</span>
            <span className="user-grade">{userInfo.role}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
