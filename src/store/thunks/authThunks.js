import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  registerWithEmailAndPassword,
  loginWithEmailAndPassword,
  loginWithGoogle,
  logoutUser,
} from "../../firebase/auth";
import { setUser, setLoading, setError, logout } from "../slices/authSlice";

// Helper to extract serializable user data
const extractUserData = (user) => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName || "",
});

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ email, password, fullName }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const userCredential = await registerWithEmailAndPassword(
        email,
        password,
        fullName
      );
      const userData = extractUserData(userCredential);
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
      const userData = extractUserData(userCredential);
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
      const userData = extractUserData(userCredential);
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
