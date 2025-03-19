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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
          const firstKey = Object.keys(data)[0]; 
          const userData = data[firstKey]; 

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

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      sessionStorage.removeItem('isAuthenticated');
      sessionStorage.removeItem('userRole');
      navigate('/prelogin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="SCC Logo" className="sidebar-logo" />
          <h1>Catherinian Taskboard</h1>
          <p>- Student -</p>
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
        </div>

        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogoutClick}>
            <span className="material-symbols-outlined">logout</span>
            LOG OUT
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="logout-modal">
            <div className="modal-header">
              <h2>Confirm Logout</h2>
            </div>
            <div className="modal-content">
              <p>Are you sure you want to log out?</p>
            </div>
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={handleLogoutCancel}
              >
                Cancel
              </button>
              <button 
                className="confirm-button"
                onClick={handleLogoutConfirm}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
