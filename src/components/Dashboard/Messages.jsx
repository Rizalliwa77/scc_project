import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy, updateDoc, doc } from 'firebase/firestore';
import Sidebar from '../SideBar/Sidebar';
import { createNewChat, sendMessage } from '../shared/MessageFunctions';
import './Messages.css';

function Messages() {
    const [activeTab, setActiveTab] = useState('personal');
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState([]);
    const [availableTeachers, setAvailableTeachers] = useState([]);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [currentUserData, setCurrentUserData] = useState(null);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);

    useEffect(() => {
        if (!auth.currentUser) return;

        // Fetch users from the sign-in document
        const signInRef = doc(db, 'sign-in', '1qo1S53fQK4y4HT8GFrS');
        
        const unsubscribe = onSnapshot(signInRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                
                // Get current user data
                Object.entries(data).forEach(([uid, userData]) => {
                    if (userData.email === auth.currentUser.email) {
                        setCurrentUserData({
                            ...userData,
                            uid: uid
                        });
                    }
                });
                
                // Filter and separate teachers and students
                const teachers = [];
                const students = [];
                
                Object.entries(data).forEach(([uid, userData]) => {
                    // Skip current user
                    if (userData.email === auth.currentUser.email) return;
                    
                    const userInfo = {
                        uid,
                        fullName: userData.fullName || 'Unknown User',
                        role: userData.role,
                        email: userData.email,
                        lastActive: new Date().toISOString()
                    };

                    if (userData.role === 'teacher') {
                        teachers.push(userInfo);
                    } else if (userData.role === 'student') {
                        students.push(userInfo);
                    }
                });
                
                setAvailableTeachers(teachers);
                setAvailableStudents(students);
                setFilteredTeachers(teachers);
                setFilteredStudents(students);
            }
        });

        // Fetch existing chats
        const chatsQuery = query(
            collection(db, 'chats'),
            where('participants', 'array-contains', auth.currentUser.uid)
        );

        const chatsUnsubscribe = onSnapshot(chatsQuery, (snapshot) => {
            const chatsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setChats(chatsList);
        });

        return () => {
            unsubscribe();
            chatsUnsubscribe();
        };
    }, []);

    useEffect(() => {
        if (!selectedChat) return;

        const messagesQuery = query(
            collection(db, 'chats', selectedChat.id, 'messages'),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const messagesList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(messagesList);
        });

        return () => unsubscribe();
    }, [selectedChat]);

    useEffect(() => {
        const filteredTeachers = availableTeachers.filter(teacher =>
            teacher.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const filteredStudents = availableStudents.filter(student =>
            student.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        setFilteredTeachers(filteredTeachers);
        setFilteredStudents(filteredStudents);
    }, [searchQuery, availableTeachers, availableStudents]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat || !currentUserData) return;

        try {
            await sendMessage(selectedChat.id, {
                uid: auth.currentUser.uid,
                fullName: currentUserData.fullName || 'Unknown User',
                role: currentUserData.role
            }, newMessage.trim());
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const startNewChat = async (recipient) => {
        if (!currentUserData) return;

        try {
            const existingChat = chats.find(chat => 
                chat.participants.includes(recipient.uid)
            );

            if (existingChat) {
                setSelectedChat(existingChat);
                setShowNewMessageModal(false);
                return;
            }

            const newChat = await createNewChat(
                {
                    uid: auth.currentUser.uid,
                    fullName: currentUserData.fullName,
                    role: currentUserData.role,
                    email: currentUserData.email
                },
                recipient
            );

            setSelectedChat(newChat);
            setShowNewMessageModal(false);
        } catch (error) {
            console.error('Error starting new chat:', error);
        }
    };

    const getRecipientDetails = (chat) => {
        if (!chat?.participants || !chat.participantDetails) return null;
        const recipientId = chat.participants.find(id => id !== auth.currentUser?.uid);
        return chat.participantDetails[recipientId];
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
                        </div>
                    </div>
                </div>

                <div className="messages-container">
                    <div className="personal-messages">
                        <div className="chats-list">
                            <div className="new-message-button">
                                <button onClick={() => setShowNewMessageModal(true)}>
                                    <span className="material-symbols-outlined">edit</span>
                                    New Message
                                </button>
                            </div>
                            {chats.map(chat => {
                                const recipient = getRecipientDetails(chat);
                                return (
                                    <div
                                        key={chat.id}
                                        className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
                                        onClick={() => setSelectedChat(chat)}
                                    >
                                        <div className="chat-info">
                                            <div className="recipient-header">
                                                <h3>{recipient?.fullName || 'Unknown User'}</h3>
                                                <span className={`status-indicator ${recipient?.isOnline ? 'online' : 'offline'}`} />
                                            </div>
                                            <p className="role">{recipient?.role || 'Unknown Role'}</p>
                                            <p className="last-message">{chat.lastMessage}</p>
                                        </div>
                                        <div className="chat-meta">
                                            <span className="timestamp">
                                                {chat.lastMessageTime?.toDate().toLocaleTimeString([], { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {selectedChat && (
                            <div className="chat-window">
                                <div className="chat-header">
                                    <div className="recipient-info">
                                        <h2>{getRecipientDetails(selectedChat)?.fullName}</h2>
                                        <div className="recipient-status">
                                            <span className={`status-indicator ${getRecipientDetails(selectedChat)?.isOnline ? 'online' : 'offline'}`} />
                                            <p>{getRecipientDetails(selectedChat)?.isOnline ? 'Online' : 'Offline'}</p>
                                        </div>
                                        <p className="role">{getRecipientDetails(selectedChat)?.role}</p>
                                    </div>
                                </div>
                                <div className="messages-list">
                                    {messages.map(message => (
                                        <div 
                                            key={message.id}
                                            className={`message ${message.senderId === auth.currentUser.uid ? 'sent' : 'received'}`}
                                        >
                                            <div className="message-content">
                                                {message.senderId !== auth.currentUser.uid && (
                                                    <div className="message-sender">{message.senderName}</div>
                                                )}
                                                <div className="message-bubble">
                                                    {message.content}
                                                </div>
                                                <div className="message-time">
                                                    {message.timestamp?.toDate().toLocaleTimeString([], { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </div>
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
                </div>

                {showNewMessageModal && (
                    <div className="modal-overlay" onClick={() => setShowNewMessageModal(false)}>
                        <div className="new-message-modal" onClick={e => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>New Message</h2>
                                <button className="close-button" onClick={() => setShowNewMessageModal(false)}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div className="search-box">
                                <span className="material-symbols-outlined">search</span>
                                <input
                                    type="text"
                                    placeholder="Search for users..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="contacts-section">
                                <div className="section-title">Teachers</div>
                                <div className="contacts-list">
                                    {filteredTeachers.length > 0 ? (
                                        filteredTeachers.map(teacher => (
                                            <div
                                                key={teacher.uid}
                                                className="contact-item"
                                                onClick={() => startNewChat(teacher)}
                                            >
                                                <div className="contact-header">
                                                    <h4>{teacher.fullName}</h4>
                                                </div>
                                                <p className="contact-role">{teacher.role}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-contacts">
                                            <p>No teachers found</p>
                                        </div>
                                    )}
                                </div>

                                <div className="section-divider" />

                                <div className="section-title">Students</div>
                                <div className="contacts-list">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map(student => (
                                            <div
                                                key={student.uid}
                                                className="contact-item"
                                                onClick={() => startNewChat(student)}
                                            >
                                                <div className="contact-header">
                                                    <h4>{student.fullName}</h4>
                                                </div>
                                                <p className="contact-role">{student.role}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-contacts">
                                            <p>No students found</p>
                                        </div>
                                    )}
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
