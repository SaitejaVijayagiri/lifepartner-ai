import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Multer Config (Disk Storage for Stability + Large Files)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads'); // Adjust path based on dist/src structure or just consistent root
        // In dev: src/middleware -> ../../uploads (root/uploads)
        // In prod: dist/middleware -> ../../uploads (root/uploads)

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB Limit (High Capacity)
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only video, image, and audio files are allowed!'));
        }
    }
});
