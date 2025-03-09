import { db } from "./config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { initializeDashboardData } from "./dashboardService";

// Check if a user has completed onboarding
export const checkOnboardingStatus = async (userId) => {
  try {
    const userOnboardingRef = doc(db, "userOnboarding", userId);
    const onboardingDoc = await getDoc(userOnboardingRef);

    return onboardingDoc.exists() && onboardingDoc.data().completed === true;
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return false;
  }
};

// Save onboarding information
export const saveOnboardingData = async (userId, onboardingData) => {
  try {
    // Save onboarding data
    const userOnboardingRef = doc(db, "userOnboarding", userId);
    const onboardingWithMeta = {
      ...onboardingData,
      completed: true,
      completedAt: new Date(),
    };

    await setDoc(userOnboardingRef, onboardingWithMeta);

    // Initialize dashboard data with user's onboarding information
    await initializeDashboardData(userId, onboardingWithMeta);

    return true;
  } catch (error) {
    console.error("Error saving onboarding data:", error);
    throw error;
  }
};
