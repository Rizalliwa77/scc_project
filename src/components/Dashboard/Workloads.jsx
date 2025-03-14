import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, getDocs, addDoc, query, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { supabase } from '../../supabaseClient';
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
    const [submissions, setSubmissions] = useState({});

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                fetchWorkloads();
                fetchSubmissions();
            } else {
                setWorkloads([]);
                setSubmissions({});
            }
        });

        return () => unsubscribe();
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
                type: 'Assignment',
                key: `assignment-${doc.id}`
            }));

            // Get projects
            const projectsRef = collection(db, 'projects');
            const projectsSnap = await getDocs(projectsRef);
            const projectsData = projectsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                type: 'Project',
                key: `project-${doc.id}`
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

    const fetchSubmissions = async () => {
        if (!auth.currentUser) {
            console.log('No authenticated user');
            return;
        }

        try {
            const submissionsRef = collection(db, 'submissions');
            const q = query(
                submissionsRef, 
                where('studentId', '==', auth.currentUser.uid)
            );
            
            const querySnapshot = await getDocs(q);
            const submissionsData = {};
            
            querySnapshot.forEach(doc => {
                const data = doc.data();
                submissionsData[data.workloadId] = {
                    ...data,
                    id: doc.id
                };
            });
            
            setSubmissions(submissionsData);
        } catch (error) {
            console.error("Error fetching submissions:", error);
            // Don't show an error to the user, just log it
            // Missing submissions shouldn't break the whole app
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const handleSubmit = async (workloadId) => {
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        setUploading(true);

        try {
            // Simple filename with timestamp
            const timestamp = new Date().getTime();
            const fileName = `${timestamp}_${file.name}`;

            console.log('Attempting to upload file:', fileName);

            // Simple upload
            const { data, error: uploadError } = await supabase.storage
                .from('workload-submissions')
                .upload(fileName, file);

            if (uploadError) {
                console.error('Upload error details:', uploadError);
                throw uploadError;
            }

            console.log('File uploaded successfully:', data);

            // Get the URL
            const { data: { publicUrl } } = supabase.storage
                .from('workload-submissions')
                .getPublicUrl(fileName);

            console.log('Generated public URL:', publicUrl);

            // Create submission data
            const submissionData = {
                workloadId,
                studentId: auth.currentUser?.uid || 'anonymous',
                studentEmail: auth.currentUser?.email || 'anonymous',
                fileName: file.name,
                fileUrl: publicUrl,
                filePath: fileName,
                submittedAt: new Date().toISOString(),
                status: 'Submitted'
            };

            // Save to Firestore
            const submissionsRef = collection(db, 'submissions');
            const q = query(submissionsRef, 
                where('workloadId', '==', workloadId),
                where('studentId', '==', submissionData.studentId)
            );
            
            const existingSubmissions = await getDocs(q);

            if (!existingSubmissions.empty) {
                console.log('Updating existing submission');
                await updateDoc(existingSubmissions.docs[0].ref, submissionData);
            } else {
                console.log('Creating new submission');
                await addDoc(submissionsRef, submissionData);
            }

            await fetchSubmissions();
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

    const handleDownload = async (fileUrl, fileName) => {
        try {
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error("Error downloading file:", error);
            alert('Failed to download file. Please try again.');
        }
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

    const renderWorkloadModal = (workload) => {
        const submission = submissions[workload.id];

        return (
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

                    <div className="submission-status">
                        {submission ? (
                            <div className="submitted-info">
                                <p>Submitted on: {new Date(submission.submittedAt).toLocaleString()}</p>
                                <div className="file-actions">
                                    <span>{submission.fileName}</span>
                                    <button 
                                        onClick={() => handleDownload(submission.fileUrl, submission.fileName)}
                                        className="download-button"
                                    >
                                        Download
                                    </button>
                                    <button 
                                        onClick={() => handleSubmit(workload.id)}
                                        className="resubmit-button"
                                    >
                                        Resubmit
                                    </button>
                                </div>
                            </div>
                        ) : (
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
                        )}
                    </div>
                </div>
            </div>
        );
    };

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
                        {filteredWorkloads.map(workload => (
                            <div key={workload.key || workload.id} className="workload-card" onClick={() => handleWorkloadClick(workload)}>
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
                        ))}
                    </div>
                )}

                {selectedWorkload && renderWorkloadModal(selectedWorkload)}
            </div>
        </div>
    );
}

export default Workloads;
