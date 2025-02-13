import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, getDocs, addDoc, doc } from 'firebase/firestore';
import Sidebar from '../SideBar/tSideBar';
import "./tDashboard.css";
import WorkloadModal from './WorkloadModal';

const TeacherDashboard = () => {
  const [workloads, setWorkloads] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWorkloads();
  }, []);

  const fetchWorkloads = async () => {
    if (!auth.currentUser) {
      setError('You must be logged in to view workloads.');
      return;
    }

    try {
      // Get workloads from teacher's user collection
      const workloadsRef = collection(db, 'users', auth.currentUser.uid, 'workloads');
      const workloadsSnapshot = await getDocs(workloadsRef);
      
      const workloadsData = workloadsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setWorkloads(workloadsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching workloads:", error);
      setLoading(false);
    }
  };

  const handleCreateWorkload = async (workloadData) => {
    try {
      const collectionRef = collection(db, 
        workloadData.type === 'assignment' ? 'assignments' : 'projects'
      );
      
      await addDoc(collectionRef, {
        ...workloadData,
        createdAt: new Date().toISOString(),
        status: 'Active'
      });

      fetchWorkloads();
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating workload:", error);
    }
  };

  const subjects = [
    { 
      name: "Grade 10 - TLE", 
      color: "#E3F2FD", 
      icon: "engineering",
      studentsCount: 45,
      submissionRate: "85%",
      pendingGrades: 12
    },
    { 
      name: "Grade 9 - TLE", 
      color: "#E8F5E9", 
      icon: "engineering",
      studentsCount: 48,
      submissionRate: "78%",
      pendingGrades: 15
    },
    // Add more classes/sections as needed
  ];

  const teacherDeadlines = [
    { 
      date: "Jan 30, 2024", 
      tasks: [
        { 
          name: "Grade Research Papers - Grade 10",
          type: "Grading",
          status: "Urgent",
          subject: "TLE",
          pendingCount: 15
        },
        { 
          name: "Submit Quarter Grades",
          type: "Administrative",
          status: "Pending",
          subject: "All Classes",
          deadline: "Jan 31, 2024"
        }
      ]
    },
    // More deadlines...
  ];

  const handleCreateAssignment = () => {
    // Implementation for creating new assignments
  };

  const handleGradeSubmissions = () => {
    // Implementation for grading interface
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <div className="content-wrapper">
          <div className="header-section">
            <h1>Teacher Dashboard</h1>
            <button 
              className="create-button"
              onClick={() => setShowCreateModal(true)}
            >
              + Create Workload
            </button>
          </div>

          <div className="workloads-section">
            <h2>Recent Workloads</h2>
            {loading ? (
              <div className="loading">Loading workloads...</div>
            ) : workloads.length === 0 ? (
              <div className="no-workloads">
                <p>No workloads available</p>
              </div>
            ) : (
              <div className="workloads-grid">
                {workloads.slice(0, 4).map((workload) => (
                  <div key={workload.id} className={`workload-card ${workload.type}`}>
                    <div className="workload-header">
                      <span className="type-badge">
                        {workload.type.charAt(0).toUpperCase() + workload.type.slice(1)}
                      </span>
                      <span className="status-badge">{workload.status}</span>
                    </div>
                    <h3 className="workload-title">{workload.title}</h3>
                    <p className="workload-class">{workload.class}</p>
                    <div className="workload-footer">
                      <span className="due-date">Due: {new Date(workload.dueDate).toLocaleDateString()}</span>
                      <span className="points">{workload.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {showCreateModal && (
          <WorkloadModal 
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateWorkload}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
