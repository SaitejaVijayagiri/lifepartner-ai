import { supabase } from '../db';
import dotenv from 'dotenv';
dotenv.config();

const checkBucket = async () => {
    try {
        console.log("Checking buckets...");
        const { data, error } = await supabase.storage.listBuckets();

        if (error) {
            console.error("List Buckets Error:", error);
            process.exit(1);
        }

        const reelsBucket = data.find(b => b.name === 'reels');

        if (reelsBucket) {
            console.log("✅ Bucket 'reels' exists.");
            console.log("Public:", reelsBucket.public);
            if (!reelsBucket.public) {
                console.log("⚠️ Bucket is NOT public. Only public buckets support direct URL access without signing.");
                // Note: You can't change public status via JS SDK easily, usually dashboard.
            }
        } else {
            console.log("❌ Bucket 'reels' does NOT exist.");
            console.log("Attempting to create...");
            const { data: newBucket, error: createError } = await supabase.storage.createBucket('reels', {
                public: true
            });

            if (createError) {
                console.error("Failed to create bucket:", createError);
            } else {
                console.log("✅ Bucket 'reels' created successfully!");
            }
        }
    } catch (e) {
        console.error("Script Error", e);
    }
};

checkBucket();
