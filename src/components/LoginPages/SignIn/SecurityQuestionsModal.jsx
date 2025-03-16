import React from 'react';
import './SecurityQuestionsModal.css';

const SecurityQuestionsModal = ({ 
    isOpen, 
    onClose, 
    securityData, 
    onSecurityDataChange,
    onSubmit,
    SECURITY_QUESTIONS 
}) => {
    if (!isOpen) return null;

    return (
        <div className="security-modal-overlay">
            <div className="security-modal-content">
                <button className="security-modal-close" onClick={onClose}>×</button>
                <h2>Security Questions</h2>
                <p className="security-modal-desc">Please select two security questions and provide your answers</p>
                
                <form onSubmit={onSubmit}>
                    <div className="security-question-group">
                        <select
                            className="security-modal-input"
                            name="securityQuestion1"
                            value={securityData.securityQuestion1}
                            onChange={onSecurityDataChange}
                            required
                        >
                            <option value="">Select First Security Question</option>
                            {SECURITY_QUESTIONS.map((question, index) => (
                                <option 
                                    key={index} 
                                    value={question}
                                    disabled={question === securityData.securityQuestion2}
                                >
                                    {question}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            className="security-modal-input"
                            placeholder="Your Answer"
                            name="securityAnswer1"
                            value={securityData.securityAnswer1}
                            onChange={onSecurityDataChange}
                            required
                        />
                    </div>

                    <div className="security-question-group">
                        <select
                            className="security-modal-input"
                            name="securityQuestion2"
                            value={securityData.securityQuestion2}
                            onChange={onSecurityDataChange}
                            required
                        >
                            <option value="">Select Second Security Question</option>
                            {SECURITY_QUESTIONS.map((question, index) => (
                                <option 
                                    key={index} 
                                    value={question}
                                    disabled={question === securityData.securityQuestion1}
                                >
                                    {question}
                                </option>
                            ))}
                        </select>
                        <input
                            type="text"
                            className="security-modal-input"
                            placeholder="Your Answer"
                            name="securityAnswer2"
                            value={securityData.securityAnswer2}
                            onChange={onSecurityDataChange}
                            required
                        />
                    </div>

                    <button type="submit" className="security-modal-button">
                        Save Security Questions
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SecurityQuestionsModal; 