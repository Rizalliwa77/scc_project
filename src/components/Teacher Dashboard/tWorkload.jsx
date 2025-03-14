import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import TeacherSidebar from '../SideBar/Teacher_Sidebar';
import WorkloadModal from './WorkloadModal';
import './tWorkload.css';

function TeacherWorkload() {
    const [workloads, setWorkloads] = useState([]);
    const [selectedClass, setSelectedClass] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [selectedWorkload, setSelectedWorkload] = useState(null);
    const [modalMode, setModalMode] = useState('create');
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState({});
    const [selectedSubmissionType, setSelectedSubmissionType] = useState('all');
    const [viewingSubmissions, setViewingSubmissions] = useState(false);

    useEffect(() => {
        fetchWorkloads();
    }, []);

    const fetchWorkloads = async () => {
        try {
            const assignmentsSnapshot = await getDocs(collection(db, 'assignments'));
            const assignmentsData = assignmentsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                type: 'assignment'
            }));

            const projectsSnapshot = await getDocs(collection(db, 'projects'));
            const projectsData = projectsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                type: 'project'
            }));

            const allWorkloads = [...assignmentsData, ...projectsData]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setWorkloads(allWorkloads);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching workloads:", error);
            setLoading(false);
        }
    };

    const fetchSubmissions = async (workloadId) => {
        try {
            const submissionsRef = collection(db, 'submissions');
            const q = query(submissionsRef, where('workloadId', '==', workloadId));
            const submissionsSnapshot = await getDocs(q);
            
            const submissionsData = {};
            submissionsSnapshot.docs.forEach(doc => {
                submissionsData[doc.id] = {
                    id: doc.id,
                    ...doc.data()
                };
            });
            
            setSubmissions(submissionsData);
            setViewingSubmissions(true);
        } catch (error) {
            console.error("Error fetching submissions:", error);
        }
    };

    const handleCreateClick = () => {
        setSelectedWorkload(null);
        setModalMode('create');
        setShowModal(true);
    };

    const handleEditClick = (workload) => {
        setSelectedWorkload(workload);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleCreate = async (newWorkload) => {
        setWorkloads(prevWorkloads => [newWorkload, ...prevWorkloads]);
    };

    const handleUpdate = async (updatedWorkload) => {
        setWorkloads(prevWorkloads => 
            prevWorkloads.map(w => w.id === updatedWorkload.id ? updatedWorkload : w)
        );
    };

    const handleDelete = async (workloadId) => {
        setWorkloads(prevWorkloads => 
            prevWorkloads.filter(w => w.id !== workloadId)
        );
    };

    const filteredWorkloads = selectedClass === 'All' 
        ? workloads 
        : workloads.filter(workload => workload.class === selectedClass);

    const SubmissionsView = ({ workloadId, onClose }) => {
        const submissionsList = Object.values(submissions);
        
        return (
            <div className="submissions-overlay">
                <div className="submissions-modal">
                    <div className="submissions-header">
                        <h2>Student Submissions</h2>
                        <button onClick={onClose} className="close-button">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    
                    {submissionsList.length === 0 ? (
                        <div className="no-submissions">
                            <p>No submissions yet</p>
                        </div>
                    ) : (
                        <div className="submissions-list">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Student Email</th>
                                        <th>Submitted At</th>
                                        <th>File</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissionsList.map(submission => (
                                        <tr key={submission.id}>
                                            <td>{submission.studentEmail}</td>
                                            <td>{new Date(submission.submittedAt).toLocaleString()}</td>
                                            <td>
                                                <a 
                                                    href={submission.fileUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="download-link"
                                                >
                                                    {submission.fileName}
                                                </a>
                                            </td>
                                            <td>{submission.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderWorkloadCard = (workload) => (
        <div key={workload.id} className={`workload-card ${workload.type}`}>
            <div className="workload-card-header">
                <h3>{workload.title}</h3>
                <div className="card-actions">
                    <button 
                        className="view-submissions-button"
                        onClick={() => fetchSubmissions(workload.id)}
                    >
                        <span className="material-symbols-outlined">assignment_turned_in</span>
                    </button>
                    <button 
                        className="edit-button"
                        onClick={() => handleEditClick(workload)}
                    >
                        <span className="material-symbols-outlined">edit</span>
                    </button>
                </div>
            </div>
            <div className="workload-card-content">
                <p className="description">{workload.description}</p>
                <div className="workload-details">
                    <span className="class">{workload.class}</span>
                    <span className="type">{workload.type}</span>
                    <span className="points">{workload.points} points</span>
                </div>
                <div className="workload-date">
                    Due: {new Date(workload.dueDate).toLocaleDateString()}
                </div>
            </div>
        </div>
    );

    return (
        <div className="dashboard-container">
            <TeacherSidebar />
            <div className="main-content">
                <div className="content-wrapper">
                    <div className="header-section">
                        <div className="header-left">
                            <h1>Workload Management</h1>
                            <select 
                                className="class-select"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                            >
                                <option value="All">All</option>
                                <option value="Grade 10 - STA">Grade 10 - STA</option>
                                <option value="Grade 10 - STB">Grade 10 - STB</option>
                                <option value="Grade 9 - SVF">Grade 9 - SVF</option>
                                <option value="Grade 9 - SHP">Grade 9 - SHP</option>
                            </select>
                        </div>
                        <button 
                            className="create-button"
                            onClick={handleCreateClick}
                        >
                            <span className="material-symbols-outlined">add</span>
                            Create New Workload
                        </button>
                    </div>

                    <div className="filters-section">
                        <select 
                            value={selectedSubmissionType}
                            onChange={(e) => setSelectedSubmissionType(e.target.value)}
                            className="submission-type-select"
                        >
                            <option value="all">All Types</option>
                            <option value="assignment">Assignments</option>
                            <option value="project">Projects</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="loading">Loading workloads...</div>
                    ) : filteredWorkloads.length === 0 ? (
                        <div className="no-workloads">
                            <p>No workloads available for the selected class</p>
                        </div>
                    ) : (
                        <div className="workloads-grid">
                            {filteredWorkloads
                                .filter(workload => 
                                    selectedSubmissionType === 'all' || 
                                    workload.type.toLowerCase() === selectedSubmissionType
                                )
                                .map(renderWorkloadCard)}
                        </div>
                    )}
                </div>

                {showModal && (
                    <WorkloadModal
                        onClose={() => setShowModal(false)}
                        onCreate={handleCreate}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                        workload={selectedWorkload}
                        mode={modalMode}
                    />
                )}

                {viewingSubmissions && (
                    <SubmissionsView
                        workloadId={selectedWorkload?.id}
                        onClose={() => setViewingSubmissions(false)}
                    />
                )}
            </div>
        </div>
    );
}

export default TeacherWorkload;
