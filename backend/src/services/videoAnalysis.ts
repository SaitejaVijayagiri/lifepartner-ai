
import path from 'path';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from 'ffmpeg-static';
import { AIService } from './ai';

// Configure ffmpeg
if (ffmpegInstaller) {
    ffmpeg.setFfmpegPath(ffmpegInstaller);
}

const aiService = new AIService();

export const analyzeVideoVibe = async (videoPath: string) => {
    console.log(`🎬 Analyzing Video: ${videoPath}`);

    // 1. Extract One Frame (at 1 second mark or 50%)
    // taking a screenshot at 1s is safest for short clips
    const screenshotPath = path.join(path.dirname(videoPath), `frame_${Date.now()}.jpg`);

    try {
        await new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .screenshots({
                    timestamps: ['50%'], // Middle of the video
                    filename: path.basename(screenshotPath),
                    folder: path.dirname(videoPath),
                    size: '640x?' // Resize to save tokens/bandwidth
                })
                .on('end', resolve)
                .on('error', reject);
        });

        console.log(`📸 Frame Extracted: ${screenshotPath}`);

        // 2. Read Frame
        const imageBuffer = fs.readFileSync(screenshotPath);

        // 3. Analyze with Gemini Vision
        const prompt = `
            Analyze this image (a frame from a user's dating profile video).
            Determine the "Vibe" (e.g., Energetic, Calm, Adventurous, Traditional).
            Extract 3-5 visual tags (e.g., Beach, Gym, Reading, Hiking).
            Write a 1-sentence summary of the activity or setting.
            
            Return JSON ONLY:
            {
                "vibe": "Adjective & Adjective",
                "tags": ["Tag1", "Tag2"],
                "summary": "Summary text here."
            }
        `;

        const jsonRaw = await aiService.analyzeImage(imageBuffer, prompt);

        // Cleanup frame
        fs.unlinkSync(screenshotPath);

        if (!jsonRaw) throw new Error("AI returned empty response");

        // CLEANUP JSON (Gemini sometimes adds markdown backticks)
        const cleanJson = jsonRaw.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanJson);

    } catch (e) {
        console.error("Video Analysis Failed", e);
        // Fallback
        return {
            vibe: "Dynamic Personality",
            tags: ["Video", "Active"],
            confidence: 0.6,
            summary: "Video content analyzed (Auto-Fallback)."
        };
    }
};
