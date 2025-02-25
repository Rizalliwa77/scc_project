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
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

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
                type: 'Assignment'
            }));

            // Get projects
            const projectsRef = collection(db, 'projects');
            const projectsSnap = await getDocs(projectsRef);
            const projectsData = projectsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                type: 'Project'
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

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const handleSubmit = async (workloadId) => {
        if (!auth.currentUser) {
            alert('You must be logged in to submit a workload.');
            return;
        }

        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        setUploading(true);

        try {
            // Check for existing submission
            const submissionsRef = collection(db, 'submissions');
            const q = query(submissionsRef, 
                where('workloadId', '==', workloadId), 
                where('studentId', '==', auth.currentUser.uid)
            );
            const existingSubmissions = await getDocs(q);

            if (!existingSubmissions.empty) {
                alert('You have already submitted this workload.');
                return;
            }

            // Submit the workload without file storage
            const newSubmission = {
                workloadId,
                studentId: auth.currentUser.uid,
                studentEmail: auth.currentUser.email,
                fileName: file.name,
                submittedAt: new Date().toISOString(),
                status: 'Submitted'
            };

            await addDoc(submissionsRef, newSubmission);
            alert('Workload submitted successfully!');
            setSelectedWorkload(null);
            setFile(null);
        } catch (error) {
            console.error("Error submitting workload:", error);
            alert('Failed to submit workload. Please try again.');
        } finally {
            setUploading(false);
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
        setFile(null); // Reset file selection when opening new workload
    };

    const filteredWorkloads = selectedClass === 'all'
        ? workloads
        : workloads.filter(workload => workload.class === selectedClass);

    const renderWorkloadCard = (workload) => (
        <div className="workload-card" onClick={() => handleWorkloadClick(workload)}>
            <div className="workload-card-header">
                <span className="workload-subject">{workload.subject}</span>
                <span className={`status-badge ${workload.status?.toLowerCase() || 'ongoing'}`}>
                    {workload.status || 'Ongoing'}
                </span>
            </div>
            <div className="workload-content">
                <h3 className="workload-title">
                    {workload.title}
                    <span className="cursor-icon material-symbols-outlined">touch_app</span>
                </h3>
                <div className="workload-due">
                    Due: {new Date(workload.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        weekday: 'long'
                    })}
                </div>
                <div className="workload-type">
                    <span className="material-symbols-outlined">assignment</span>
                    {workload.type}
                </div>
            </div>
        </div>
    );

    const renderWorkloadModal = (workload) => (
        <div className="modal-overlay" onClick={() => setSelectedWorkload(null)}>
            <div className="workload-modal" onClick={e => e.stopPropagation()}>
                <div className="workload-meta">
                    <span className="tag">{workload.type}</span>
                    <span className="tag">{workload.quarter}</span>
                </div>

                <div className="deadline">
                    <h3>DEADLINE: {new Date(workload.dueDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    })}</h3>
                </div>

                <div className="about-section">
                    <h3>About:</h3>
                    <div className="content">
                        {workload.about.split('\n').map((line, index) => {
                            if (line.trim().match(/^\d+\./)) {
                                return <ol key={index} start={line.match(/^\d+/)[0]}>
                                    <li>{line.replace(/^\d+\./, '').trim()}</li>
                                </ol>;
                            }
                            return <p key={index}>{line}</p>;
                        })}
                    </div>
                </div>

                <div className="requirements-section">
                    <h3>Requirements:</h3>
                    <div className="content">
                        <ul>
                            {workload.requirements.split('\n').map((line, index) => (
                                <li key={index}>{line}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="submit-container">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        id="file-upload"
                    />
                    <label 
                        htmlFor="file-upload" 
                        className="submit-button"
                    >
                        Submit work
                    </label>
                    {file && (
                        <div className="file-info">
                            <span>{file.name}</span>
                            <button 
                                onClick={() => handleSubmit(workload.id)}
                                className="submit-button"
                                disabled={uploading}
                            >
                                {uploading ? 'Submitting...' : 'Confirm submit'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

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
                    <div className="loading">Loading workloads...</div>
                ) : (
                    <div className="workloads-grid">
                        {filteredWorkloads.map(workload => renderWorkloadCard(workload))}
                    </div>
                )}

                {selectedWorkload && renderWorkloadModal(selectedWorkload)}
            </div>
        </div>
    );
}

export default Workloads;
