import React, { useState } from 'react';
import NavBar from '../../NavigationBar/NavBar';
import './SignIn.css';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function SignIn() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        contactNumber: '',
        grade: '',
        section: '',
        idNumber: '',
        userType: 'student'
    });
    const [showPopup, setShowPopup] = useState(false);
    const [sections, setSections] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const gradeSections = {
        '7': ['STS', 'SRL', 'SAM'],
        '8': ['SLR', 'SPEV'],
        '9': ['SVF', 'SHP'],
        '10': ['SJH', 'STA']
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'grade') {
            setSections(gradeSections[value] || []);
            setFormData(prev => ({
                ...prev,
                section: '',
                [name]: value
            }));
        }
    };

    const validateForm = () => {
        setError("");

        if (!formData.email.endsWith("@scc.edu.ph")) {
            setError("Please use your school email (@scc.edu.ph)");
            return false;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return false;
        }

        const phoneRegex = /^[0-9]{11}$/;
        if (!phoneRegex.test(formData.contactNumber)) {
            setError("Please enter a valid 11-digit contact number");
            return false;
        }

        if (formData.userType === 'student') {
            const studentIdRegex = /^[0-9]{7}$/;
            if (!studentIdRegex.test(formData.idNumber)) {
                setError("Please enter a valid 7-digit student ID number");
                return false;
            }
        } else if (formData.userType === 'teacher') {
            const employeeIdRegex = /^[0-9]{6}$/;
            if (!employeeIdRegex.test(formData.idNumber)) {
                setError("Please enter a valid 6-digit employee ID number");
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (!validateForm()) return;

            setLoading(true);

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );

            // Store in the first document (existing)
            const signInRef = doc(db, "sign-in", "PEQz5kwuehQldRsByTrA");
            await setDoc(signInRef, {
                [userCredential.user.uid]: {
                    fullName: formData.fullName,
                    email: formData.email,
                    contactNumber: formData.contactNumber,
                    grade: formData.userType === 'student' ? formData.grade : null,
                    section: formData.userType === 'student' ? formData.section : null,
                    idNumber: formData.idNumber,
                    role: formData.userType,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                }
            }, { merge: true });

            // Store in the second document
            const userInfoRef = doc(db, "sign-in", "1qo1S53fQK4y4HT8GFrS");
            await setDoc(userInfoRef, {
                [userCredential.user.uid]: {
                    fullName: formData.fullName,
                    role: formData.userType
                }
            }, { merge: true });

            setTimeout(() => {
                setLoading(false);
                setShowPopup(true);
            }, 2000);

        } catch (error) {
            setLoading(false);
            console.error("Error during sign up:", error);
            switch (error.code) {
                case 'auth/email-already-in-use':
                    setError("This email is already registered");
                    break;
                case 'auth/invalid-email':
                    setError("Invalid email address");
                    break;
                case 'auth/operation-not-allowed':
                    setError("Sign up is currently disabled");
                    break;
                case 'auth/weak-password':
                    setError("Password is too weak");
                    break;
                default:
                    setError("Failed to create account. Please try again");
            }
        }
    };

    const handleLogin = () => {
        navigate('/prelogin');
    };

    const handleHome = () => {
        navigate('/');
    };

    return (
        <div className="signin-wrapper">
            <NavBar />
            <div className="signin-content">
                <div className="signin-card">
                    <h2 className="signin-title">SCC Sign Up</h2>
                    <form className="signin-form" onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <input 
                                    type="text" 
                                    placeholder="Full Name" 
                                    className="signin-input" 
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <input 
                                    type="text" 
                                    placeholder="ID Number" 
                                    className="signin-input" 
                                    name="idNumber"
                                    value={formData.idNumber}
                                    onChange={handleInputChange}
                                    required 
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <select 
                                    className="signin-input" 
                                    name="userType"
                                    value={formData.userType}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <input 
                                    type="email" 
                                    placeholder="Email" 
                                    className="signin-input" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required 
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <input 
                                    type="password" 
                                    placeholder="Password" 
                                    className="signin-input" 
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <input 
                                    type="password" 
                                    placeholder="Confirm Password" 
                                    className="signin-input" 
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required 
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <input 
                                    type="text" 
                                    placeholder="Contact Number" 
                                    className="signin-input" 
                                    name="contactNumber"
                                    value={formData.contactNumber}
                                    onChange={handleInputChange}
                                    required 
                                />
                            </div>
                            {formData.userType === 'student' && (
                                <div className="form-group">
                                    <select 
                                        className="signin-input" 
                                        value={formData.grade} 
                                        onChange={handleInputChange}
                                        required
                                        name="grade"
                                    >
                                        <option value="">Select Grade Level</option>
                                        <option value="7">Grade 7</option>
                                        <option value="8">Grade 8</option>
                                        <option value="9">Grade 9</option>
                                        <option value="10">Grade 10</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        {formData.userType === 'student' && (
                            <div className="form-row">
                                <div className="form-group">
                                    <select 
                                        className="signin-input" 
                                        value={formData.section}
                                        onChange={handleInputChange}
                                        required
                                        disabled={!formData.grade}
                                        name="section"
                                    >
                                        <option value="">Select Section</option>
                                        {sections.map((section) => (
                                            <option key={section} value={section}>
                                                {section}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}
                        {error && <p className="error-message">{error}</p>}
                        <button 
                            type="submit" 
                            className="signin-button"
                            disabled={loading}
                        >
                            {loading ? "Creating Account..." : "Sign Up"}
                        </button>
                    </form>
                </div>
            </div>

            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                    <p>Creating your account...</p>
                </div>
            )}

            {showPopup && (
                <div className="popup">
                    <div className="popup-content">
                        <div className="success-icon">✓</div>
                        <h3>Account Created Successfully!</h3>
                        <p>Please check your email to confirm your account setup.</p>
                        <div className="popup-buttons">
                            <button onClick={handleLogin} className="popup-button primary">
                                Proceed to Login
                            </button>
                            <button onClick={handleHome} className="popup-button secondary">
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SignIn;