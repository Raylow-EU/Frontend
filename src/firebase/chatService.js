import { db } from "./config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  arrayUnion,
  Timestamp,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

// Create a new chat session
export const createChatSession = async (userId) => {
  try {
    // Generate a unique ID for the new session
    const sessionId = uuidv4();

    // Create the session document
    const sessionRef = doc(db, "chatSessions", sessionId);

    // Generate a default title based on date/time
    const defaultTitle = `Chat ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString(
      [],
      { hour: "2-digit", minute: "2-digit" }
    )}`;

    // Initial session data
    const sessionData = {
      userId,
      title: defaultTitle,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      messages: [],
    };

    // Save to Firestore
    await setDoc(sessionRef, sessionData);

    // Return the session ID and data
    return {
      id: sessionId,
      ...sessionData,
      // Convert server timestamp to JS Date for immediate use
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error("Error creating chat session:", error);
    throw error;
  }
};

// Get all chat sessions for a user
export const getUserChatSessions = async (userId) => {
  try {
    // Query sessions for this user, ordered by last update
    const q = query(
      collection(db, "chatSessions"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );

    const querySnapshot = await getDocs(q);

    // Map the session data
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Ensure timestamps are converted to JS Date objects
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));
  } catch (error) {
    console.error("Error getting user chat sessions:", error);
    throw error;
  }
};

// Get a specific chat session by ID
export const getChatSession = async (sessionId) => {
  try {
    const sessionRef = doc(db, "chatSessions", sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (!sessionDoc.exists()) {
      throw new Error("Chat session not found");
    }

    const sessionData = sessionDoc.data();

    // Return the session with its ID and convert timestamps
    return {
      id: sessionId,
      ...sessionData,
      createdAt: sessionData.createdAt?.toDate() || new Date(),
      updatedAt: sessionData.updatedAt?.toDate() || new Date(),
    };
  } catch (error) {
    console.error("Error getting chat session:", error);
    throw error;
  }
};

// Add a message to a chat session
export const addMessageToChatSession = async (sessionId, message) => {
  try {
    const sessionRef = doc(db, "chatSessions", sessionId);

    // Get the session to verify it exists
    const sessionDoc = await getDoc(sessionRef);
    if (!sessionDoc.exists()) {
      throw new Error("Chat session not found");
    }

    // If the message doesn't have an ID, generate one
    if (!message.id) {
      message.id = uuidv4();
    }

    // Ensure timestamp is a Firestore timestamp
    const messageWithMeta = {
      ...message,
      timestamp: message.timestamp
        ? Timestamp.fromDate(new Date(message.timestamp))
        : Timestamp.now(),
    };

    // Update the session document - append the new message to the messages array
    await updateDoc(sessionRef, {
      messages: arrayUnion(messageWithMeta),
      updatedAt: serverTimestamp(),
    });

    return messageWithMeta;
  } catch (error) {
    console.error("Error adding message to chat session:", error);
    throw error;
  }
};

// Update chat session title
export const updateChatSessionTitle = async (sessionId, newTitle) => {
  try {
    const sessionRef = doc(db, "chatSessions", sessionId);

    await updateDoc(sessionRef, {
      title: newTitle,
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error updating chat session title:", error);
    throw error;
  }
};

// Delete a chat session
export const deleteChatSession = async (sessionId) => {
  try {
    const sessionRef = doc(db, "chatSessions", sessionId);

    // Delete the session document
    await deleteDoc(sessionRef);

    return true;
  } catch (error) {
    console.error("Error deleting chat session:", error);
    throw error;
  }
};

// Generate a summary of the chat (could be called after a certain number of messages)
export const generateChatSummary = async (sessionId) => {
  try {
    // This is where you could call an AI service to generate a summary
    // For now, we'll just update with a placeholder
    const sessionRef = doc(db, "chatSessions", sessionId);

    await updateDoc(sessionRef, {
      summary: "Chat about CSRD compliance and sustainability reporting.",
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error generating chat summary:", error);
    throw error;
  }
};
