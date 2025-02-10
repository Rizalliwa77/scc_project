import React, { useState } from 'react';
import './Messages.css';
import Sidebar from '../SideBar/SideBar';

function Messages() {
    const [activeTab, setActiveTab] = useState('personal');
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [selectedRecipient, setSelectedRecipient] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Sample data for personal messages
    const personalChats = [
        {
            id: 1,
            name: "Ms. Santos",
            role: "TLE Teacher",
            lastMessage: "Please submit your research paper by Friday.",
            timestamp: "10:30 AM",
            unread: 2,
            messages: [
                { id: 1, sender: "Ms. Santos", content: "Good morning! How's your research paper going?", time: "9:15 AM" },
                { id: 2, sender: "Ms. Santos", content: "Please submit your research paper by Friday.", time: "10:30 AM" },
            ]
        },
        {
            id: 2,
            name: "Mr. Reyes",
            role: "Math Teacher",
            lastMessage: "The quiz will be on Monday.",
            timestamp: "Yesterday",
            unread: 0,
            messages: [
                { id: 1, sender: "Mr. Reyes", content: "Don't forget to review Chapter 5.", time: "Yesterday" },
                { id: 2, sender: "Mr. Reyes", content: "The quiz will be on Monday.", time: "Yesterday" },
            ]
        }
    ];

    // Sample data for school announcements
    const announcements = [
        {
            id: 1,
            title: "Foundation Week 2024",
            sender: "School Administration",
            date: "Jan 25, 2024",
            content: "Dear Students,\n\nWe are excited to announce our upcoming Foundation Week celebration from February 12-16, 2024. Here are the planned activities:\n\n1. Monday - Opening Ceremony\n2. Tuesday - Academic Competitions\n3. Wednesday - Sports Festival\n4. Thursday - Cultural Show\n5. Friday - Thanksgiving Mass\n\nPlease coordinate with your class advisers for more details.",
            priority: "high"
        },
        {
            id: 2,
            title: "Schedule of Midterm Examinations",
            sender: "Academic Office",
            date: "Jan 23, 2024",
            content: "The Midterm Examinations will be conducted from February 5-9, 2024. The detailed schedule will be posted in your respective Google Classrooms.",
            priority: "high"
        },
        {
            id: 3,
            title: "Library Update: New Online Resources",
            sender: "Library Services",
            date: "Jan 20, 2024",
            content: "We have added new online research databases accessible through the school portal. Visit the library for orientation on how to access these resources.",
            priority: "normal"
        }
    ];

    // Sample data for available contacts
    const availableContacts = {
        teachers: [
            { id: 1, name: "Ms. Santos", role: "TLE Teacher" },
            { id: 2, name: "Mr. Reyes", role: "Math Teacher" },
            { id: 3, name: "Mrs. Cruz", role: "Science Teacher" },
            { id: 4, name: "Mr. Garcia", role: "English Teacher" }
        ],
        classmates: [
            { id: 5, name: "Juan Dela Cruz", role: "Classmate - 10 STA" },
            { id: 6, name: "Maria Santos", role: "Classmate - 10 STA" },
            { id: 7, name: "Pedro Penduko", role: "Classmate - 10 STA" },
            { id: 8, name: "Ana Reyes", role: "Classmate - 10 STA" }
        ]
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const updatedChats = personalChats.map(chat => {
            if (chat.id === selectedChat.id) {
                return {
                    ...chat,
                    messages: [...chat.messages, {
                        id: chat.messages.length + 1,
                        sender: "You",
                        content: newMessage,
                        time: "Just now"
                    }]
                };
            }
            return chat;
        });

        // Update the chats state here
        setNewMessage('');
    };

    const handleNewMessage = () => {
        setShowNewMessageModal(true);
    };

    const handleSelectRecipient = (contact) => {
        setSelectedRecipient(contact);
        // Check if chat already exists
        const existingChat = personalChats.find(chat => chat.name === contact.name);
        if (existingChat) {
            setSelectedChat(existingChat);
        } else {
            // Create new chat
            const newChat = {
                id: Date.now(),
                name: contact.name,
                role: contact.role,
                lastMessage: "",
                timestamp: "Just now",
                unread: 0,
                messages: []
            };
            // Add new chat to personalChats
            setSelectedChat(newChat);
        }
        setShowNewMessageModal(false);
    };

    const filteredContacts = {
        teachers: availableContacts.teachers.filter(contact =>
            contact.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        classmates: availableContacts.classmates.filter(contact =>
            contact.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <div className="dashboard-wrapper">
                <div className="dashboard-header">
                    <div className="header-left">
                        <h1>MESSAGES</h1>
                        <p className="semester-info">1st Semester AY 2023-2024</p>
                    </div>
                    <div className="header-right">
                        <div className="message-tabs">
                            <button 
                                className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
                                onClick={() => setActiveTab('personal')}
                            >
                                Personal Messages
                            </button>
                            <button 
                                className={`tab-button ${activeTab === 'announcements' ? 'active' : ''}`}
                                onClick={() => setActiveTab('announcements')}
                            >
                                School Announcements
                            </button>
                        </div>
                    </div>
                </div>

                <div className="messages-container">
                    {activeTab === 'personal' ? (
                        <div className="personal-messages">
                            <div className="chats-list">
                                <div className="new-message-button">
                                    <button onClick={handleNewMessage}>
                                        <span className="material-symbols-outlined">edit</span>
                                        New Message
                                    </button>
                                </div>
                                {personalChats.map(chat => (
                                    <div 
                                        key={chat.id}
                                        className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                                        onClick={() => setSelectedChat(chat)}
                                    >
                                        <div className="chat-info">
                                            <h3>{chat.name}</h3>
                                            <p className="role">{chat.role}</p>
                                            <p className="last-message">{chat.lastMessage}</p>
                                        </div>
                                        <div className="chat-meta">
                                            <span className="timestamp">{chat.timestamp}</span>
                                            {chat.unread > 0 && (
                                                <span className="unread-badge">{chat.unread}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {selectedChat && (
                                <div className="chat-window">
                                    <div className="chat-header">
                                        <h2>{selectedChat.name}</h2>
                                        <p className="role">{selectedChat.role}</p>
                                    </div>
                                    <div className="messages-list">
                                        {selectedChat.messages.map(message => (
                                            <div 
                                                key={message.id}
                                                className={`message ${message.sender === 'You' ? 'sent' : 'received'}`}
                                            >
                                                <div className="message-content">
                                                    {message.sender !== 'You' && (
                                                        <div className="message-sender">{message.sender}</div>
                                                    )}
                                                    <div className="message-bubble">
                                                        {message.content}
                                                    </div>
                                                    <div className="message-time">{message.time}</div>
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
                            )}
                        </div>
                    ) : (
                        <div className="announcements-list">
                            {announcements.map(announcement => (
                                <div 
                                    key={announcement.id}
                                    className={`announcement-card priority-${announcement.priority}`}
                                >
                                    <div className="announcement-header">
                                        <h3>{announcement.title}</h3>
                                        <span className="announcement-date">{announcement.date}</span>
                                    </div>
                                    <p className="announcement-sender">From: {announcement.sender}</p>
                                    <div className="announcement-content">
                                        <p>{announcement.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* New Message Modal */}
                {showNewMessageModal && (
                    <div className="modal-overlay" onClick={() => setShowNewMessageModal(false)}>
                        <div className="new-message-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>New Message</h2>
                                <button 
                                    className="close-button"
                                    onClick={() => setShowNewMessageModal(false)}
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="search-box">
                                <span className="material-symbols-outlined">search</span>
                                <input
                                    type="text"
                                    placeholder="Search for teachers or classmates..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="contacts-list">
                                <div className="contacts-section">
                                    <h3>Teachers</h3>
                                    {filteredContacts.teachers.map(contact => (
                                        <div
                                            key={contact.id}
                                            className="contact-item"
                                            onClick={() => handleSelectRecipient(contact)}
                                        >
                                            <h4>{contact.name}</h4>
                                            <p>{contact.role}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="contacts-section">
                                    <h3>Classmates</h3>
                                    {filteredContacts.classmates.map(contact => (
                                        <div
                                            key={contact.id}
                                            className="contact-item"
                                            onClick={() => handleSelectRecipient(contact)}
                                        >
                                            <h4>{contact.name}</h4>
                                            <p>{contact.role}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Messages;
