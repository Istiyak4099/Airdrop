
"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs, writeBatch, query, where } from "firebase/firestore";

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

// Generic save and get functions
async function saveData<T>(collectionName: string, userId: string, data: T): Promise<void> {
    const docRef = doc(db, collectionName, userId);
    await setDoc(docRef, data, { merge: true });
}

async function getData<T>(collectionName: string, userId: string): Promise<T | null> {
    const docRef = doc(db, collectionName, userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as T) : null;
}

// Specific functions for each collection
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

export async function getBusinessProfile(userId: string): Promise<any | null> {
    const collections = ['businessBasics', 'products', 'faqs', 'brandVoice', 'responseGuidelines', 'advancedSettings'];
    const promises = collections.map(col => getData(col, userId));
    const results = await Promise.all(promises);
    
    if (results.every(r => r === null)) {
        return null;
    }

    return {
        ...(results[0] as BusinessBasics),
        ...(results[1] as { products: Product[] }),
        ...(results[2] as { faqs: FAQ[] }),
        ...(results[3] as BrandVoiceSettings),
        ...(results[4] as ResponseGuidelines),
        ...(results[5] as AdvancedSettings),
    };
}
