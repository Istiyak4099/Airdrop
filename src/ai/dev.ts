import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-reply.ts';
import '@/ai/flows/generate-welcome-message.ts';
import '@/ai/flows/analyze-sentiment.ts';
import '@/ai/flows/detect-language.ts';
