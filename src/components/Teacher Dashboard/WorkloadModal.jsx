import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import './WorkloadModal.css';

function WorkloadModal({ onClose, onCreate, onUpdate, onDelete, workload, mode = 'create' }) {
    const [formData, setFormData] = useState(
        mode === 'edit' ? workload : {
            title: '',
            about: '',
            requirements: '',
            class: 'Grade 10 - STA',
            type: 'Assignment',
            quarter: '1st Quarter',
            dueDate: '',
            points: '',
            status: 'Active',
            subject: 'Technical Livelihood Education',
            submissions: [],
            teacherId: auth.currentUser?.uid || '',
            teacherEmail: auth.currentUser?.email || ''
        }
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showUpdateConfirm, setShowUpdateConfirm] = useState(false);

    const classes = [
        'Grade 10 - STA',
        'Grade 10 - SJH',
        'Grade 9 - SVP',
        'Grade 9 - SHP',
        'Grade 8 - SLR',
        'Grade 8 - SPEV',
        'Grade 7 - STS',
        'Grade 7 - SRL',
        'Grade 7 - SAM'
    ];

    // Add sections mapping
    const gradeSections = {
        'Grade 7': ['STS', 'SRL', 'SAM'],
        'Grade 8': ['SLR', 'SPEV'],
        'Grade 9': ['SVP', 'SHP'],
        'Grade 10': ['SJH', 'STA']
    };

    // Add state for grade and section
    const [selectedGrade, setSelectedGrade] = useState(mode === 'edit' ? workload?.grade : '');
    const [availableSections, setAvailableSections] = useState([]);

    // Update sections when grade changes
    useEffect(() => {
        if (selectedGrade) {
            setAvailableSections(gradeSections[selectedGrade] || []);
        }
    }, [selectedGrade]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.about.trim() || !formData.requirements.trim()) {
            setError('About and Requirements fields are required');
            return;
        }

        if (mode === 'edit') {
            setShowUpdateConfirm(true);
        } else {
            await submitWorkload();
        }
    };

    const submitWorkload = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            if (!auth.currentUser) {
                throw new Error('You must be logged in to manage workloads');
            }

            const formattedData = {
                ...formData,
                updatedAt: new Date().toISOString(),
                points: Number(formData.points),
                dueDate: new Date(formData.dueDate).toISOString(),
                subject: 'Technical Livelihood Education',
                teacherId: auth.currentUser.uid,
                teacherEmail: auth.currentUser.email,
                type: formData.type.charAt(0).toUpperCase() + formData.type.slice(1)
            };

            if (mode === 'edit') {
                const collectionRef = collection(db, formData.type.toLowerCase() + 's');
                const docRef = doc(collectionRef, workload.id);
                
                const docSnap = await getDoc(docRef);
                if (!docSnap.exists()) {
                    throw new Error('Workload not found');
                }
                if (docSnap.data().teacherId !== auth.currentUser.uid) {
                    throw new Error('You can only edit your own workloads');
                }

                await updateDoc(docRef, formattedData);
                onUpdate({ id: workload.id, ...formattedData });
            } else {
                formattedData.createdAt = new Date().toISOString();
                formattedData.status = 'Active';
                formattedData.submissions = [];

                const collectionRef = collection(db, formData.type.toLowerCase() + 's');
                const docRef = await addDoc(collectionRef, formattedData);
                onCreate({ id: docRef.id, ...formattedData });
            }
            
            onClose();
        } catch (err) {
            console.error('Error managing workload:', err);
            setError(err.message || 'Failed to manage workload. Please try again.');
        } finally {
            setIsSubmitting(false);
            setShowUpdateConfirm(false);
        }
    };

    const handleDelete = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            if (!auth.currentUser) {
                throw new Error('You must be logged in to delete workloads');
            }

            const collectionRef = collection(db, workload.type === 'assignment' ? 'assignments' : 'projects');
            const docRef = doc(collectionRef, workload.id);
            
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) {
                throw new Error('Workload not found');
            }
            if (docSnap.data().teacherId !== auth.currentUser.uid) {
                throw new Error('You can only delete your own workloads');
            }

            await deleteDoc(docRef);
            onDelete(workload.id);
            onClose();
        } catch (err) {
            console.error('Error deleting workload:', err);
            setError(err.message || 'Failed to delete workload. Please try again.');
        } finally {
            setIsSubmitting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="workload-modal">
                <div className="modal-header">
                    <h2>{mode === 'edit' ? 'Edit Workload' : 'Create New Workload'}</h2>
                    <button 
                        onClick={onClose}
                        className="close-button"
                        disabled={isSubmitting}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                {showDeleteConfirm ? (
                    <div className="confirmation-dialog">
                        <h3 className="delete">Delete Workload</h3>
                        <p>Are you sure you want to delete this workload? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button 
                                className="cancel-button"
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button 
                                className="delete-button"
                                onClick={handleDelete}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                ) : showUpdateConfirm ? (
                    <div className="confirmation-dialog">
                        <h3>Confirm Update</h3>
                        <p>Are you sure you want to update this workload?</p>
                        <div className="modal-actions">
                            <button 
                                className="cancel-button"
                                onClick={() => setShowUpdateConfirm(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button 
                                className="submit-button"
                                onClick={submitWorkload}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                required
                                disabled={isSubmitting}
                                placeholder="Enter workload title"
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Grade Level</label>
                                <select
                                    value={selectedGrade}
                                    onChange={(e) => {
                                        setSelectedGrade(e.target.value);
                                        setFormData({...formData, grade: e.target.value, section: ''});
                                    }}
                                    required
                                    disabled={isSubmitting}
                                >
                                    <option value="">Select Grade</option>
                                    {Object.keys(gradeSections).map(grade => (
                                        <option key={grade} value={grade}>{grade}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Section</label>
                                <select
                                    value={formData.section}
                                    onChange={(e) => setFormData({...formData, section: e.target.value})}
                                    required
                                    disabled={!selectedGrade || isSubmitting}
                                >
                                    <option value="">Select Section</option>
                                    {availableSections.map(section => (
                                        <option key={section} value={section}>{section}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    required
                                    disabled={isSubmitting}
                                >
                                    <option value="assignment">Assignment</option>
                                    <option value="project">Project</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Quarter</label>
                                <select
                                    value={formData.quarter}
                                    onChange={(e) => setFormData({...formData, quarter: e.target.value})}
                                    required
                                    disabled={isSubmitting}
                                >
                                    <option value="1st Quarter">1st Quarter</option>
                                    <option value="2nd Quarter">2nd Quarter</option>
                                    <option value="3rd Quarter">3rd Quarter</option>
                                    <option value="4th Quarter">4th Quarter</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-section">
                            <h3>About</h3>
                            <div className="form-group">
                                <textarea
                                    value={formData.about}
                                    onChange={(e) => setFormData({...formData, about: e.target.value})}
                                    required
                                    disabled={isSubmitting}
                                    placeholder="Enter detailed information about the workload"
                                    rows="6"
                                    className="about-textarea"
                                />
                            </div>
                        </div>
                        <div className="form-section">
                            <h3>Requirements</h3>
                            <div className="form-group">
                                <textarea
                                    value={formData.requirements}
                                    onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                                    required
                                    disabled={isSubmitting}
                                    placeholder="Enter detailed requirements for the workload"
                                    rows="6"
                                    className="requirements-textarea"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Due Date</label>
                                <input
                                    type="datetime-local"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                    required
                                    disabled={isSubmitting}
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Points</label>
                                <input
                                    type="number"
                                    value={formData.points}
                                    onChange={(e) => setFormData({...formData, points: e.target.value})}
                                    required
                                    disabled={isSubmitting}
                                    min="0"
                                    max="100"
                                    placeholder="Enter points (0-100)"
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            {mode === 'edit' && (
                                <button 
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="delete-button"
                                    disabled={isSubmitting}
                                >
                                    Delete
                                </button>
                            )}
                            <button 
                                type="button" 
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="cancel-button"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={isSubmitting}
                                className="submit-button"
                            >
                                {isSubmitting 
                                    ? (mode === 'edit' ? 'Updating...' : 'Creating...') 
                                    : (mode === 'edit' ? 'Update' : 'Create')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default WorkloadModal;
