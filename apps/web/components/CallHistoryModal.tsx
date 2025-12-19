
import { useEffect, useState } from 'react';
import { Phone, Video, X, Clock, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { api } from '@/lib/api';

interface CallHistoryModalProps {
    onClose: () => void;
}

export default function CallHistoryModal({ onClose }: CallHistoryModalProps) {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.calls?.getHistory().then((data: any) => {
            setLogs(data);
        }).catch((err: any) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const formatDuration = (seconds: number) => {
        if (!seconds) return '0s';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                        <Clock size={20} className="text-indigo-600" /> Call History
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto p-2 flex-1 space-y-2">
                    {loading ? (
                        <div className="text-center py-10 text-gray-400">Loading history...</div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">No calls yet.</div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={log.otherPhoto} className="w-10 h-10 rounded-full object-cover bg-gray-200" alt="" />
                                        <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white border border-gray-100 ${log.type === 'VIDEO' ? 'text-indigo-600' : 'text-green-600'
                                            }`}>
                                            {log.type === 'VIDEO' ? <Video size={12} /> : <Phone size={12} />}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{log.otherName}</h4>
                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                            {log.isCaller ? (
                                                <ArrowUpRight size={12} className="text-green-500" />
                                            ) : (
                                                <ArrowDownLeft size={12} className="text-blue-500" />
                                            )}
                                            <span>
                                                {new Date(log.startedAt).toLocaleDateString()} • {new Date(log.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-700">{formatDuration(log.duration)}</p>
                                    <p className={`text-xs capitalize ${log.status === 'MISSED' ? 'text-red-500' : 'text-gray-400'
                                        }`}>{log.status.toLowerCase()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
