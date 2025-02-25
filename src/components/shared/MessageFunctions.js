// Create a shared utility file for common messaging functions
import { collection, addDoc, serverTimestamp, doc, setDoc, orderBy, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export const createNewChat = async (sender, recipient) => {
    try {
        // Create new chat document with complete user details
        const chatRef = await addDoc(collection(db, 'chats'), {
            participants: [sender.uid, recipient.uid],
            participantDetails: {
                [sender.uid]: {
                    fullName: sender.fullName,
                    role: sender.role,
                    email: sender.email,
                    isOnline: true
                },
                [recipient.uid]: {
                    fullName: recipient.fullName,
                    role: recipient.role,
                    email: recipient.email,
                    isOnline: false
                }
            },
            lastMessage: '',
            lastMessageTime: serverTimestamp(),
            createdAt: serverTimestamp()
        });

        // Return the new chat data
        return {
            id: chatRef.id,
            participants: [sender.uid, recipient.uid],
            participantDetails: {
                [sender.uid]: {
                    fullName: sender.fullName,
                    role: sender.role,
                    email: sender.email
                },
                [recipient.uid]: {
                    fullName: recipient.fullName,
                    role: recipient.role,
                    email: recipient.email
                }
            },
            lastMessage: '',
            lastMessageTime: serverTimestamp(),
            createdAt: serverTimestamp()
        };
    } catch (error) {
        console.error('Error creating new chat:', error);
        throw error;
    }
};

export const sendMessage = async (chatId, sender, content) => {
    try {
        // Add message to subcollection
        const messageRef = await addDoc(collection(db, 'chats', chatId, 'messages'), {
            content,
            senderId: sender.uid,
            senderName: sender.fullName,
            senderRole: sender.role,
            timestamp: serverTimestamp()
        });

        // Update chat document with last message
        await updateDoc(doc(db, 'chats', chatId), {
            lastMessage: content,
            lastMessageTime: serverTimestamp()
        });

        return messageRef.id;
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