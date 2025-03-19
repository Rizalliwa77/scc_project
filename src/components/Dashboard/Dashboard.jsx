import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import './Dashboard.css';
import Sidebar from '../SideBar/SideBar';
import { auth } from '../../firebase';

function Dashboard() {
    const [workloads, setWorkloads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userGrade, setUserGrade] = useState('');
    const [userSection, setUserSection] = useState('');

    // Add new state for subjects
    const [subjects] = useState([
        { name: 'TLE', progress: 85, icon: 'engineering' },
        { name: 'Science', progress: 72, icon: 'science' },
        { name: 'Computer', progress: 90, icon: 'computer' },
        { name: 'CLE', progress: 68, icon: 'menu_book' },
        { name: 'English', progress: 75, icon: 'translate' },
        { name: 'Filipino', progress: 88, icon: 'history_edu' },
        { name: 'Math', progress: 70, icon: 'calculate' },
        { name: 'AP', progress: 82, icon: 'public' },
        { name: 'MAPEH', progress: 95, icon: 'sports_basketball' }
    ]);

    useEffect(() => {
        fetchWorkloads();
        const fetchUserData = async () => {
            if (auth.currentUser) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUserGrade(userData.grade);
                        setUserSection(userData.section);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            }
        };

        fetchUserData();
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
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-wrapper">
                <div className="dashboard-header">
                    <div className="header-left">
                        <h1>Student Dashboard</h1>
                    </div>
                    <div className="section-dropdown">
                        {userGrade && userSection ? `${userGrade} - ${userSection}` : 'Loading...'}
                    </div>
                </div>

                <div className="dashboard-content">
                    <div className="subjects-grid">
                        {subjects.map((subject, index) => (
                            <div key={index} className="subject-card">
                                <div className="subject-icon">
                                    <span className="material-symbols-outlined">{subject.icon}</span>
                                </div>
                                <div className="subject-info">
                                    <div className="subject-name">{subject.name}</div>
                                    <div className="progress-bar">
                                        <div 
                                            className="progress" 
                                            style={{ width: `${subject.progress}%` }}
                                        ></div>
                                    </div>
                                    <span className="progress-text">{subject.progress}% Complete</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="deadline-section">
                        <div className="deadline-header">
                            <h2>📅 Upcoming Deadlines</h2>
                            <button className="view-all">View All</button>
                        </div>
                        
                        <div className="deadline-container">
                            {loading ? (
                                <div className="loading">Loading deadlines...</div>
                            ) : error ? (
                                <div className="error-message">{error}</div>
                            ) : workloads.length === 0 ? (
                                <p>No upcoming deadlines</p>
                            ) : (
                                workloads.slice(0, 5).map(workload => (
                                    <div key={workload.id} className="deadline-card">
                                        <div className="assignment-header">
                                            <span className="assignment-type">{workload.type}</span>
                                            <span className={`status-badge ${workload.status?.toLowerCase() || 'upcoming'}`}>
                                                {workload.status || 'Upcoming'}
                                            </span>
                                        </div>
                                        <div className="assignment-title">{workload.title}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
