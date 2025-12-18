import { useState, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

const ToastContext = {
    add: (message: string, type: ToastType) => { },
};

export const useToast = () => {
    return {
        success: (msg: string) => ToastContext.add(msg, 'success'),
        error: (msg: string) => ToastContext.add(msg, 'error'),
        info: (msg: string) => ToastContext.add(msg, 'info'),
    };
};

export function Toaster() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        ToastContext.add = (message, type) => {
            const id = Math.random().toString(36).substring(7);
            setToasts((prev) => [...prev, { id, message, type }]);
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 3000);
        };
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
                        min-w-[300px] bg-white border border-gray-100 shadow-lg rounded-lg p-4 flex items-center gap-3 transform animate-in slide-in-from-right duration-300 pointer-events-auto
                        ${toast.type === 'success' ? 'border-l-4 border-l-green-500' : ''}
                        ${toast.type === 'error' ? 'border-l-4 border-l-red-500' : ''}
                        ${toast.type === 'info' ? 'border-l-4 border-l-blue-500' : ''}
                    `}
                >
                    <div className="flex-1">
                        <p className={`text-sm font-semibold  ${toast.type === 'success' ? 'text-green-800' : toast.type === 'error' ? 'text-red-800' : 'text-gray-800'}`}>
                            {toast.type === 'success' && 'Success'}
                            {toast.type === 'error' && 'Error'}
                            {toast.type === 'info' && 'Info'}
                        </p>
                        <p className="text-sm text-gray-600">{toast.message}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
