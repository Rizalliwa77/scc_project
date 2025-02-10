import React, { useState } from 'react';
import './Workloads.css';
import Sidebar from '../SideBar/SideBar';

function Workloads() {
    const [selectedSubject, setSelectedSubject] = useState('All');
    const [selectedTask, setSelectedTask] = useState(null);

    const subjects = [
        'All', 'TLE', 'Math', 'Science', 'English', 'Filipino', 'AP', 'ESP', 'MAPEH'
    ];

    const workloadCards = [
        { 
            id: 1, 
            title: 'Research Paper: Sustainable Technology',
            status: 'Ongoing',
            subject: 'TLE',
            dueDate: 'Jan 31, 2025 (FRIDAY)',
            type: 'Project',
            quarter: '3rd Quarter',
            about: 'Research and write a comprehensive paper about sustainable technology solutions. The paper should include:\n\n1. Introduction to sustainable technology\n2. Current trends and innovations\n3. Impact on society and environment\n4. Future prospects and recommendations\n\nRequirements:\n- Minimum of 2000 words\n- APA format\n- At least 5 credible sources\n- Include diagrams and illustrations'
        },
        { 
            id: 2, 
            title: 'Mathematical Models in Real Life',
            status: 'Ongoing',
            subject: 'Math',
            dueDate: 'Feb 5, 2024 (MONDAY)',
            type: 'Project',
            quarter: '3rd Quarter',
            about: 'Create a portfolio of mathematical models found in everyday situations. Topics to cover:\n\n1. Linear equations in business\n2. Geometric patterns in architecture\n3. Statistical analysis of local data\n4. Probability in games\n\nDeliverables:\n- Digital presentation\n- Written analysis\n- Real-world examples\n- Practical applications'
        },
        { 
            id: 3, 
            title: 'Ecosystem Case Study',
            status: 'Scheduled',
            subject: 'Science',
            dueDate: 'Feb 10, 2024 (SATURDAY)',
            type: 'Research',
            quarter: '3rd Quarter',
            about: 'Conduct a detailed case study of a local ecosystem. The study should include:\n\n1. Biodiversity assessment\n2. Environmental factors analysis\n3. Human impact evaluation\n4. Conservation recommendations\n\nExpected Output:\n- Field research documentation\n- Photo documentation\n- Data analysis\n- Presentation of findings'
        },
        { 
            id: 4, 
            title: 'Literary Analysis Essay',
            status: 'Completed',
            subject: 'English',
            dueDate: 'Feb 15, 2024 (THURSDAY)',
            type: 'Essay',
            quarter: '3rd Quarter',
            about: 'Write an analytical essay on the assigned novel. Focus areas:\n\n1. Theme analysis\n2. Character development\n3. Literary devices used\n4. Historical context\n\nGuidelines:\n- 1500-2000 words\n- MLA format\n- Include textual evidence\n- Critical analysis of major themes'
        },
        { 
            id: 5, 
            title: 'Filipino Literature Review',
            status: 'Ongoing',
            subject: 'Filipino',
            dueDate: 'Feb 20, 2024 (TUESDAY)',
            type: 'Assignment',
            quarter: '3rd Quarter',
            about: 'Gumawa ng komprehensibong pagsusuri ng mga piling akdang pampanitikan:\n\n1. Maikling kuwento\n2. Tula\n3. Dula\n4. Nobela\n\nKinakailangan:\n- Pagsusuri ng tema\n- Pagtalakay ng mga tauhan\n- Kontekstong pangkasaysayan\n- Personal na interpretasyon'
        },
        { 
            id: 6, 
            title: 'Cultural Performance',
            status: 'Scheduled',
            subject: 'MAPEH',
            dueDate: 'Feb 25, 2024 (SUNDAY)',
            type: 'Performance',
            quarter: '3rd Quarter',
            about: 'Prepare and perform a cultural presentation. Requirements include:\n\n1. Traditional dance or music\n2. Historical background research\n3. Costume design\n4. Group choreography\n\nDeliverables:\n- Live performance\n- Written documentation\n- Cultural significance analysis\n- Practice documentation'
        },
        { 
            id: 7, 
            title: 'Historical Site Analysis',
            status: 'Scheduled',
            subject: 'AP',
            dueDate: 'Mar 1, 2024 (FRIDAY)',
            type: 'Research',
            quarter: '3rd Quarter',
            about: 'Conduct a comprehensive analysis of a local historical site:\n\n1. Historical significance\n2. Cultural impact\n3. Present condition\n4. Preservation efforts\n\nRequired outputs:\n- Documentary video\n- Written report\n- Photo documentation\n- Interviews with local historians'
        },
        { 
            id: 8, 
            title: 'Values Formation Project',
            status: 'Scheduled',
            subject: 'ESP',
            dueDate: 'Mar 5, 2024 (TUESDAY)',
            type: 'Project',
            quarter: '3rd Quarter',
            about: 'Develop and implement a community values formation project:\n\n1. Needs assessment\n2. Program development\n3. Implementation strategy\n4. Impact evaluation\n\nDeliverables:\n- Project proposal\n- Implementation documentation\n- Reflection paper\n- Community feedback report'
        }
    ];

    const handleSubjectChange = (event) => {
        setSelectedSubject(event.target.value);
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
    };

    const handleCloseModal = () => {
        setSelectedTask(null);
    };

    // Filter workloads based on selected subject
    const filteredWorkloads = selectedSubject === 'All' 
        ? workloadCards 
        : workloadCards.filter(card => card.subject === selectedSubject);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-wrapper">
                <div className="dashboard-header">
                    <div className="header-left">
                        <h1>WORKLOADS</h1>
                        <p className="semester-info">1st Semester AY 2023-2024</p>
                    </div>
                    <div className="header-right">
                        <div className="section-dropdown">
                            <span className="material-symbols-outlined">school</span>
                            <select 
                                value={selectedSubject} 
                                onChange={handleSubjectChange}
                                className="subject-select"
                            >
                                {subjects.map((subject) => (
                                    <option key={subject} value={subject}>
                                        {subject}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="dashboard-content">
                    <div className="workloads-grid">
                        {filteredWorkloads.map((card) => (
                            <div 
                                key={card.id} 
                                className="workload-card"
                                onClick={() => handleTaskClick(card)}
                            >
                                <div className="card-header">
                                    <span className="subject-tag">{card.subject}</span>
                                    <span className={`status-badge ${card.status.toLowerCase()}`}>
                                        {card.status}
                                    </span>
                                </div>
                                <div className="card-content">
                                    <h3>{card.title}</h3>
                                    <p>Due: {card.dueDate}</p>
                                </div>
                                <div className="card-footer">
                                    <span className="due-date">
                                        <span className="material-symbols-outlined">calendar_today</span>
                                        {card.type}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Task Detail Modal */}
            {selectedTask && (
                <div className="task-modal-overlay" onClick={handleCloseModal}>
                    <div className="task-modal" onClick={e => e.stopPropagation()}>
                        <div className="task-modal-header">
                            <h2>{selectedTask.title}</h2>
                            <div className="task-tags">
                                <span className="task-tag">{selectedTask.type}</span>
                                <span className="task-tag">{selectedTask.quarter}</span>
                            </div>
                            <div className="task-deadline">
                                DEADLINE: {selectedTask.dueDate}
                            </div>
                        </div>
                        <div className="task-modal-content">
                            <h3>ABOUT:</h3>
                            <p>{selectedTask.about}</p>
                            <h3>STATUS:</h3>
                            <div className={`status-badge ${selectedTask.status.toLowerCase()}`}>
                                {selectedTask.status}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Workloads;
