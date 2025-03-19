import React, { useState } from 'react';
import { auth, db } from '../../firebase';
import { updatePassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import './ForgotPasswordModal.css';

const ForgotPasswordModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        email: '',
        idNumber: '',
        securityAnswer: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [securityQuestion, setSecurityQuestion] = useState({ question: '', isFirst: true });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);

    const resetForm = () => {
        setFormData({
            email: '',
            idNumber: '',
            securityAnswer: '',
            newPassword: '',
            confirmPassword: ''
        });
        setSecurityQuestion({ question: '', isFirst: true });
        setStatus({ type: '', message: '' });
        setStep(1);
        setUserData(null);
    };

    const handleInitialSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const signInRef = doc(db, 'sign-in', 'PEQz5kwuehQldRsByTrA');
            const docSnap = await getDoc(signInRef);
            
            if (!docSnap.exists()) {
                throw new Error("Database not found");
            }

            const allData = docSnap.data();
            let foundUser = null;
            let userId = null;

            // Find user by email and ID number
            Object.entries(allData).forEach(([key, value]) => {
                if (value.email?.toLowerCase() === formData.email.toLowerCase() && 
                    value.idNumber === formData.idNumber) {
                    foundUser = value;
                    userId = key;
                }
            });

            if (!foundUser || !foundUser.securityQuestions) {
                throw new Error("Account not found or security questions not set");
            }

            // Randomly select one of the two security questions
            const isFirstQuestion = Math.random() < 0.5;
            setSecurityQuestion({
                question: isFirstQuestion ? foundUser.securityQuestions.question1 : foundUser.securityQuestions.question2,
                isFirst: isFirstQuestion
            });

            setUserData({ ...foundUser, userId });
            setStep(2);
            setStatus({ type: '', message: '' });
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSecurityAnswer = (e) => {
        e.preventDefault();
        
        const correctAnswer = securityQuestion.isFirst ? 
            userData.securityQuestions.answer1 : 
            userData.securityQuestions.answer2;

        if (formData.securityAnswer.toLowerCase().trim() === correctAnswer) {
            setStep(3);
            setStatus({ type: '', message: '' });
        } else {
            setStatus({ type: 'error', message: 'Incorrect answer to security question' });
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            if (formData.newPassword !== formData.confirmPassword) {
                setStatus({ type: 'error', message: 'Passwords do not match' });
                setLoading(false);
                return;
            }

            // Update password in Firebase Auth
            await updatePassword(auth.currentUser, formData.newPassword);

            // Sign out after password update
            await auth.signOut();

            setStatus({
                type: 'success',
                message: 'Password successfully updated! You can now login with your new password.'
            });

            setTimeout(() => {
                onClose();
                resetForm();
            }, 2000);

        } catch (error) {
            console.error('Error:', error);
            setStatus({ 
                type: 'error', 
                message: 'Failed to update password. Please try again.' 
            });
        } finally {
            setLoading(false);
        }
    };

    const getPasswordMatchIndicator = () => {
        if (!formData.newPassword || !formData.confirmPassword) return null;
        const matches = formData.newPassword === formData.confirmPassword;
        return (
            <span className={`password-match-indicator ${matches ? 'match' : 'no-match'}`}>
                {matches ? '✓ Passwords Match' : '✗ Passwords Do Not Match'}
            </span>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="modal-close" onClick={() => { onClose(); resetForm(); }}>×</button>
                <h2>Reset Password</h2>

                {status.message && (
                    <div className={`status-message ${status.type}`}>
                        {status.message}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleInitialSubmit}>
                        <p>Please enter your account details:</p>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            placeholder="School Email"
                            className="modal-input"
                            required
                        />
                        <input
                            type="text"
                            value={formData.idNumber}
                            onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                            placeholder="ID Number"
                            className="modal-input"
                            required
                        />
                        <button 
                            type="submit" 
                            className="modal-button"
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "Continue"}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleSecurityAnswer}>
                        <p>Please answer your security question:</p>
                        <div className="security-question">
                            <label>{securityQuestion.question}</label>
                            <input
                                type="text"
                                value={formData.securityAnswer}
                                onChange={(e) => setFormData({...formData, securityAnswer: e.target.value})}
                                className="modal-input"
                                placeholder="Your Answer"
                                required
                            />
                        </div>
                        <button type="submit" className="modal-button">
                            Verify Answer
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handlePasswordChange}>
                        <p>Enter your new password:</p>
                        <div className="password-input-group">
                            <input
                                type="password"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                placeholder="New Password"
                                className="modal-input"
                                required
                            />
                        </div>
                        <div className="password-input-group">
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                placeholder="Confirm New Password"
                                className="modal-input"
                                required
                            />
                            {getPasswordMatchIndicator()}
                        </div>
                        <button 
                            type="submit" 
                            className="modal-button"
                            disabled={loading || formData.newPassword !== formData.confirmPassword}
                        >
                            {loading ? "Updating Password..." : "Update Password"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordModal; 