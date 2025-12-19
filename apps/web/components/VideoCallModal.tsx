'use client';

import { Mic, MicOff, Video, VideoOff, PhoneOff, Gift } from 'lucide-react';
import GiftModal from './GiftModal';
import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import ChatWindow from './ChatWindow';
import SimplePeer from 'simple-peer'; // Requires 'npm install simple-peer'
import { useSocket } from '@/context/SocketContext';

interface VideoCallModalProps {
    connectionId: string;
    partner: {
        id: string;
        name: string;
        photoUrl: string;
        role?: string;
    };
    onEndCall: () => void;
    incomingCall?: { signal: any, from: string, type?: 'audio' | 'video' };
    mode?: 'audio' | 'video'; // New Prop
}

export default function VideoCallModal({ connectionId, partner, onEndCall, incomingCall, mode = 'video' }: VideoCallModalProps) {
    const socket = useSocket();
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [status, setStatus] = useState("Initializing...");
    const isVideo = mode === 'video' || incomingCall?.type === 'video';

    // Refs
    const myVideo = useRef<HTMLVideoElement>(null);
    const userVideo = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<SimplePeer.Instance | null>(null);

    useEffect(() => {
        // 1. Get User Media (Audio always true, Video depends on mode)
        navigator.mediaDevices.getUserMedia({ video: isVideo, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (myVideo.current && isVideo) {
                    myVideo.current.srcObject = currentStream;
                }

                // 2. Decide: Call or Answer?
                if (incomingCall) {
                    answerCall(currentStream);
                } else {
                    callUser(currentStream);
                }
            })
            .catch(err => {
                console.error("Failed to get media", err);
                setStatus("Microphone/Camera Error: " + err.message);
            });

        // Socket Listeners (unchanged...)
        if (socket) {
            socket.on("callAccepted", (signal) => {
                setCallAccepted(true);
                setStatus(isVideo ? "Connected" : "Audio Connected");
                connectionRef.current?.signal(signal);
            });
            socket.on("callEnded", () => leaveCall());
            socket.on("callError", (data) => { alert(data.message); leaveCall(); });
        }

        return () => {
            leaveCall();
            socket?.off("callError");
        }
    }, [isVideo]); // Re-run if mode changes

    const callUser = (currentStream: MediaStream) => {
        setStatus(`Calling ${partner.name}...`);
        const peer = new SimplePeer({ initiator: true, trickle: false, stream: currentStream });

        peer.on("signal", (data) => {
            if (socket) {
                const myId = localStorage.getItem('userId');
                socket.emit("callUser", {
                    userToCall: partner.id,
                    signalData: data,
                    from: myId,
                    name: "Me",
                    type: mode // Send type
                });
            }
        });

        peer.on("stream", (currentStream) => {
            if (userVideo.current && isVideo) {
                userVideo.current.srcObject = currentStream;
            }
        });

        connectionRef.current = peer;
    };

    const answerCall = (currentStream: MediaStream) => {
        setCallAccepted(true);
        setStatus("Connected");
        const peer = new SimplePeer({ initiator: false, trickle: false, stream: currentStream });

        peer.on("signal", (data) => {
            if (socket) socket.emit("answerCall", { signal: data, to: incomingCall!.from });
        });

        peer.on("stream", (currentStream) => {
            if (userVideo.current && isVideo) {
                userVideo.current.srcObject = currentStream;
            }
        });

        peer.signal(incomingCall!.signal);
        connectionRef.current = peer;
    };

    const leaveCall = async () => {
        setCallEnded(true);

        // Log Call (Fire and forget)
        try {
            // Need API to expose logging publicly or handle via socket?
            // Ideally backend logs on socket disconnect, but client side helps for now
            // Just ensure stream defaults are stopped
            stream?.getTracks().forEach(track => track.stop());
        } catch (e) { }

        connectionRef.current?.destroy();
        onEndCall();
    };

    const [showGiftModal, setShowGiftModal] = useState(false);

    return (
        <div className="fixed inset-0 z-50 bg-black flex overflow-hidden">
            {/* Left: Main Area */}
            <div className="flex-1 relative bg-gray-900 flex flex-col">
                <div className="flex-1 relative overflow-hidden flex items-center justify-center">

                    {/* Remote View */}
                    {callAccepted && !callEnded ? (
                        isVideo ? (
                            <video ref={userVideo} playsInline autoPlay className="w-full h-full object-cover" />
                        ) : (
                            // Audio Only UI
                            <div className="flex flex-col items-center justify-center animate-pulse">
                                <div className="w-40 h-40 rounded-full border-4 border-indigo-500 p-1 mb-6 relative">
                                    <img src={partner.photoUrl} className="w-full h-full rounded-full object-cover" />
                                    <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping"></div>
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">{partner.name}</h2>
                                <p className="text-indigo-300 font-medium">Audio Call Active</p>
                            </div>
                        )
                    ) : (
                        // Connecting UI
                        <div className="text-center text-white">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500 mx-auto mb-6 animate-pulse p-1">
                                <img src={partner.photoUrl} className="w-full h-full object-cover" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">{status}</h2>
                            <p className="text-gray-400">Waiting...</p>
                        </div>
                    )}

                    {/* Self View (Video Only) */}
                    {isVideo && stream && (
                        <div className="absolute top-4 left-4 w-40 h-56 bg-black rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl z-20">
                            <video ref={myVideo} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="h-24 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-6 z-20">
                    <button
                        className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-yellow-400 shadow-lg transition-all"
                        onClick={() => setShowGiftModal(true)}
                    >
                        <Gift size={24} />
                    </button>

                    <button className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white text-2xl shadow-lg transform hover:scale-105 transition-all" onClick={leaveCall}>
                        <PhoneOff size={28} />
                    </button>
                </div>
            </div>

            {/* Right: Chat Sidebar */}
            <div className="hidden md:flex w-96 bg-white border-l border-gray-800 flex-col h-full z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
                <ChatWindow
                    connectionId={connectionId}
                    partner={partner}
                    className="flex-1 flex flex-col h-full"
                    isCallMode={true}
                />
            </div>
            <GiftModal isOpen={showGiftModal} onClose={() => setShowGiftModal(false)} toUserId={partner.id} toUserName={partner.name} />
        </div>
    );
}
