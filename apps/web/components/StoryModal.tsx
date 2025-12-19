import { useEffect, useState } from 'react';
import { Trash2, X } from 'lucide-react';

interface Story {
    id: string;
    url: string;
    type: 'image' | 'video';
    createdAt: string;
}

interface User {
    id: string;
    name: string;
    photoUrl?: string;
    avatar_url?: string;
    full_name?: string;
}

interface StoryModalProps {
    stories: Story[];
    initialIndex: number;
    user: User;
    currentUser: any;
    onClose: () => void;
    onDelete: (storyId: string) => void;
}

const StoryModal = ({ stories, initialIndex, user, onClose, currentUser, onDelete }: StoryModalProps) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [progress, setProgress] = useState(0);
    const story = stories[currentIndex];

    // Auto-advance Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100;
                return prev + 1;
            });
        }, 40); // Slightly faster for smoother feel

        return () => clearInterval(timer);
    }, [currentIndex]); // Restart timer on index change

    // Handle Story Completion
    useEffect(() => {
        if (progress >= 100) {
            if (currentIndex < stories.length - 1) {
                setCurrentIndex((prev: number) => prev + 1);
                setProgress(0); // Reset progress immediately for next story
            } else {
                onClose();
            }
        }
    }, [progress, currentIndex, stories.length, onClose]);

    if (!story) return null;

    return (
        <div className="fixed inset-0 z-[80] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
            {/* Header */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 text-white">
                <div className="flex items-center gap-3">
                    <img src={user.photoUrl || user.avatar_url} className="w-10 h-10 rounded-full border border-white/50" alt="" />
                    <span className="font-bold">{user.name || user.full_name}</span>
                    <span className="text-sm opacity-70">• {new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex gap-4">
                    {user.id === currentUser?.id && (
                        <button onClick={() => onDelete(story.id)} className="p-2 hover:bg-white/20 rounded-full"><Trash2 size={20} /></button>
                    )}
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Progress Bars */}
            <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
                {stories.map((s: any, idx: number) => (
                    <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-white transition-all linear duration-75`}
                            style={{
                                width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="relative w-full h-full max-w-lg bg-black flex items-center justify-center">
                {story.type === 'video' ? (
                    <video
                        src={story.url}
                        className="w-full h-full object-contain"
                        autoPlay
                        muted={false} // Allow sound?
                    />
                ) : (
                    <img src={story.url} className="w-full h-full object-contain" alt="" />
                )}

                {/* Navigation Tap Zones */}
                <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={() => currentIndex > 0 && setCurrentIndex((p: number) => p - 1)}></div>
                <div className="absolute inset-y-0 right-0 w-1/3 z-10" onClick={() => currentIndex < stories.length - 1 ? setCurrentIndex((p: number) => p + 1) : onClose()}></div>
            </div>
        </div>
    );
};

export default StoryModal;
