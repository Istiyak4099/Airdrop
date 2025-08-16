
"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// From configure-ai/page.tsx
interface Product {
  id: number;
  name: string;
  price: string;
  description: string;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

type BrandVoiceState = 'left' | 'neutral' | 'right';

interface BrandVoice {
    professionalism: BrandVoiceState;
    verbosity: BrandVoiceState;
    formality: BrandVoiceState;
}

export interface BusinessProfile {
    companyName: string;
    industry: string;
    description: string;
    products?: Product[];
    faqs?: FAQ[];
    brandVoice?: BrandVoice;
    writingStyleExample?: string;
    languageHandling?: string;
    preferredResponseLength?: string;
    escalationProtocol?: string;
    followUpQuestions?: boolean;
    proactiveSuggestions?: boolean;
}

export async function saveBusinessProfile(profile: Partial<BusinessProfile>, userId: string): Promise<void> {
    const docRef = doc(db, "businessProfiles", userId);
    await setDoc(docRef, profile, { merge: true });
}

export async function getBusinessProfile(userId: string): Promise<BusinessProfile | null> {
    const docRef = doc(db, "businessProfiles", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as BusinessProfile;
    } else {
        return null;
    }
}
