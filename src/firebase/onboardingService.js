import { db } from "./config";
import { doc, getDoc, runTransaction } from "firebase/firestore";
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
    // Save onboarding data using a transaction to ensure consistency
    await runTransaction(db, async (transaction) => {
      // First check if user has permission to write to their onboarding document
      const userOnboardingRef = doc(db, "userOnboarding", userId);
      const userRef = doc(db, "users", userId);

      const onboardingWithMeta = {
        ...onboardingData,
        completed: true,
        completedAt: new Date(),
        isAdmin: true,
      };

      // Set the onboarding data in the transaction
      transaction.set(userOnboardingRef, onboardingWithMeta);

      // Also update user profile info in the users collection
      transaction.set(
        userRef,
        {
          isAdmin: true,
          onboardingCompleted: true,
          updatedAt: new Date(),
        },
        { merge: true }
      );
    });

    // Only initialize dashboard data after the transaction succeeds
    const onboardingWithMeta = {
      ...onboardingData,
      completed: true,
      completedAt: new Date(),
      isAdmin: true,
    };

    await initializeDashboardData(userId, onboardingWithMeta);

    return true;
  } catch (error) {
    console.error("Error saving onboarding data:", error);
    // Categorize the error to help with handling
    if (
      error.code === "permission-denied" ||
      error.message?.includes("Missing or insufficient permissions")
    ) {
      const permissionError = new Error(
        "You don't have permission to complete onboarding"
      );
      permissionError.code = "permission-denied";
      throw permissionError;
    }
    throw error;
  }
};
