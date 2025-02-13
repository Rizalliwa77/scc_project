import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, getDocs, addDoc, query, where, doc, updateDoc } from 'firebase/firestore';
import './Workloads.css';
import Sidebar from '../SideBar/SideBar';

function Workloads() {
    const [workloads, setWorkloads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClass, setSelectedClass] = useState('all');
    const [selectedWorkload, setSelectedWorkload] = useState(null);

    useEffect(() => {
        fetchWorkloads();
    }, []);

    const fetchWorkloads = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching workloads...');
            
            // Get assignments
            const assignmentsRef = collection(db, 'assignments');
            const assignmentsSnap = await getDocs(assignmentsRef);
            const assignmentsData = assignmentsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                type: 'assignment'
            }));

            // Get projects
            const projectsRef = collection(db, 'projects');
            const projectsSnap = await getDocs(projectsRef);
            const projectsData = projectsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                type: 'project'
            }));

            const allWorkloads = [...assignmentsData, ...projectsData]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            
            console.log('All workloads:', allWorkloads);
            setWorkloads(allWorkloads);
        } catch (err) {
            console.error("Error fetching workloads:", err);
            setError('Failed to load workloads. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (workloadId) => {
        if (!auth.currentUser) {
            alert('You must be logged in to submit a workload.');
            return;
        }

        try {
            // Check for existing submission
            const submissionsRef = collection(db, 'submissions');
            const q = query(submissionsRef, where('workloadId', '==', workloadId), where('studentId', '==', auth.currentUser.uid));
            const existingSubmissions = await getDocs(q);

            if (!existingSubmissions.empty) {
                alert('You have already submitted this workload.');
                return;
            }

            // Submit the workload
            const newSubmission = {
                workloadId,
                studentId: auth.currentUser.uid,
                submittedAt: new Date().toISOString(),
            };

            await addDoc(submissionsRef, newSubmission);
            alert('Workload submitted successfully!');
        } catch (error) {
            console.error("Error submitting workload:", error);
            alert('Failed to submit workload. Please try again.');
        }
    };

    const handleMarkAsSubmitted = async (workloadId) => {
        if (!auth.currentUser) {
            alert('You must be logged in to mark a workload as submitted.');
            return;
        }

        try {
            // Logic to mark the workload as submitted
            // This could involve updating a field in the database
            const workloadRef = doc(db, 'assignments', workloadId); // or 'projects' based on your structure
            await updateDoc(workloadRef, { status: 'submitted' });
            alert('Workload marked as submitted successfully!');
            fetchWorkloads(); // Refresh the workloads to reflect the change
        } catch (error) {
            console.error("Error marking workload as submitted:", error);
            alert('Failed to mark workload as submitted. Please try again.');
        }
    };

    const handleWorkloadClick = (workload) => {
        setSelectedWorkload(workload);
    };

    const filteredWorkloads = selectedClass === 'all'
        ? workloads
        : workloads.filter(workload => workload.class === selectedClass);

    if (error) {
        return (
            <div className="workload-container">
                <Sidebar />
                <div className="main-content">
                    <div className="error-message">
                        {error}
                        <button onClick={fetchWorkloads} className="retry-button">
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="workload-container">
            <Sidebar />
            <div className="main-content">
                <div className="workload-header">
                    <h1>Workloads</h1>
                    <div className="header-controls">
                        <select
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className="class-filter"
                        >
                            <option value="all">All Classes</option>
                            <option value="Grade 10 - STA">Grade 10 - STA</option>
                            <option value="Grade 10 - STB">Grade 10 - STB</option>
                            <option value="Grade 9 - SVF">Grade 9 - SVF</option>
                            <option value="Grade 9 - SHP">Grade 9 - SHP</option>
                        </select>
                        <button onClick={fetchWorkloads} className="refresh-button">
                            <span className="material-symbols-outlined">refresh</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">
                        <div className="loading-spinner"></div>
                        <p>Loading workloads...</p>
                    </div>
                ) : filteredWorkloads.length === 0 ? (
                    <div className="no-workloads">
                        <p>No workloads available for the selected class.</p>
                    </div>
                ) : (
                    <div className="workloads-grid">
                        {filteredWorkloads.map(workload => (
                            <div key={workload.id} className="workload-card" onClick={() => handleWorkloadClick(workload)}>
                                <div className="workload-header">
                                    <h3>{workload.title}</h3>
                                    <span className={`status ${workload.status?.toLowerCase() || 'active'}`}>
                                        {workload.status || 'Active'}
                                    </span>
                                </div>
                                <div className="workload-content">
                                    <p className="description">{workload.description}</p>
                                    <div className="workload-details">
                                        <span className="class">{workload.class}</span>
                                        <span className="type">{workload.type}</span>
                                        <span className="points">{workload.points} points</span>
                                    </div>
                                    <div className="due-date">
                                        Due: {new Date(workload.dueDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {selectedWorkload && (
                    <div className="workload-details-modal">
                        <h2>{selectedWorkload.title}</h2>
                        <p>{selectedWorkload.description}</p>
                        <div className="workload-details">
                            <span className="class">{selectedWorkload.class}</span>
                            <span className="type">{selectedWorkload.type}</span>
                            <span className="points">{selectedWorkload.points} points</span>
                        </div>
                        <div className="due-date">
                            Due: {new Date(selectedWorkload.dueDate).toLocaleDateString()}
                        </div>
                        <button 
                            className="submit-button"
                            onClick={() => handleSubmit(selectedWorkload.id)}
                        >
                            Submit Work
                        </button>
                        <button 
                            className="mark-submitted-button"
                            onClick={() => handleMarkAsSubmitted(selectedWorkload.id)}
                        >
                            Mark as Submitted
                        </button>
                        <button 
                            className="close-button"
                            onClick={() => setSelectedWorkload(null)}
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Workloads;
