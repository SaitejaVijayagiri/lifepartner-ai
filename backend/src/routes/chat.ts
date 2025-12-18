import express from 'express';
import { sanitizeContent } from '../utils/contentFilter';

const router = express.Router();

// Mock In-Memory Message Store
// Map<InteractionID, Message[]>
const MESSAGE_STORE: Record<string, any[]> = {};

router.get('/:connectionId/history', (req, res) => {
    const { connectionId } = req.params;
    const history = MESSAGE_STORE[connectionId] || [];
    res.json(history);
});

router.post('/:connectionId/send', (req, res) => {
    const { connectionId } = req.params;
    const { text, senderId } = req.body;

    if (!MESSAGE_STORE[connectionId]) {
        MESSAGE_STORE[connectionId] = [];
    }



    // ...

    // User Message
    const cleanText = sanitizeContent(text);

    const userMsg = {
        id: Date.now().toString(),
        text: cleanText,
        senderId,
        timestamp: new Date()
    };
    MESSAGE_STORE[connectionId].push(userMsg);

    // AI / Mock Auto-Reply (Simulate the other person)
    // Delay slightly for realism
    setTimeout(() => {
        const replies = [
            "That sounds interesting! Tell me more.",
            "I totally agree with you.",
            "Haha, that's funny!",
            "I'm looking for something serious too.",
            "My family is very important to me.",
            "Do you like traveling?",
            "I work in IT, it's pretty busy but I love it."
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        const replyMsg = {
            id: (Date.now() + 1).toString(),
            text: randomReply,
            senderId: 'partner', // Generic partner ID for now
            timestamp: new Date()
        };
        MESSAGE_STORE[connectionId].push(replyMsg);
    }, 1500);

    res.json({ success: true, message: userMsg });
});

export default router;
