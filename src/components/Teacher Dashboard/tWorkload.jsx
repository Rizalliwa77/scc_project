import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import TeacherSidebar from '../../components/SideBar/tSideBar'; // Fixed import path
import WorkloadModal from './WorkloadModal';
import './tWorkload.css';

function TeacherWorkload() {
    const [workloads, setWorkloads] = useState([]);
    const [selectedClass, setSelectedClass] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [selectedWorkload, setSelectedWorkload] = useState(null);
    const [modalMode, setModalMode] = useState('create');
    const [loading, setLoading] = useState(true);

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

    const handleCreate = (newWorkload) => {
        setWorkloads([newWorkload, ...workloads]);
    };

    const handleUpdate = (updatedWorkload) => {
        setWorkloads(workloads.map(w => 
            w.id === updatedWorkload.id ? updatedWorkload : w
        ));
    };

    const handleDelete = (workloadId) => {
        setWorkloads(workloads.filter(w => w.id !== workloadId));
    };

    const filteredWorkloads = selectedClass === 'All' 
        ? workloads 
        : workloads.filter(workload => workload.class === selectedClass);

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

                    {loading ? (
                        <div className="loading">Loading workloads...</div>
                    ) : filteredWorkloads.length === 0 ? (
                        <div className="no-workloads">
                            <p>No workloads available for the selected class</p>
                        </div>
                    ) : (
                        <div className="workloads-grid">
                            {filteredWorkloads.map((workload) => (
                                <div key={workload.id} className={`workload-card ${workload.type}`}>
                                    <div className="workload-card-header">
                                        <h3>{workload.title}</h3>
                                        <button 
                                            className="edit-button"
                                            onClick={() => handleEditClick(workload)}
                                        >
                                            <span className="material-symbols-outlined">edit</span>
                                        </button>
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
                            ))}
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
            </div>
        </div>
    );
}

export default TeacherWorkload;
