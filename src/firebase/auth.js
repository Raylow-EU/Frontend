import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth } from "./config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./config";

export const registerWithEmailAndPassword = async (
  email,
  password,
  fullName,
  companyData = null
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await updateProfile(userCredential.user, {
    displayName: fullName,
  });

  // If company data is provided (for invited users), set up their user document
  if (companyData) {
    const userRef = doc(db, "users", userCredential.user.uid);
    await setDoc(userRef, {
      displayName: fullName,
      email: email,
      companyName: companyData.companyName,
      isAdmin: false,
      onboardingCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Also create their onboarding document to skip onboarding
    const userOnboardingRef = doc(
      db,
      "userOnboarding",
      userCredential.user.uid
    );
    await setDoc(userOnboardingRef, {
      companyName: companyData.companyName,
      completed: true,
      completedAt: new Date(),
      isAdmin: false,
    });
  }

  return userCredential.user;
};

export const loginWithEmailAndPassword = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return userCredential.user;
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

export const logoutUser = async () => {
  await signOut(auth);
};

export const fetchUserData = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};
