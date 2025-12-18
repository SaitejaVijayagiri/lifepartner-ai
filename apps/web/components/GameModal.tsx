'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

/* 
    GAME LOGIC:
    1. Start Game -> "Waiting for partner..." (Mock: auto-join)
    2. Question Loop (5 Qs) -> "Mountains or Beach?"
    3. Results -> "80% Match! Winner!"
*/

export default function GameModal({ onClose, partnerName }: { onClose: () => void; partnerName: string }) {
    // State: 'intro' | 'playing' | 'results'
    const [status, setStatus] = useState('intro');
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [myScore, setMyScore] = useState(0);
    const [gameId, setGameId] = useState('');
    const [showMatchAnimation, setShowMatchAnimation] = useState(false);

    // Start Game Effect
    useEffect(() => {
        let mounted = true;
        const startGame = async () => {
            try {
                // Wait for effect to settle
                await new Promise(r => setTimeout(r, 1500));
                if (!mounted) return;

                const res = await (api as any).games.start(partnerName); // partnerName used as ID for mock
                if (res.success) {
                    setGameId(res.gameId);
                    setQuestions(res.questions);
                    setStatus('playing');
                }
            } catch (e) {
                console.error("Game start failed", e);
            }
        };
        startGame();
        return () => { mounted = false; };
    }, []);

    const handleAnswer = async (optionIndex: number) => {
        // Optimistic UI update
        setShowMatchAnimation(false);

        try {
            const currentQ = questions[currentQIndex];
            const res = await (api as any).games.submitAnswer(gameId, currentQ.id, optionIndex, "ME"); // "ME" mock ID

            // Check match (mock logic done on server, returned here)
            const isMatch = res.partnerChoice === optionIndex;
            if (isMatch) {
                setMyScore(s => s + 1);
                setShowMatchAnimation(true);
            }

            // Next Question Delay
            setTimeout(() => {
                setShowMatchAnimation(false);
                if (currentQIndex < questions.length - 1) {
                    setCurrentQIndex(prev => prev + 1);
                } else {
                    setStatus('results');
                }
            }, 1500);

        } catch (e) {
            console.error("Answer failed", e);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative min-h-[500px] flex flex-col">

                {/* Close Button */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">✕</button>

                {/* STATUS: INTRO */}
                {status === 'intro' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6">
                        <div className="text-6xl animate-bounce">🧩</div>
                        <h2 className="text-2xl font-bold text-gray-900">Vibe Check</h2>
                        <p className="text-gray-500">Waiting for {partnerName} to join...</p>
                        <div className="w-full max-w-xs bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 animate-[loading_2s_ease-in-out_infinite] w-1/2"></div>
                        </div>
                    </div>
                )}

                {/* STATUS: PLAYING */}
                {status === 'playing' && questions.length > 0 && (
                    <div className="flex-1 flex flex-col p-8">
                        {/* Header */}
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-sm font-bold text-indigo-600">Q{currentQIndex + 1}/{questions.length}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full">Matches: {myScore}</span>
                            </div>
                        </div>

                        {/* Question */}
                        <div className="flex-1 flex flex-col items-center justify-center text-center mb-8 relative">
                            {/* Match Animation Overlay */}
                            {showMatchAnimation && (
                                <div className="absolute inset-0 z-20 flex items-center justify-center animate-in zoom-in fade-in duration-300">
                                    <span className="text-6xl drop-shadow-lg">✨ Match!</span>
                                </div>
                            )}

                            <h3 className="text-2xl font-bold text-gray-900 mb-8">{questions[currentQIndex].text}</h3>

                            <div className="grid w-full gap-4">
                                {questions[currentQIndex].options.map((opt: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        className="p-4 rounded-xl border-2 border-indigo-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all font-medium text-lg text-left flex justify-between items-center group"
                                    >
                                        {opt}
                                        <span className="opacity-0 group-hover:opacity-100 text-indigo-500">➜</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="text-center text-xs text-gray-400">
                            {partnerName} is answering...
                        </div>
                    </div>
                )}

                {/* STATUS: RESULTS */}
                {status === 'results' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                        <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-5xl mb-4 border-4 border-white/30 shadow-xl">
                            {myScore / questions.length * 100}%
                        </div>
                        <h2 className="text-3xl font-bold">Compatibility Score</h2>
                        <p className="text-indigo-100 text-lg">
                            You and {partnerName} have great vibes! <br />
                            {myScore >= 3 ? "It's a Match! 🔥" : "Opposites Attract? 🤔"}
                        </p>
                        <Button
                            onClick={onClose}
                            className="bg-white text-indigo-600 hover:bg-gray-100 w-full font-bold shadow-lg"
                        >
                            Back to Chat
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

