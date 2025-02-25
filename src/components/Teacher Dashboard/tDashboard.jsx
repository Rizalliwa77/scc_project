import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import TeacherSidebar from '../SideBar/Teacher_Sidebar';
import "./tDashboard.css";
import WorkloadModal from './WorkloadModal';

const TeacherDashboard = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Updated sections for each grade
  const gradesSections = {
    7: ['STS', 'SRL', 'SAM'],
    8: ['SLR', 'SPEV'],
    9: ['SVP', 'SHP'],
    10: ['SJH', 'STA']
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

      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating workload:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <TeacherSidebar />
      <div className="main-content">
        <div className="content-wrapper">
          <div className="header-section">
            <div className="header-title">
              <h1>TLE Teacher Dashboard</h1>
              <span className="subject-badge">Technical Livelihood Education</span>
            </div>
          </div>

          <div className="dashboard-sections">
            <div className="grade-sections-container">
              {Object.entries(gradesSections).map(([grade, sections]) => (
                <div key={grade} className="grade-card">
                  <h3>Grade {grade}</h3>
                  <div className="sections-grid">
                    {sections.map((section) => (
                      <div key={`${grade}-${section}`} className="section-card">
                        <div className="section-header">
                          <h4>{section}</h4>
                          <span className="grade-label">G{grade}</span>
                        </div>
                        <div className="section-stats">
                          <div className="stat">
                            <span className="stat-label">Active Tasks</span>
                            <span className="stat-value">0</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress" style={{width: '0%'}}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
