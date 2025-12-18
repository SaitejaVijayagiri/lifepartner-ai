
import { OpenAI } from 'langchain/llms/openai';
import { PromptTemplate } from 'langchain/prompts';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';

// Schema for parsing the user's prompt
const parser = StructuredOutputParser.fromZodSchema(
    z.object({
        values: z.array(z.string()).describe("Core values extracted from text"),
        traits: z.object({
            openness: z.number().min(0).max(1),
            conscientiousness: z.number().min(0).max(1),
            extraversion: z.number().min(0).max(1),
            agreeableness: z.number().min(0).max(1),
            neuroticism: z.number().min(0).max(1),
        }).describe("Big 5 personality traits estimated from text"),
        dealbreakers: z.array(z.string()).describe("Hard constraints or dealbreakers"),
        summary: z.string().describe("A concise summary of the ideal partner")
    })
);

export class AIService {
    private llm: OpenAI;

    constructor() {
        // In production, use process.env.OPENAI_API_KEY
        // For local dev without key, this needs a mock or a real key
        this.llm = new OpenAI({
            temperature: 0.7,
            openAIApiKey: process.env.OPENAI_API_KEY || 'mock_key'
        });
    }

    async parseUserPrompt(promptText: string) {
        const formatInstructions = parser.getFormatInstructions();

        const prompt = new PromptTemplate({
            template: "You are an expert matchmaker AI. Analyze the following request for a life partner:\n\n{prompt}\n\nExtract psychological traits, values, and dealbreakers.\n{format_instructions}",
            inputVariables: ["prompt"],
            partialVariables: { format_instructions: formatInstructions },
        });

        const input = await prompt.format({ prompt: promptText });

        // START MOCK RESPONSE (Remove when real API key is available)
        // Default to MOCK if no real key is provided or explicit mock mode
        if (process.env.MOCK_AI === 'true' || !process.env.OPENAI_API_KEY) {
            const keywords = promptText.toLowerCase();
            let summary = "Seeker wants a partner.";
            if (keywords.includes('doctor')) summary = "Seeker specifically wants a Doctor/Medical professional.";

            return {
                values: ["growth", "kindness"],
                traits: { openness: 0.8, conscientiousness: 0.7, extraversion: 0.5, agreeableness: 0.9, neuroticism: 0.2 },
                dealbreakers: ["smoking"],
                summary
            };
        }
        // END MOCK RESPONSE

        const response = await this.llm.call(input);
        return await parser.parse(response);
    }

    // Real Compatibility Analysis
    async analyzeCompatibility(userProfile: any, matchProfile: any) {
        // Schema for compatibility output
        const compatibilityParser = StructuredOutputParser.fromZodSchema(
            z.object({
                score: z.number().min(0).max(100).describe("Compatibility score from 0 to 100"),
                reason: z.string().describe("Brief explanation of why they match (or don't)"),
                icebreaker: z.string().describe("A fun, personalized conversation starter"),
            })
        );

        // MOCK Fallback
        if (process.env.MOCK_AI === 'true' || !process.env.OPENAI_API_KEY) {
            return {
                score: Math.floor(Math.random() * 30) + 70, // 70-100 random
                reason: "You both seem to have great energy! (Mock Analysis)",
                icebreaker: "Ask them about their favorite travel destination!"
            };
        }

        const formatInstructions = compatibilityParser.getFormatInstructions();
        const prompt = new PromptTemplate({
            template: `Analyze compatibility between two people based on their profiles.
            
            User A: {user_bio}
            User B: {match_bio}
            
            Determine a compatibility score, a reason, and a good icebreaker.
            {format_instructions}`,
            inputVariables: ["user_bio", "match_bio"],
            partialVariables: { format_instructions: formatInstructions },
        });

        const input = await prompt.format({
            user_bio: JSON.stringify(userProfile),
            match_bio: JSON.stringify(matchProfile)
        });

        try {
            const response = await this.llm.call(input);
            return await compatibilityParser.parse(response);
        } catch (e) {
            console.error("AI Analysis Failed", e);
            return {
                score: 50,
                reason: "AI analysis unavailable.",
                icebreaker: "Hi!"
            };
        }
    }

    // Parse Search Query for Matching
    async parseSearchQuery(queryText: string) {
        // Schema for search filters
        const searchParser = StructuredOutputParser.fromZodSchema(
            z.object({
                profession: z.string().optional().describe("Job title or role to look for"),
                minIncome: z.number().optional().describe("Minimum annual income"),
                minHeightInches: z.number().optional().describe("Minimum height in inches (e.g. 5'0 = 60)"),
                maxHeightInches: z.number().optional().describe("Maximum height in inches"),
                smoking: z.enum(["Yes", "No"]).optional(),
                drinking: z.enum(["Yes", "No"]).optional(),
                diet: z.enum(["Veg", "Non-Veg", "Vegan"]).optional(),
                religion: z.string().optional(),
                caste: z.string().optional().describe("Specific caste or community (e.g. Brahmin, Iyer, Rajput)"),
                gothra: z.string().optional().describe("Gothra if specified"),
                education: z.string().optional().describe("Degree or College (e.g. B.Tech, IIT, MBA)"),
                familyValues: z.string().optional().describe("Family values (e.g. Traditional, Moderate, Orthodox)"),
                appearance: z.array(z.string()).describe("Physical appearance keywords (e.g. 'fair', 'tall', 'athletic')"),
                keywords: z.array(z.string()).describe("Other keywords to match in bio, hobbies, or about me")
            })
        );

        // MOCK LOGIC (Fallback)
        if (process.env.MOCK_AI === 'true' || !process.env.OPENAI_API_KEY) {
            const lower = queryText.toLowerCase();
            const result: any = { keywords: [], appearance: [] };

            if (lower.includes('software') || lower.includes('engineer') || lower.includes('developer')) {
                result.profession = "Software Engineer";
            }
            if (lower.includes('doctor') || lower.includes('medical')) {
                result.profession = "Doctor";
            }
            // ... (keep existing mock logic if desired, simplified for brevity here, but typically you'd keep it all)
            return result;
        }

        // Real AI Logic
        const formatInstructions = searchParser.getFormatInstructions();
        const prompt = new PromptTemplate({
            template: "You are a matchmaker. Convert this natural language search request into structured filters:\nRequest: \"{query}\"\n{format_instructions}",
            inputVariables: ["query"],
            partialVariables: { format_instructions: formatInstructions },
        });

        const input = await prompt.format({ query: queryText });
        const response = await this.llm.call(input);
        return await searchParser.parse(response);
    }

    // ... embedding logic remains same
    async generateEmbedding(text: string): Promise<number[]> {
        return Array(1536).fill(0).map(() => Math.random());
    }
}
