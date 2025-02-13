import React, { useState } from 'react';
import TeacherSidebar from '../SideBar/tSideBar'; // Fixed Import
import './tMessages.css';

function TeacherMessages() {
    const [activeTab, setActiveTab] = useState('messages');
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [showNewAnnouncementModal, setShowNewAnnouncementModal] = useState(false);
    const [selectedClass, setSelectedClass] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const classes = [
        { id: 'all', name: 'All Classes' },
        { id: 'g10sta', name: 'Grade 10 - STA' },
        { id: 'g10stb', name: 'Grade 10 - STB' },
        { id: 'g9svf', name: 'Grade 9 - SVF' }
    ];

    const chats = [
        {
            id: 1,
            student: {
                name: "Juan Dela Cruz",
                class: "Grade 10 - STA",
                avatar: "JD"
            },
            lastMessage: "Good morning po, about po sa research paper...",
            timestamp: "10:30 AM",
            unread: 2,
            messages: [
                { id: 1, sender: "student", content: "Good morning po, about po sa research paper...", time: "10:30 AM" },
                { id: 2, sender: "teacher", content: "Yes, what about it?", time: "10:35 AM" }
            ]
        },
    ];

    const announcements = [
        {
            id: 1,
            title: "Research Paper Guidelines",
            content: "Dear students, I've uploaded the detailed guidelines...",
            class: "Grade 10 - STA",
            date: "Jan 25, 2024",
            status: "Active",
            recipients: 45,
            views: 40
        },
    ];

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        setNewMessage('');
    };

    const handleCreateAnnouncement = () => {
        setShowNewAnnouncementModal(true);
    };

    return (
        <div className="dashboard-layout">
            <TeacherSidebar /> {/* Fixed Component Usage */}
            <div className="dashboard-wrapper">
                <div className="messages-container">
                    <div className="messages-header">
                        <div className="header-tabs">
                            <button 
                                className={`tab-button ${activeTab === 'messages' ? 'active' : ''}`}
                                onClick={() => setActiveTab('messages')}
                            >
                                Messages
                            </button>
                            <button 
                                className={`tab-button ${activeTab === 'announcements' ? 'active' : ''}`}
                                onClick={() => setActiveTab('announcements')}
                            >
                                Announcements
                            </button>
                        </div>
                        <div className="header-actions">
                            <select 
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="class-select"
                            >
                                {classes.map(cls => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </select>
                            {activeTab === 'announcements' && (
                                <button 
                                    className="create-announcement-btn"
                                    onClick={handleCreateAnnouncement}
                                >
                                    <span className="material-symbols-outlined">add_circle</span>
                                    New Announcement
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="messages-content">
                        {activeTab === 'messages' ? (
                            <div className="messages-layout">
                                <div className="chats-list">
                                    <div className="search-box">
                                        <span className="material-symbols-outlined">search</span>
                                        <input
                                            type="text"
                                            placeholder="Search messages..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    {chats.map(chat => (
                                        <div 
                                            key={chat.id}
                                            className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                                            onClick={() => setSelectedChat(chat)}
                                        >
                                            <div className="chat-avatar">{chat.student.avatar}</div>
                                            <div className="chat-info">
                                                <div className="chat-header">
                                                    <h4>{chat.student.name}</h4>
                                                    <span className="chat-time">{chat.timestamp}</span>
                                                </div>
                                                <p className="chat-preview">{chat.lastMessage}</p>
                                                <span className="student-class">{chat.student.class}</span>
                                            </div>
                                            {chat.unread > 0 && (
                                                <span className="unread-badge">{chat.unread}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {selectedChat ? (
                                    <div className="chat-window">
                                        <div className="chat-header">
                                            <div className="chat-user-info">
                                                <h3>{selectedChat.student.name}</h3>
                                                <span className="student-class">
                                                    {selectedChat.student.class}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="messages-list">
                                            {selectedChat.messages.map(message => (
                                                <div 
                                                    key={message.id}
                                                    className={`message ${message.sender}`}
                                                >
                                                    <div className="message-content">
                                                        <p>{message.content}</p>
                                                        <span className="message-time">
                                                            {message.time}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <form className="message-input" onSubmit={handleSendMessage}>
                                            <input
                                                type="text"
                                                placeholder="Type a message..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                            />
                                            <button type="submit">
                                                <span className="material-symbols-outlined">send</span>
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="no-chat-selected">
                                        <span className="material-symbols-outlined">chat</span>
                                        <p>Select a conversation to start messaging</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="announcements-section">
                                {announcements.map(announcement => (
                                    <div key={announcement.id} className="announcement-card">
                                        <div className="announcement-header">
                                            <h3>{announcement.title}</h3>
                                        </div>
                                        <p className="announcement-content">{announcement.content}</p>
                                        <div className="announcement-footer">
                                            <div className="announcement-meta">
                                                <span className="class-tag">{announcement.class}</span>
                                                <span className="date">{announcement.date}</span>
                                            </div>
                                            <div className="announcement-stats">
                                                <span className="views">
                                                    <span className="material-symbols-outlined">visibility</span>
                                                    {announcement.views}/{announcement.recipients}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showNewAnnouncementModal && (
                <AnnouncementModal onClose={() => setShowNewAnnouncementModal(false)} />
            )}
        </div>
    );
}

function AnnouncementModal({ onClose }) {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        class: '',
        priority: 'normal'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="announcement-modal">
                <div className="modal-header">
                    <h2>Create New Announcement</h2>
                    <button onClick={onClose}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    {/* Add form fields */}
                </form>
            </div>
        </div>
    );
}

export default TeacherMessages;
