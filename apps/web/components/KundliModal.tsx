
interface KundliModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        score: number;
        total: number;
        details: any[];
    };
    names: { me: string, partner: string };
}

export default function KundliModal({ isOpen, onClose, data, names }: KundliModalProps) {
    if (!isOpen) return null;

    const percentage = Math.round((data.score / data.total) * 100);
    let verdict = "Excellent";
    let color = "text-green-600";
    if (data.score < 18) { verdict = "Not Recommended"; color = "text-red-500"; }
    else if (data.score < 24) { verdict = "Average"; color = "text-yellow-600"; }


    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 slide-in-from-bottom-10"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-orange-50 p-6 text-center border-b border-orange-100">
                    <div className="text-4xl mb-2">🕉️</div>
                    <h2 className="text-2xl font-bold text-gray-800 font-serif">Vedic Compatibility</h2>
                    <p className="text-sm text-gray-500">{names.me} & {names.partner}</p>
                </div>

                {/* Score Circle */}
                <div className="p-8 flex flex-col items-center">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        {/* Circular Progress (CSS Svg) */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="70" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                            <circle
                                cx="80" cy="80" r="70"
                                stroke={data.score < 18 ? '#ef4444' : data.score < 24 ? '#eab308' : '#16a34a'}
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray="440"
                                strokeDashoffset={440 - (440 * percentage) / 100}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className={`text-4xl font-bold ${color}`}>{data.score}</span>
                            <span className="text-xs text-gray-400 font-medium">OUT OF 36</span>
                        </div>
                    </div>

                    <div className={`mt-4 px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider ${color} bg-opacity-10 bg-current`}>
                        {verdict} Match
                    </div>
                </div>

                {/* Breakdown List */}
                <div className="px-6 pb-6 max-h-60 overflow-y-auto">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b pb-2">Guna Milan Details</h3>
                    <div className="space-y-3">
                        {data.details.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-700">{item.name}</span>
                                    {item.v1 && <span className="text-xs text-gray-400">{item.v1} vs {item.v2}</span>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${item.s === item.t ? 'bg-green-500' : item.s === 0 ? 'bg-red-500' : 'bg-yellow-500'}`}
                                            style={{ width: `${(item.s / item.t) * 100}%` }}
                                        />
                                    </div>
                                    <span className="font-bold text-gray-900 w-8 text-right">{item.s}/{item.t}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 text-center">
                    <p className="text-xs text-gray-400 italic">
                        *Compatibility is based on Nakshatra & moon sign analysis.
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
