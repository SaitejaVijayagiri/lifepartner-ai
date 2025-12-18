'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ChatPage({ params }: { params: { id: string } }) {
    // Mock Chat Data
    const [messages, setMessages] = useState([
        { id: 1, sender: 'them', text: 'I really think we should live in the minimal apartment downtown.' },
        { id: 2, sender: 'me', text: 'But I need space for my studio! That place is a shoebox.' },
        { id: 3, sender: 'them', text: 'You are being unreasonable. It saves us money.' },
        { id: 4, sender: 'ai', text: 'Mediator: I notice some tension about space vs finances. @Me, could you explain *why* the studio space is a value for you, rather than focusing on the apartment size?' }
    ]);
    const [input, setInput] = useState('');

    const sendMessage = () => {
        if (!input.trim()) return;
        setMessages([...messages, { id: Date.now(), sender: 'me', text: input }]);
        setInput('');
        // Simulate reply
        setTimeout(() => {
            setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'them', text: "I see your point, but..." }]);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 font-sans">
            <header className="bg-white p-4 shadow-sm border-b flex justify-between items-center">
                <h1 className="font-bold text-lg">Chat with Aarav</h1>
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    ● Secure & Encrypted
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'me'
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : msg.sender === 'ai'
                                        ? 'bg-amber-50 border border-amber-200 text-amber-900 w-full text-center italic'
                                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                                }`}
                        >
                            {msg.sender === 'ai' && <span className="block text-xs font-bold mb-1 not-italic">🤖 AI Mediator</span>}
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-white border-t">
                <div className="flex gap-2">
                    <Input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage}>Send</Button>
                </div>
            </div>
        </div>
    );
}
