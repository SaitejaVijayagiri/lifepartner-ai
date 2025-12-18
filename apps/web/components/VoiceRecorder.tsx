'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Play, Save, Trash2, CheckCircle } from 'lucide-react';

interface VoiceRecorderProps {
    onRecordingComplete: (audioBlob: Blob) => void;
    existingAudioUrl?: string;
}

export default function VoiceRecorder({ onRecordingComplete, existingAudioUrl }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
    const [duration, setDuration] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Audio Playback
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                onRecordingComplete(blob);

                // Cleanup stream
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setDuration(0);

            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Microphone access denied. Please enable permission.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const deleteRecording = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setDuration(0);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/50">
            {/* Display State */}
            {!audioUrl && !isRecording && (
                <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mx-auto mb-2 text-indigo-600">
                        <Mic size={32} />
                    </div>
                    <h3 className="font-semibold text-gray-800">Record Voice Bio</h3>
                    <p className="text-xs text-gray-500">Introduce yourself in 30 seconds</p>
                </div>
            )}

            {/* Recording State */}
            {isRecording && (
                <div className="flex flex-col items-center animate-pulse mb-4">
                    <div className="text-red-500 font-mono text-xl font-bold mb-2">
                        {formatTime(duration)} / 0:30
                    </div>
                    <div className="flex gap-1 h-8 items-end">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`w-1 bg-indigo-500 rounded-full animate-bounce`} style={{ height: Math.random() * 20 + 10 + 'px', animationDelay: `${i * 0.1}s` }}></div>
                        ))}
                    </div>
                </div>
            )}

            {/* Playback State */}
            {audioUrl && !isRecording && (
                <div className="w-full max-w-xs mb-4">
                    <audio ref={audioRef} src={audioUrl} controls className="w-full h-10" />
                </div>
            )}

            {/* Controls */}
            <div className="flex gap-4">
                {!isRecording && !audioUrl && (
                    <Button onClick={startRecording} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full w-40">
                        Start Recording
                    </Button>
                )}

                {isRecording && (
                    <Button onClick={stopRecording} variant="destructive" className="rounded-full w-40 animate-pulse">
                        <Square size={16} className="mr-2 fill-current" /> Stop
                    </Button>
                )}

                {audioUrl && (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={deleteRecording} className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200">
                            <Trash2 size={16} />
                        </Button>
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-200 text-sm font-medium">
                            <CheckCircle size={16} /> Recorded
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
