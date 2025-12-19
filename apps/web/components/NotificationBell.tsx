'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check } from 'lucide-react';
import { useSocket } from '@/context/SocketContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';

export const NotificationBell = () => {
    const { socket } = useSocket() as any;
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: any) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch Initial
    const fetchNotifications = async () => {
        try {
            const res = await api.notifications.getAll();
            if (res) {
                setNotifications(res.notifications);
                setUnreadCount(res.unreadCount);
            }
        } catch (e) {
            console.error("Failed to fetch notifications", e);
        }
    };

    useEffect(() => {
        fetchNotifications();

        if (socket) {
            const handleNewNotification = (data: any) => {
                // console.log("🔔 New Notification:", data);
                // Add to list, increment unread
                setNotifications((prev: any[]) => [data, ...prev]);
                setUnreadCount((prev: number) => prev + 1);
            };

            socket.on('notification:new', handleNewNotification);
            return () => {
                socket.off('notification:new', handleNewNotification);
            };
        }
    }, [socket]);

    const markRead = async (id: string) => {
        try {
            await api.notifications.markRead(id);
            setNotifications((prev: any[]) => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount((prev: number) => Math.max(0, prev - 1));
        } catch (e) { }
    };

    const markAllRead = async () => {
        try {
            await api.notifications.markAllRead();
            setNotifications((prev: any[]) => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (e) { }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50"
            >
                <Bell size={24} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm border border-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto overflow-x-hidden">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400">
                                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((n, i) => {
                                    const dateStr = n.created_at || n.timestamp;
                                    const dateObj = dateStr ? new Date(dateStr) : new Date();
                                    const isValidDate = !isNaN(dateObj.getTime());

                                    return (
                                        <div
                                            key={n.id || i}
                                            className={`p-4 hover:bg-gray-50 transition-colors flex gap-3 ${!n.is_read ? 'bg-indigo-50/30' : ''}`}
                                            onClick={() => n.id && !n.is_read && markRead(n.id)}
                                        >
                                            <div className={`
                                                mt-1 w-2 h-2 rounded-full flex-shrink-0
                                                ${!n.is_read ? 'bg-indigo-500' : 'bg-transparent'}
                                            `} />
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-800 leading-relaxed">
                                                    {n.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {isValidDate ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    {' · '}
                                                    {isValidDate ? dateObj.toLocaleDateString() : ''}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                    <div className="p-2 border-t border-gray-50 bg-gray-50/30 text-center">
                        <p className="text-xs text-gray-400">Real-time updates active</p>
                    </div>
                </div>
            )}
        </div>
    );
};
