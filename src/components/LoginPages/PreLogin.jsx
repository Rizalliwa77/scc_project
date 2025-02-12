import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { auth, db } from '../../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import NavBar from '../NavigationBar/NavBar';
import './PreLogin.css';

function PreLogin() {
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const verifyRoleExists = async (role) => {
        try {
            // Check if the role exists in the system with error handling
            const mainDocRef = doc(db, 'sign-in', 'PEQz5kwuehQldRsByTrA');
            
            let docSnap;
            try {
                docSnap = await getDoc(mainDocRef);
            } catch (fetchError) {
                console.error("Error accessing database:", fetchError);
                throw new Error('Unable to verify role. Please try again later.');
            }

            if (!docSnap.exists()) {
                console.error("Configuration document not found");
                throw new Error('System configuration error. Please contact administrator.');
            }

            const data = docSnap.data();
            
            // Check if there's at least one user with this role
            const hasRole = Object.values(data).some(user => user.role === role);
            
            if (!hasRole) {
                throw new Error(`Invalid role selection: ${role}`);
            }
            
            return true;
        } catch (error) {
            console.error("Role verification error:", error);
            throw error;
        }
    };

    const handleRoleSelect = async (role) => {
        try {
            // Validate role format
            if (role !== 'teacher' && role !== 'student') {
                setError('Invalid role selected');
                return;
            }

            // Verify role exists in database
            await verifyRoleExists(role);
            
            // Store role in session storage
            sessionStorage.setItem('selectedRole', role);
            
            // Navigate to login with role
            navigate('/login', { 
                state: { role },
                replace: true 
            });
        } catch (error) {
            setError(error.message || 'Error selecting role. Please try again.');
        }
    };

    return (
        <div className="prelogin-wrapper">
            <NavBar />
            <div className="prelogin-content">
                <div className="prelogin-card">
                    <h2 className="prelogin-title">
                        What is your<br />SCC role?
                    </h2>
                    {error && <p className="error-message">{error}</p>}
                    <div className="prelogin-buttons">
                        <button 
                            className="prelogin-button"
                            onClick={() => handleRoleSelect('teacher')}
                        >
                            Teacher
                        </button>
                        <button 
                            className="prelogin-button"
                            onClick={() => handleRoleSelect('student')}
                        >
                            Student
                        </button>
                    </div>
                </div>
                <div className="prelogin-signin">
                    <p>Don't have an account yet? <a href="/signin">Sign in now</a></p>
                </div>
            </div>
        </div>
    );
}

export default PreLogin;
