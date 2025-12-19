import { AIService } from './ai';
import path from 'path';

// Singleton instance
const aiService = new AIService();

export const analyzeVibe = async (fileUrlOrPath: string, type: 'VIDEO' | 'AUDIO') => {
    console.log(`Analyzing Vibe for ${type}: ${fileUrlOrPath}`);

    // If it's a remote URL, we might need to handle it. 
    // For now, assuming local file path if it starts with 'uploads/' or absolute path.
    // If it's a URL, Xenova *might* fetch it, but usually safer to have local path.
    // In our app, uploads are local in 'uploads/' folder.

    // Normalize path if it's a URL like http://localhost:4000/uploads/...
    // But backend sees local file path ideally.
    // If the input is just the filename or relative path:

    let processablePath = fileUrlOrPath;
    if (fileUrlOrPath.startsWith('http')) {
        // TODO: Download logic for remote files (Supabase/S3).
        // For local dev with localhost, we can try to map it, but let's assume we pass the local path from the route.
        console.warn("Analyze Vibe: Remote URL passed. Skipping real analysis for now, returning mock.");
        return getMockAnalysis(type);
    }

    try {
        if (type === 'AUDIO') {
            // 1. Transcribe (Local AI - Free)
            const transcript = await aiService.transcribeAudio(processablePath);
            if (!transcript) {
                return { vibe: "Mysterious", tags: ["Quiet"], confidence: 0.5, summary: "Could not transcribe audio." };
            }

            if (!transcript) {
                return { vibe: "Mysterious", tags: ["Quiet"], confidence: 0.5, summary: "Could not transcribe audio." };
            }

            // 2. Analyze Text (OpenAI / Gemini - Free Tier)
            const vibe = await aiService.analyzePersonalityFromText(transcript);
            return vibe;
        }

        if (type === 'VIDEO') {
            // 1. Analyze Video (Real AI - Free Gemini Vision)
            const { analyzeVideoVibe } = await import('./videoAnalysis');
            try {
                const vibe = await analyzeVideoVibe(processablePath);
                return vibe;
            } catch (e) {
                console.error("Real Video Analysis Failed, using Mock", e);
                return getMockAnalysis('VIDEO');
            }
        }

    } catch (error) {
        console.error("Vibe Analysis Failed:", error);
        return getMockAnalysis(type);
    }
};

const getMockAnalysis = (type: 'VIDEO' | 'AUDIO') => {
    if (type === 'VIDEO') {
        return {
            vibe: "Energetic & Outgoing",
            tags: ["Travel", "Adventure", "Extrovert"],
            confidence: 0.88,
            summary: "The user appears to be in an outdoor setting, smiling mainly, suggesting a love for nature."
        };
    } else {
        return {
            vibe: "Calm & Articulate",
            tags: ["Intellectual", "Soft-spoken"],
            confidence: 0.92,
            summary: "Voice tone is steady and low-pitch, indicating confidence and calmness."
        };
    }
};

/*
// Future Implementation Plan:
// 1. Download File from URL (if remote) or read from disk.
// 2. OpenAI Whisper for Audio -> Text + Tone Analysis?
// 3. OpenAI GPT-4-Vision for Video Frames -> Activity/Mood detection.
*/
