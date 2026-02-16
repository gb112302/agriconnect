import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ENDPOINT = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:5000';

function Chat() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const scrollRef = useRef();

    useEffect(() => {
        const newSocket = io(ENDPOINT, {
            query: { token: localStorage.getItem('token') }
        });
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('messageReceived', (message) => {
                if (currentChat && currentChat._id === message.chatId) {
                    setMessages(prev => [...prev, message]);
                }
                // Refresh conversations to show unread count or sorting
                fetchConversations();
            });
        }
    }, [socket, currentChat]);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        if (currentChat) {
            fetchMessages(currentChat._id);
            // Join chat room
            socket?.emit('joinChat', currentChat._id);
        }
    }, [currentChat]);

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const res = await axios.get(`${ENDPOINT}/api/chat/conversations`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setConversations(res.data);
        } catch (err) {
            console.error('Failed to load conversations', err);
        }
    };

    const fetchMessages = async (chatId) => {
        try {
            const res = await axios.get(`${ENDPOINT}/api/chat/${chatId}/messages`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMessages(res.data);
        } catch (err) {
            console.error('Failed to load messages', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const messagePayload = {
            chatId: currentChat._id,
            content: newMessage,
            receiverId: currentChat.participants.find(p => p._id !== user._id)._id
        };

        try {
            const res = await axios.post(`${ENDPOINT}/api/chat/send`, messagePayload, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            // Socket emit is handled by backend broadcasting, but we can also optimistically update
            // For now relying on backend response/socket for consistency
            setMessages([...messages, res.data]);
            setNewMessage('');
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 h-screen max-h-[800px] flex gap-4">
            {/* Conversations List */}
            <div className="w-1/3 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                <div className="p-4 border-b bg-gray-50">
                    <h2 className="text-xl font-bold">Messages</h2>
                </div>
                <div className="overflow-y-auto flex-grow">
                    {conversations.map(conv => {
                        const otherUser = conv.participants.find(p => p._id !== user._id);
                        return (
                            <div
                                key={conv._id}
                                onClick={() => setCurrentChat(conv)}
                                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${currentChat?._id === conv._id ? 'bg-indigo-50' : ''}`}
                            >
                                <div className="font-semibold">{otherUser?.name}</div>
                                <div className="text-sm text-gray-500 truncate">
                                    {conv.lastMessage?.content || 'Start a conversation'}
                                </div>
                            </div>
                        );
                    })}
                    {conversations.length === 0 && (
                        <div className="p-4 text-center text-gray-500">No conversations yet</div>
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div className="w-2/3 bg-white rounded-lg shadow-md flex flex-col">
                {currentChat ? (
                    <>
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <span className="font-bold text-lg">
                                {currentChat.participants.find(p => p._id !== user._id)?.name}
                            </span>
                        </div>

                        <div className="flex-grow p-4 overflow-y-auto bg-gray-100 space-y-4">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    ref={index === messages.length - 1 ? scrollRef : null}
                                    className={`flex ${msg.sender === user._id ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] p-3 rounded-lg shadow-sm ${msg.sender === user._id
                                                ? 'bg-indigo-600 text-white rounded-br-none'
                                                : 'bg-white text-gray-800 rounded-bl-none'
                                            }`}
                                    >
                                        <p>{msg.content}</p>
                                        <p className={`text-xs mt-1 text-right ${msg.sender === user._id ? 'text-indigo-200' : 'text-gray-400'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-grow border rounded-full px-4 py-2 focus:outline-none focus:border-indigo-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-indigo-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 transform rotate-90">
                                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-500 flex-col">
                        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                        <p className="text-xl">Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chat;
