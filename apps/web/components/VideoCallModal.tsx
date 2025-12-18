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
    incomingCall?: { signal: any, from: string }; // If answering
}

export default function VideoCallModal({ connectionId, partner, onEndCall, incomingCall }: VideoCallModalProps) {
    const socket = useSocket();
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [status, setStatus] = useState("Initializing...");

    // Refs
    const myVideo = useRef<HTMLVideoElement>(null);
    const userVideo = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<SimplePeer.Instance | null>(null);

    useEffect(() => {
        // 1. Get User Media
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (myVideo.current) {
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
                setStatus("Camera Error: " + err.message);
            });

        // Socket Listeners
        if (socket) {
            socket.on("callAccepted", (signal) => {
                setCallAccepted(true);
                setStatus("Connected");
                connectionRef.current?.signal(signal);
            });

            socket.on("callEnded", () => {
                leaveCall();
            });

            // REVENUE PROTECTION: Listen for Gating Errors
            socket.on("callError", (data) => {
                alert(data.message || "Call Failed");
                leaveCall(); // Close modal
            });
        }

        return () => {
            // Cleanup on unmount
            leaveCall();
            socket?.off("callError");
        }
    }, []);

    // INITIATE CALL
    const callUser = (currentStream: MediaStream) => {
        setStatus(`Calling ${partner.name}...`);

        const peer = new SimplePeer({
            initiator: true,
            trickle: false,
            stream: currentStream
        });

        peer.on("signal", (data) => {
            if (socket) {
                // Send Offer to Partner via Socket
                // We use partner.id as the room name
                const myId = localStorage.getItem('userId');
                if (!myId) {
                    alert("Please log in again.");
                    onEndCall();
                    return;
                }

                socket.emit("callUser", {
                    userToCall: partner.id,
                    signalData: data,
                    from: myId, // REVENUE PROTECTION: Send real ID for DB check
                    name: "Me"
                });
            }
        });

        peer.on("stream", (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        connectionRef.current = peer;
    };

    // ANSWER CALL
    const answerCall = (currentStream: MediaStream) => {
        setCallAccepted(true);
        setStatus("Connected");

        const peer = new SimplePeer({
            initiator: false,
            trickle: false,
            stream: currentStream
        });

        peer.on("signal", (data) => {
            if (socket) {
                socket.emit("answerCall", { signal: data, to: incomingCall!.from });
            }
        });

        peer.on("stream", (currentStream) => {
            if (userVideo.current) {
                userVideo.current.srcObject = currentStream;
            }
        });

        // Accept the offer
        peer.signal(incomingCall!.signal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        connectionRef.current?.destroy();
        onEndCall();
    };

    const [showGiftModal, setShowGiftModal] = useState(false);

    return (
        <div className="fixed inset-0 z-50 bg-black flex overflow-hidden">
            {/* Left: Main Video Area */}
            <div className="flex-1 relative bg-gray-900 flex flex-col">
                <div className="flex-1 relative overflow-hidden flex items-center justify-center">

                    {/* Remote Video (Full Screen) */}
                    {callAccepted && !callEnded ? (
                        <video
                            ref={userVideo}
                            playsInline
                            autoPlay
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        // Placeholder / Status
                        <div className="text-center text-white">
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-indigo-500 mx-auto mb-6 animate-pulse p-1">
                                <img src={partner.photoUrl} className="w-full h-full object-cover" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">{status}</h2>
                            <p className="text-gray-400">Waiting for response...</p>
                        </div>
                    )}

                    {/* Self View (PiP) */}
                    {stream && (
                        <div className="absolute top-4 left-4 w-40 h-56 bg-black rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl z-20">
                            <video
                                ref={myVideo}
                                autoPlay
                                muted
                                playsInline
                                className="w-full h-full object-cover transform scale-x-[-1]"
                            />
                        </div>
                    )}
                </div>

                {/* Bottom Controls */}
                <div className="h-24 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-6 z-20">
                    <button className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-white text-2xl shadow-lg transform hover:scale-105 transition-all" onClick={leaveCall}>
                        📞
                    </button>
                </div>
            </div>

            {/* Right: Chat Sidebar */}
            <div className="w-96 bg-white border-l border-gray-800 flex flex-col h-full z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
                <ChatWindow
                    connectionId={connectionId}
                    partner={partner}
                    className="flex-1 flex flex-col h-full"
                    isCallMode={true}
                />
            </div>
        </div>
    );
}
