import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './Dashboard.css';
import Sidebar from '../SideBar/SideBar';

function Dashboard() {
    const [workloads, setWorkloads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            console.log('Assignments fetched:', assignmentsData);

            // Get projects
            const projectsRef = collection(db, 'projects');
            const projectsSnap = await getDocs(projectsRef);
            const projectsData = projectsSnap.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                type: 'project'
            }));
            console.log('Projects fetched:', projectsData);

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

    return (
        <div className="dashboard-container">
            <Sidebar />
            <div className="main-content">
                <div className="dashboard-header">
                    <h1>Student Dashboard</h1>
                </div>

                {loading ? (
                    <div className="loading">Loading workloads...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : workloads.length === 0 ? (
                    <div className="no-workloads">
                        <p>No workloads available at the moment.</p>
                    </div>
                ) : (
                    <div className="workloads-grid">
                        {workloads.map(workload => (
                            <div key={workload.id} className="workload-card">
                                <div className="workload-header">
                                    <h3>{workload.title}</h3>
                                    <span className={`status ${workload.status ? workload.status.toLowerCase() : 'active'}`}>
                                        {workload.status || 'Active'}
                                    </span>
                                </div>
                                <div className="workload-content">
                                    <p>{workload.description}</p>
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
            </div>
        </div>
    );
}

export default Dashboard;
