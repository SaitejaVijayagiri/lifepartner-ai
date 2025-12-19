import { Button } from '@/components/ui/button';
import { MessageCircle, Trash2, X } from 'lucide-react';

interface ConnectionsModalProps {
    connections: any[];
    onClose: () => void;
    onDelete: (id: string) => void;
    onChat: (conn: any) => void;
}

const ConnectionsModal = ({ connections, onClose, onDelete, onChat }: ConnectionsModalProps) => {
    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900">Manage Connections</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="overflow-y-auto p-4 space-y-3 flex-1">
                    {connections.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No connections yet.</div>
                    ) : (
                        connections.map((c: any) => (
                            <div key={c.interactionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <img src={c.partner.photoUrl} className="w-12 h-12 rounded-full object-cover border border-white shadow-sm" alt="" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{c.partner.name}</h4>
                                        <p className="text-xs text-gray-500">{c.partner.role || 'Member'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-indigo-600 hover:bg-indigo-50" onClick={() => onChat(c)}>
                                        <MessageCircle size={16} />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                                        onClick={() => onDelete(c.interactionId)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <Button className="w-full" onClick={onClose}>Done</Button>
                </div>
            </div>
        </div>
    );
};

export default ConnectionsModal;
