import { db } from "./config";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import emailjs from "@emailjs/browser";

// Initialize EmailJS with error handling
try {
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
  if (!publicKey) {
    console.error("EmailJS public key is missing from environment variables");
    throw new Error("EmailJS configuration error");
  }
  emailjs.init(publicKey);
  console.log("EmailJS initialized successfully");
} catch (error) {
  console.error("Failed to initialize EmailJS:", error);
}

// Create a new team invite
export const createTeamInvite = async (adminId, email) => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new Error("Invalid email address format");
    }

    // Validate required environment variables
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_INVITE_TEMPLATE_ID;

    if (!serviceId || !templateId) {
      throw new Error("Missing required EmailJS configuration");
    }

    const inviteId = uuidv4();

    // Get admin's company details from userOnboarding collection
    const adminOnboardingDoc = await getDoc(doc(db, "userOnboarding", adminId));
    const adminData = adminOnboardingDoc.data();

    if (!adminData) {
      throw new Error("Admin user's onboarding data not found");
    }

    if (!adminData.companyName) {
      throw new Error("Admin user's company details are incomplete");
    }

    // Get admin user details for the email
    const adminUserDoc = await getDoc(doc(db, "users", adminId));
    const adminUserData = adminUserDoc.data();

    // Create the invite document
    await setDoc(doc(db, "teamInvites", inviteId), {
      adminId,
      email,
      companyName: adminData.companyName,
      companySize: adminData.companySize,
      industry: adminData.industry,
      sustainability_goals: adminData.sustainability_goals || [],
      status: "pending",
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ),
    });

    // Prepare email template parameters with validation
    const templateParams = {
      email: email.trim(),
      name: (adminUserData?.displayName || "Team Admin").trim(),
      company_name: adminData.companyName.trim(),
      message: `${window.location.origin}/invite/${inviteId}`,
      to_name: email.split("@")[0],
    };

    // Validate template parameters before sending
    if (
      !templateParams.email ||
      !templateParams.name ||
      !templateParams.company_name
    ) {
      throw new Error("Missing required email template parameters");
    }

    console.log("Sending email with parameters:", templateParams);

    // Send the invitation email with enhanced error handling
    const emailResult = await emailjs.send(
      serviceId,
      templateId,
      templateParams
    );

    if (emailResult.status !== 200) {
      throw new Error(`Failed to send invitation email: ${emailResult.text}`);
    }

    console.log("Team invite created and email sent successfully");
    return inviteId;
  } catch (error) {
    console.error("Error in createTeamInvite:", error);
    throw new Error(error.message || "Failed to create team invite");
  }
};

// Accept a team invite
export const acceptTeamInvite = async (inviteId, userId) => {
  try {
    const inviteRef = doc(db, "teamInvites", inviteId);
    const inviteDoc = await getDoc(inviteRef);
    const inviteData = inviteDoc.data();

    if (!inviteData) {
      throw new Error("Invite not found");
    }

    if (inviteData.status !== "pending") {
      throw new Error("Invite is no longer valid");
    }

    // Update the invite status
    await updateDoc(inviteRef, {
      status: "accepted",
      acceptedAt: serverTimestamp(),
      acceptedBy: userId,
    });

    // Update the user's document with company info
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      companyName: inviteData.companyName,
      companySize: inviteData.companySize,
      industry: inviteData.industry,
      sustainability_goals: inviteData.sustainability_goals,
      isAdmin: false,
      completed: true,
      completedAt: serverTimestamp(),
      previous_reporting: false,
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error("Error accepting team invite:", error);
    throw error;
  }
};

// Get all pending invites for a user's email
export const getPendingInvites = async (email) => {
  try {
    const q = query(
      collection(db, "teamInvites"),
      where("email", "==", email),
      where("status", "==", "pending")
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching pending invites:", error);
    throw error;
  }
};

// Get all team members for a company
export const getTeamMembers = async (companyName) => {
  try {
    const q = query(
      collection(db, "users"),
      where("companyName", "==", companyName)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching team members:", error);
    throw error;
  }
};
