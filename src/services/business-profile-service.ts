
import { initializeFirebase } from "@/firebase";
import { doc, getDoc, setDoc, Firestore } from "firebase/firestore";

// Interfaces for each data model
export interface BusinessBasics {
    companyName: string;
    industry: string;
    description: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  description: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
}

export type BrandVoiceState = 'left' | 'neutral' | 'right';

export interface BrandVoice {
    professionalism: BrandVoiceState;
    verbosity: BrandVoiceState;
    formality: BrandVoiceState;
}

export interface BrandVoiceSettings {
    brandVoice: BrandVoice;
    writingStyleExample?: string;
}

export interface ResponseGuidelines {
    languageHandling?: string;
    preferredResponseLength?: string;
    escalationProtocol?: string;
    followUpQuestions?: boolean;
    proactiveSuggestions?: boolean;
    additionalResponseGuidelines?: string;
}

export interface AdvancedSettings {
    companyPolicies?: string;
    sensitiveTopicsHandling?: string;
    complianceRequirements?: string;
    additionalKnowledge?: string;
}

/**
 * Shared Firestore instance logic for both client and server.
 */
function getDb() {
    const { firestore } = initializeFirebase();
    return firestore;
}

/**
 * Generic save function.
 */
async function saveData<T>(collectionName: string, userId: string, data: T): Promise<void> {
    const db = getDb();
    const docRef = doc(db, collectionName, userId);
    await setDoc(docRef, data, { merge: true });
}

/**
 * Generic get function.
 */
async function getData<T>(collectionName: string, userId: string): Promise<T | null> {
    const db = getDb();
    const docRef = doc(db, collectionName, userId);
    try {
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data() as T) : null;
    } catch (e: any) {
      console.error(`Error fetching from ${collectionName}:`, e);
      return null;
    }
}

// Specific functions
export async function saveBusinessBasics(data: BusinessBasics, userId: string): Promise<void> {
    await saveData('businessBasics', userId, data);
}

export async function getBusinessBasics(userId: string): Promise<BusinessBasics | null> {
    return await getData<BusinessBasics>('businessBasics', userId);
}

export async function saveProducts(data: { products: Product[] }, userId: string): Promise<void> {
    await saveData('products', userId, data);
}

export async function getProducts(userId: string): Promise<{ products: Product[] } | null> {
    return await getData<{ products: Product[] }>('products', userId);
}

export async function saveFaqs(data: { faqs: FAQ[] }, userId: string): Promise<void> {
    await saveData('faqs', userId, data);
}

export async function getFaqs(userId: string): Promise<{ faqs: FAQ[] } | null> {
    return await getData<{ faqs: FAQ[] }>('faqs', userId);
}

export async function saveBrandVoice(data: BrandVoiceSettings, userId: string): Promise<void> {
    await saveData('brandVoice', userId, data);
}

export async function getBrandVoice(userId: string): Promise<BrandVoiceSettings | null> {
    return await getData<BrandVoiceSettings>('brandVoice', userId);
}

export async function saveResponseGuidelines(data: ResponseGuidelines, userId: string): Promise<void> {
    await saveData('responseGuidelines', userId, data);
}

export async function getResponseGuidelines(userId: string): Promise<ResponseGuidelines | null> {
    return await getData<ResponseGuidelines>('responseGuidelines', userId);
}

export async function saveAdvancedSettings(data: AdvancedSettings, userId: string): Promise<void> {
    await saveData('advancedSettings', userId, data);
}

export async function getAdvancedSettings(userId: string): Promise<AdvancedSettings | null> {
    return await getData<AdvancedSettings>('advancedSettings', userId);
}

/**
 * Aggregates all profile parts into a single object.
 */
export async function getBusinessProfile(userId: string): Promise<any | null> {
    const collections = ['businessBasics', 'products', 'faqs', 'brandVoice', 'responseGuidelines', 'advancedSettings'];
    const promises = collections.map(col => getData(col, userId));
    const [businessBasics, products, faqs, brandVoice, responseGuidelines, advancedSettings] = await Promise.all(promises);
    
    const profile: any = {};

    if (businessBasics) Object.assign(profile, businessBasics);
    if (products) Object.assign(profile, products);
    if (faqs) Object.assign(profile, faqs);
    if (brandVoice) Object.assign(profile, brandVoice);
    if (responseGuidelines) Object.assign(profile, responseGuidelines);
    if (advancedSettings) Object.assign(profile, advancedSettings);

    if (Object.keys(profile).length === 0) {
        return null;
    }

    return profile;
}
