import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import TeacherSidebar from '../SideBar/tSideBar'; // Fixed import
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

  return (
    <div className="dashboard-container">
      <TeacherSidebar /> {/* Fixed component usage */}
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
