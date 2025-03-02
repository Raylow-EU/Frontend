import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  registerWithEmailAndPassword,
  loginWithEmailAndPassword,
  loginWithGoogle,
  logoutUser,
} from "../../firebase/auth";
import { setUser, setLoading, setError, logout } from "../slices/authSlice";

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ email, password, fullName }, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const user = await registerWithEmailAndPassword(
        email,
        password,
        fullName
      );
      dispatch(setUser(user));
      return user;
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
      const user = await loginWithEmailAndPassword(email, password);
      dispatch(setUser(user));
      return user;
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
      const user = await loginWithGoogle();
      dispatch(setUser(user));
      return user;
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
    } catch (error) {
      dispatch(setError(error.message));
      throw error;
    }
  }
);
