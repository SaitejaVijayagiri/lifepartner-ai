
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { api } from './api';

export const Notifications = {
    init: async () => {
        if (!Capacitor.isNativePlatform()) {
            // console.log("Push Notifications: Web Platform (Skipping)");
            return;
        }

        try {
            // 1. Request Permissions
            const result = await PushNotifications.requestPermissions();
            if (result.receive === 'granted') {
                // 2. Register
                await PushNotifications.register();
            } else {
                console.warn("Push Notifications: Permission denied");
            }
        } catch (e) {
            console.error("Push Init Error", e);
        }
    },

    setupListeners: () => {
        if (!Capacitor.isNativePlatform()) return;

        // On Registration Success
        PushNotifications.addListener('registration', (token) => {
            console.log('Push Registration Success:', token.value);
            // Send to Backend
            api.notifications.register(token.value, Capacitor.getPlatform());
        });

        // On Registration Error
        PushNotifications.addListener('registrationError', (error) => {
            console.error('Push Registration Error:', error);
        });

        // On Receive (Foreground)
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('Push Received:', notification);
            // toast(notification.title || "New Notification"); // Removed to avoid dependency
        });

        // On Action (Tap)
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
            console.log('Push Action:', notification);
            // Navigate if needed (e.g. notification.data.url)
            if (notification.notification.data.url) {
                window.location.href = notification.notification.data.url;
            }
        });
    }
};
