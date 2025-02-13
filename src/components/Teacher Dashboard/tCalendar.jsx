import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import Sidebar from '../SideBar/tSideBar';
import './tCalendar.css';

function TeacherCalendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const assignmentsSnapshot = await getDocs(collection(db, 'assignments'));
                const projectsSnapshot = await getDocs(collection(db, 'projects'));

                const assignmentEvents = assignmentsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    type: 'Assignment'
                }));

                const projectEvents = projectsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    type: 'Project'
                }));

                setEvents([...assignmentEvents, ...projectEvents]);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching events:", error);
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div className="calendar-container">
            <Sidebar />
            <div className="calendar-content">
                <div className="calendar-header">
                    <h1>Academic Calendar</h1>
                    <div className="calendar-actions">
                        <select className="month-select">
                            <option value="1">January</option>
                            <option value="2">February</option>
                            <option value="3">March</option>
                            <option value="4">April</option>
                            <option value="5">May</option>
                            <option value="6">June</option>
                            <option value="7">July</option>
                            <option value="8">August</option>
                            <option value="9">September</option>
                            <option value="10">October</option>
                            <option value="11">November</option>
                            <option value="12">December</option>
                        </select>
                        <button className="today-btn">Today</button>
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Loading calendar events...</div>
                ) : (
                    <div className="calendar-grid">
                        {/* Calendar implementation will go here */}
                        <div className="events-list">
                            {events.map((event) => (
                                <div key={event.id} className={`event-card ${event.type.toLowerCase()}`}>
                                    <div className="event-header">
                                        <span className="event-type">{event.type}</span>
                                        <span className="event-date">{event.dueDate}</span>
                                    </div>
                                    <h3 className="event-title">{event.title}</h3>
                                    <p className="event-class">{event.class}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TeacherCalendar;
