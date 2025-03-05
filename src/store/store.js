import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

// Function to save state to localStorage
const saveToLocalStorage = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("reduxState", serializedState);
  } catch (e) {
    console.error("Could not save state to localStorage", e);
  }
};

// Function to load state from localStorage
const loadFromLocalStorage = () => {
  try {
    const serializedState = localStorage.getItem("reduxState");
    if (serializedState === null) return undefined;
    return JSON.parse(serializedState);
  } catch (e) {
    console.error("Could not load state from localStorage", e);
    return undefined;
  }
};

const persistedState = loadFromLocalStorage();

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: persistedState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["auth/setUser"],
      },
    }),
});

// Listen for store changes and save to localStorage
store.subscribe(() => {
  const state = store.getState();
  saveToLocalStorage(state);
});

export const getState = store.getState;
export const dispatch = store.dispatch;
