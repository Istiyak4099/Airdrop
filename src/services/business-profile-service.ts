"use server";

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface BusinessProfile {
    companyName: string;
    industry: string;
    description: string;
}

export async function saveBusinessProfile(profile: BusinessProfile, userId: string): Promise<void> {
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
