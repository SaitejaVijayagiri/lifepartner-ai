# Video Upload Implementation Notes

## Current Approach: File Upload with Multer

**How it works:**
- When you upload a video, the actual file is sent to the backend using multipart/form-data
- The backend saves the video file in the `backend/uploads/videos/` directory
- Videos are served as static files via Express and can be accessed at `/uploads/videos/filename.mp4`
- Works for files up to 100MB
- Videos persist across page refreshes and server restarts

**Technical Details:**
```javascript
// Frontend sends FormData with the video file
const formData = new FormData();
formData.append('video', file);

// Backend uses multer to handle file upload
const storage = multer.diskStorage({
    destination: 'uploads/videos/',
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
```

**Benefits:**
- ✅ Videos persist across page refreshes
- ✅ Videos persist across server restarts (stored on disk)
- ✅ Simple to implement for local development
- ✅ Production-ready with minor modifications

**For Production:**
To scale this for production, you would need:
1. Cloud storage (AWS S3, Google Cloud Storage, Cloudinary, etc.)
2. Update multer configuration to upload directly to cloud or upload after receiving
3. Replace local file paths with cloud URLs
4. Add video compression/optimization
5. Add CDN for faster delivery

**Why This Approach:**
- ✅ Real file uploads
- ✅ Videos persist permanently (on disk)
- ✅ Easy to migrate to cloud storage
- ✅ Works on any device with internet access
- ✅ Production-ready architecture

