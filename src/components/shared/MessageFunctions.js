// Create a shared utility file for common messaging functions
import { collection, addDoc, serverTimestamp, doc, setDoc, orderBy, query, where, getDocs, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export const createNewChat = async (currentUser, recipient) => {
    try {
        // Check if chat already exists
        const chatsRef = collection(db, 'chats');
        const chatData = {
            participants: [currentUser.uid, recipient.uid],
            participantDetails: {
                [currentUser.uid]: {
                    fullName: currentUser.fullName,
                    role: currentUser.role,
                    email: currentUser.email,
                    isOnline: true
                },
                [recipient.uid]: {
                    fullName: recipient.fullName,
                    role: recipient.role,
                    email: recipient.email,
                    isOnline: false
                }
            },
            createdAt: serverTimestamp(),
            lastMessage: '',
            lastMessageTime: serverTimestamp()
        };

        const chatDoc = await addDoc(chatsRef, chatData);
        
        // Create initial system message
        await addDoc(collection(db, 'chats', chatDoc.id, 'messages'), {
            content: 'Chat started',
            senderId: 'system',
            senderName: 'System',
            timestamp: serverTimestamp()
        });

        return {
            id: chatDoc.id,
            ...chatData
        };
    } catch (error) {
        console.error('Error creating chat:', error);
        throw error;
    }
};

export const sendMessage = async (chatId, sender, content) => {
    try {
        const chatRef = doc(db, 'chats', chatId);
        const chatDoc = await getDoc(chatRef);

        if (!chatDoc.exists()) {
            throw new Error('Chat does not exist');
        }

        // Add message to subcollection
        const messageData = {
            content,
            senderId: sender.uid,
            senderName: sender.fullName,
            senderRole: sender.role,
            timestamp: serverTimestamp()
        };

        await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

        // Update chat document with last message
        await updateDoc(chatRef, {
            lastMessage: content,
            lastMessageTime: serverTimestamp()
        });

        return true;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

export const fetchAvailableUsers = async (currentUserRole) => {
    try {
        const messagingRef = doc(db, 'messagingFunctionality', 'availableMessage');
        const docSnap = await getDoc(messagingRef);

        if (!docSnap.exists()) {
            return [];
        }

        const data = docSnap.data();
        return Object.entries(data)
            .filter(([_, userData]) => {
                // If current user is student, show only teachers
                if (currentUserRole === 'student') {
                    return userData.role === 'teacher';
                }
                // If current user is teacher, show only students
                return userData.role === 'student';
            })
            .map(([uid, userData]) => ({
                uid,
                fullName: userData.fullName,
                role: userData.role,
                lastActive: userData.lastActive
            }));
    } catch (error) {
        console.error('Error fetching available users:', error);
        return [];
    }
};

const startNewChat = async (recipient) => {
    if (!currentUserData) return;

    try {
        // Check for existing chat
        const existingChat = chats.find(chat => 
            chat.participants.includes(recipient.uid)
        );

        if (existingChat) {
            setSelectedChat(existingChat);
            setShowNewMessageModal(false);
            return;
        }

        // Create new chat with proper user details
        const newChat = await createNewChat(
            {
                uid: auth.currentUser.uid,
                fullName: currentUserData.fullName,
                role: currentUserData.role,
                email: currentUserData.email
            },
            {
                uid: recipient.uid,
                fullName: recipient.fullName,
                role: recipient.role,
                email: recipient.email
            }
        );

        setSelectedChat(newChat);
        setShowNewMessageModal(false);
    } catch (error) {
        console.error('Error starting new chat:', error);
    }
};

const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !currentUserData) return;

    try {
        await sendMessage(selectedChat.id, {
            uid: auth.currentUser.uid,
            fullName: currentUserData.fullName,
            role: currentUserData.role
        }, newMessage.trim());
        setNewMessage('');
    } catch (error) {
        console.error('Error sending message:', error);
    }
};

// Optional: Add online/offline status handling
export const updateUserStatus = async (chatId, userId, isOnline) => {
    try {
        const chatRef = doc(db, 'chats', chatId);
        await updateDoc(chatRef, {
            [`participantDetails.${userId}.isOnline`]: isOnline
        });
    } catch (error) {
        console.error('Error updating user status:', error);
    }
}; 