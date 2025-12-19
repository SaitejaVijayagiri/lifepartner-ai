
// Dictionary of Vibe Categories
const KEYWORD_MAP: Record<string, { tag: string, vibe: string }> = {
    // Energetic / Outgoing
    'travel': { tag: 'Adventurous', vibe: 'Energetic' },
    'adventure': { tag: 'Adventurous', vibe: 'Energetic' },
    'explore': { tag: 'Explorer', vibe: 'Curious' },
    'fun': { tag: 'Fun-loving', vibe: 'Bubbly' },
    'party': { tag: 'Social', vibe: 'Outgoing' },
    'friends': { tag: 'Social', vibe: 'Friendly' },
    'gym': { tag: 'Fitness', vibe: 'Active' },
    'fitness': { tag: 'Fitness', vibe: 'Active' },

    // Intellectual / Calm
    'read': { tag: 'Intellectual', vibe: 'Calm' },
    'book': { tag: 'Reader', vibe: 'Calm' },
    'learn': { tag: 'Curious', vibe: 'Intellectual' },
    'code': { tag: 'Techie', vibe: 'Smart' },
    'tech': { tag: 'Techie', vibe: 'Smart' },
    'peace': { tag: 'Peaceful', vibe: 'Zen' },
    'nature': { tag: 'Nature Lover', vibe: 'Grounded' },

    // Family / Traditional
    'family': { tag: 'Family-Oriented', vibe: 'Caring' },
    'marriage': { tag: 'Serious', vibe: 'Traditional' },
    'respect': { tag: 'Respectful', vibe: 'Traditional' },
    'career': { tag: 'Ambitious', vibe: 'Driven' },
    'work': { tag: 'Hardworking', vibe: 'Professional' },
    'business': { tag: 'Entrepreneur', vibe: 'Ambitious' }
};

export const analyzeTextRuleBased = (text: string) => {
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/);

    const detectedTags = new Set<string>();
    const detectedVibes = new Set<string>();

    let matchCount = 0;

    // 1. Keyword Extraction
    for (const word of words) {
        // Simple stemming check (startsWith)
        for (const [key, val] of Object.entries(KEYWORD_MAP)) {
            if (word.includes(key)) {
                detectedTags.add(val.tag);
                detectedVibes.add(val.vibe);
                matchCount++;
            }
        }
    }

    // 2. Default Fallback
    if (matchCount === 0) {
        detectedTags.add("Open-minded");
        detectedVibes.add("Mysterious");
    }

    // 3. Construct Summary
    const tagsArray = Array.from(detectedTags).slice(0, 4);
    const vibesArray = Array.from(detectedVibes);

    const primaryVibe = vibesArray[0] || "Friendly";
    const secondaryVibe = vibesArray[1] || "";

    const finalVibe = secondaryVibe ? `${primaryVibe} & ${secondaryVibe}` : primaryVibe;

    return {
        vibe: finalVibe,
        tags: tagsArray,
        confidence: Math.min(0.5 + (matchCount * 0.1), 0.95), // Confidence grows with matches
        summary: `Speech analysis suggests a ${primaryVibe.toLowerCase()} personality who values ${tagsArray.join(', ')}.`
    };
};
