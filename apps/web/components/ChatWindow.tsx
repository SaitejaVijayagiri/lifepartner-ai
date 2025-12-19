'use client';

import { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import GameModal from './GameModal';
import { useSocket } from '@/context/SocketContext';
import { Sparkles, Video, Phone } from 'lucide-react';

interface ChatWindowProps {
    connectionId: string;
    partner: {
        id: string;
        name: string;
        photoUrl: string;
        role?: string;
    };
    onClose?: () => void;
    onVideoCall?: () => void;
    onAudioCall?: () => void;
    className?: string; // For custom positioning
    isCallMode?: boolean; // To alter UI for video calls
}

export default function ChatWindow({ connectionId, partner, onClose, onVideoCall, onAudioCall, className, isCallMode = false }: ChatWindowProps) {
    const socket = useSocket();
    const [messages, setMessages] = useState<any[]>([]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const [showGame, setShowGame] = useState(false);

    // AI Wingman State
    const [loadingAi, setLoadingAi] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

    const handleIcebreaker = async () => {
        setLoadingAi(true);
        try {
            const res = await api.ai.getIcebreaker(partner.id);
            if (res.suggestions) {
                setAiSuggestions(res.suggestions);
            }
        } catch (e) {
            console.error("AI Error", e);
        } finally {
            setLoadingAi(false);
        }
    };

    // Initial Load
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const history = await api.chat.getHistory(connectionId);
                setMessages(history);
            } catch (e) { console.error(e); }
        };
        loadHistory();
    }, [connectionId]);

    // Socket Listeners
    useEffect(() => {
        if (!socket) return;

        socket.on("receiveMessage", (newMsg) => {
            // Only append if it's from this partner
            if (newMsg.senderId === partner.id || newMsg.senderId === 'me') { // 'me' check for self-echo if needed
                setMessages(prev => [...prev, newMsg]);
                setIsTyping(false);
            }
        });

        socket.on("typing", (data) => {
            if (data.from === partner.id) {
                setIsTyping(true);
                // Auto-clear typing after 3s
                setTimeout(() => setIsTyping(false), 3000);
            }
        });

        return () => {
            socket.off("receiveMessage");
            socket.off("typing");
        };
    }, [socket, partner.id]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputText.trim()) return;

        const text = inputText;
        setInputText(""); // Optimistic clear

        // Optimistic UI update
        const tempMsg = {
            id: 'temp-' + Date.now(),
            text,
            senderId: 'me',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            // 1. Send to Backend API (Persistence)
            await api.chat.sendMessage(connectionId, text, 'me');

            // 2. Emit Socket Event (Real-time to Partner)
            if (socket) {
                socket.emit("sendMessage", {
                    to: partner.id,
                    text,
                    from: "me" // In real app, server validates token
                });
            }
        } catch (err) {
            console.error("Send failed", err);
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e.target.value);
        if (socket) {
            socket.emit("typing", { to: partner.id, from: "me" });
        }
    };

    return (
        <div className={className || "fixed bottom-0 right-0 w-full h-[80vh] md:bottom-4 md:right-4 md:w-96 md:h-[500px] bg-white md:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden z-40 animate-in slide-in-from-bottom duration-300"}>
            {/* Header */}
            {!isCallMode && (
                <div className="p-4 bg-indigo-600 text-white flex justify-between items-center shadow-md">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img src={partner.photoUrl} alt={partner.name} className="w-10 h-10 rounded-full border-2 border-white/50 object-cover" />
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border border-indigo-600"></div>
                        </div>
                        <div>
                            <h3 className="font-bold leading-tight">{partner.name}</h3>
                            <p className="text-xs text-indigo-200">{partner.role || "Online"}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <button
                            onClick={() => {
                                setShowGame(true);
                            }}
                            className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full hover:bg-purple-200 transition-colors font-bold border border-purple-200 whitespace-nowrap shadow-sm"
                        >
                            🎲 Play Game
                        </button>
                        <button onClick={onVideoCall} className="p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-full transition-colors" title="Video Call">
                            <Video size={20} />
                        </button>
                        <button onClick={onAudioCall} className="p-2 text-gray-500 hover:bg-green-50 hover:text-green-600 rounded-full transition-colors" title="Audio Call">
                            <Phone size={18} />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-xl leading-none">
                            ×
                        </button>
                    </div>
                </div>
            )}

            {/* In Call Mode Header (Minimal) */}
            {isCallMode && (
                <div className="p-3 bg-gray-100 border-b flex justify-between items-center">
                    <span className="font-bold text-gray-700">Chat</span>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm mt-10">
                        <p>Say hello to {partner.name}! 👋</p>
                    </div>
                )}
                {messages.map((msg, idx) => {
                    const isMe = msg.senderId === 'me' || msg.senderId === undefined; // Hacky 'me' check
                    return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            {!isMe && (
                                <img src={partner.photoUrl} className="w-6 h-6 rounded-full mr-2 self-end mb-1" />
                            )}
                            <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${isMe
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                }`}>
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <img src={partner.photoUrl} className="w-6 h-6 rounded-full mr-2 self-end mb-1" />
                        <div className="bg-white px-4 py-2 rounded-2xl border border-gray-200 rounded-bl-none">
                            <div className="flex gap-1 h-4 items-center">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* AI Icebreaker Suggestions */}
            {aiSuggestions.length > 0 && (
                <div className="p-2 bg-indigo-50 border-t border-indigo-100 animate-in slide-in-from-bottom flex flex-col gap-2">
                    <p className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                        <Sparkles size={12} /> AI Suggestions
                        <button onClick={() => setAiSuggestions([])} className="ml-auto text-gray-400 hover:text-gray-600">×</button>
                    </p>
                    <div className="flex flex-col gap-2">
                        {aiSuggestions.map((suggestion, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setInputText(suggestion);
                                    setAiSuggestions([]);
                                }}
                                className="text-left text-sm bg-white border border-indigo-100 p-2 rounded-lg hover:bg-indigo-100 transition-colors text-gray-700 shadow-sm"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Message Input */}
            <form
                onSubmit={e => {
                    e.preventDefault();
                    handleSend(e);
                }}
                className="p-3 border-t bg-gray-50 flex gap-2 items-center"
            >
                <div className="relative group">
                    <button
                        type="button"
                        onClick={handleIcebreaker}
                        disabled={loadingAi}
                        className="p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-colors disabled:opacity-50"
                        title="AI Wingman"
                    >
                        {loadingAi ? <Sparkles size={20} className="animate-spin" /> : <Sparkles size={20} />}
                    </button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-0 mb-2 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        Ask AI for Help
                    </div>
                </div>

                <input
                    type="text"
                    value={inputText}
                    onChange={handleInput}
                    placeholder="Type a message..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button type="submit" disabled={!inputText.trim()} className="bg-indigo-600 text-white rounded-full px-4 py-2 hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium transition-colors">
                    Send
                </button>
            </form>

            {showGame && (
                <GameModal
                    onClose={() => setShowGame(false)}
                    partnerName={partner.name}
                />
            )}
        </div>
    );
}
