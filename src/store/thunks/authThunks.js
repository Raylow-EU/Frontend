import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  registerWithEmailAndPassword,
  loginWithEmailAndPassword,
  loginWithGoogle,
  logoutUser,
  fetchUserData,
} from "../../firebase/auth";
import { setUser, setLoading, setError, logout } from "../slices/authSlice";

// Helper to extract serializable user data
const extractUserData = async (user) => {
  const baseData = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "",
  };

  // Fetch additional user data from Firestore
  try {
    const userData = await fetchUserData(user.uid);
    return {
      ...baseData,
      isAdmin: userData?.isAdmin || false,
      onboardingCompleted: userData?.onboardingCompleted || false,
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return baseData;
  }
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    { email, password, fullName, companyName, skipOnboarding },
    { dispatch }
  ) => {
    try {
      dispatch(setLoading(true));
      const userCredential = await registerWithEmailAndPassword(
        email,
        password,
        fullName,
        skipOnboarding ? { companyName } : null
      );
      const userData = await extractUserData(userCredential);
      dispatch(setUser(userData));
      return userData;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  }
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const userCredential = await loginWithEmailAndPassword(email, password);
      const userData = await extractUserData(userCredential);
      dispatch(setUser(userData));
      return userData;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  }
);

export const signInWithGoogle = createAsyncThunk(
  "auth/googleSignIn",
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const userCredential = await loginWithGoogle();
      const userData = await extractUserData(userCredential);
      dispatch(setUser(userData));
      return userData;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  }
);

export const logoutUserThunk = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      await logoutUser();
      dispatch(logout());
      return null;
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  }
);
