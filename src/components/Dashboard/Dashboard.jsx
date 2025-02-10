import Sidebar from '../SideBar/SideBar';
import "./Dashboard.css";

const Dashboard = () => {
  const subjects = [
    { name: "TLE", color: "#E3F2FD", icon: "engineering", progress: "85%" },
    { name: "Science", color: "#E8F5E9", icon: "science", progress: "72%" },
    { name: "Computer", color: "#FFF3E0", icon: "computer", progress: "90%" },
    { name: "CLE", color: "#F3E5F5", icon: "menu_book", progress: "68%" },
    { name: "English", color: "#E1F5FE", icon: "translate", progress: "75%" },
    { name: "Filipino", color: "#FBE9E7", icon: "history_edu", progress: "88%" },
    { name: "Math", color: "#F1F8E9", icon: "calculate", progress: "70%" },
    { name: "AP", color: "#FFF8E1", icon: "public", progress: "82%" },
    { name: "MAPEH", color: "#E0F7FA", icon: "sports_soccer", progress: "95%" }
  ];

  const deadlines = [
    { date: "Jan 30, 2024", assignments: [
      { name: "TLE: Research Paper Draft", color: "#E3F2FD", type: "Assignment", status: "Pending" },
      { name: "Math: Problem Set 6", color: "#F1F8E9", type: "Quiz", status: "Urgent" }
    ]},
    { date: "Feb 14, 2024", assignments: [
      { name: "Science: Lab Report", color: "#E8F5E9", type: "Project", status: "Upcoming" },
      { name: "MAPEH: Performance Task", color: "#E0F7FA", type: "Activity", status: "Upcoming" }
    ]}
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-wrapper">
        <div className="dashboard-header">
          <div className="header-left">
            <h1>DASHBOARD</h1>
            <p className="semester-info">1st Semester AY 2023-2024</p>
          </div>
          <div className="header-right">
            <div className="section-dropdown">
              <span className="material-symbols-outlined">school</span>
              Grade 10 - STA
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="subjects-grid">
            {subjects.map((subject, index) => (
              <div 
                key={index}
                className="subject-card"
                style={{ backgroundColor: subject.color }}
              >
                <div className="subject-icon">
                  <span className="material-symbols-outlined">{subject.icon}</span>
                </div>
                <div className="subject-info">
                  <span className="subject-name">{subject.name}</span>
                  <div className="progress-bar">
                    <div 
                      className="progress" 
                      style={{ width: subject.progress }}
                    ></div>
                  </div>
                  <span className="progress-text">{subject.progress} Complete</span>
                </div>
              </div>
            ))}
          </div>

          <div className="deadline-section">
            <div className="deadline-header">
              <h2>
                <span className="material-symbols-outlined">event_upcoming</span>
                Upcoming Deadlines
              </h2>
              <button className="view-all">View All</button>
            </div>
            <div className="deadline-container">
              {deadlines.map((deadline, index) => (
                <div key={index} className="deadline-group">
                  <h3 className="deadline-date">
                    <span className="material-symbols-outlined">calendar_today</span>
                    {deadline.date}
                  </h3>
                  {deadline.assignments.map((assignment, aIndex) => (
                    <div 
                      key={aIndex}
                      className="deadline-card"
                      style={{ borderLeft: `4px solid ${assignment.color}` }}
                    >
                      <div className="assignment-header">
                        <span className="assignment-type">{assignment.type}</span>
                        <span className={`status-badge ${assignment.status.toLowerCase()}`}>
                          {assignment.status}
                        </span>
                      </div>
                      <div className="assignment-title">{assignment.name}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
