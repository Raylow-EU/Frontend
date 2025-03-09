import { db } from "./config";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

// Generate random demo data for a new user
const generateDashboardData = (userData) => {
  // Generate random data based on company size and industry
  const companySize = userData?.companySize || "1-10";
  const industry = userData?.industry || "other";

  // Scale factor based on company size
  let sizeFactor = 1;
  switch (companySize) {
    case "1-10":
      sizeFactor = 1;
      break;
    case "11-50":
      sizeFactor = 5;
      break;
    case "51-200":
      sizeFactor = 20;
      break;
    case "201-1000":
      sizeFactor = 100;
      break;
    case "1000+":
      sizeFactor = 500;
      break;
    default:
      sizeFactor = 1;
  }

  // Industry factor - different industries have different emission profiles
  let industryFactors = {
    technology: { scope1: 0.05, scope2: 0.2, scope3: 0.75 },
    manufacturing: { scope1: 0.2, scope2: 0.3, scope3: 0.5 },
    energy: { scope1: 0.4, scope2: 0.3, scope3: 0.3 },
    retail: { scope1: 0.1, scope2: 0.3, scope3: 0.6 },
    healthcare: { scope1: 0.15, scope2: 0.25, scope3: 0.6 },
    finance: { scope1: 0.05, scope2: 0.15, scope3: 0.8 },
    other: { scope1: 0.1, scope2: 0.2, scope3: 0.7 },
  };

  const factors = industryFactors[industry] || industryFactors.other;

  // Generate random monthly data for emissions chart
  const generateMonthlyData = () => {
    const baseValue = 100 * sizeFactor;
    return Array.from({ length: 12 }, (_, i) => {
      // Add some seasonality and randomness
      const seasonality = 1 + 0.2 * Math.sin((i / 11) * Math.PI * 2);
      const randomness = 0.9 + Math.random() * 0.2;
      return Math.round(baseValue * seasonality * randomness);
    });
  };

  // Return structured dashboard data
  return {
    stats: {
      totalSales: Math.round(1500 * sizeFactor * (0.8 + Math.random() * 0.4)),
      totalEmissions: Math.round(
        2000 * sizeFactor * (0.8 + Math.random() * 0.4)
      ),
      reductionTarget: Math.round(15 + Math.random() * 20),
      complianceScore: Math.round(70 + Math.random() * 25),
    },
    chartData: {
      emissionsByScope: {
        scope1: Math.round(factors.scope1 * 100),
        scope2: Math.round(factors.scope2 * 100),
        scope3: Math.round(factors.scope3 * 100),
      },
      monthlyEmissions: generateMonthlyData(),
      yearlyReduction: Math.round(5 + Math.random() * 15),
    },
    tables: {
      recentReports: [],
    },
    lastUpdated: new Date(),
  };
};

// Initialize dashboard data for a new user
export const initializeDashboardData = async (userId, userData) => {
  try {
    const dashboardRef = doc(db, "dashboardData", userId);

    // Check if dashboard data already exists
    const docSnap = await getDoc(dashboardRef);
    if (docSnap.exists()) {
      console.log("Dashboard data already exists, not overwriting");
      return true;
    }

    // Generate demo data for the new user
    const dashboardData = generateDashboardData(userData);

    // Save to Firestore
    await setDoc(dashboardRef, dashboardData);

    return true;
  } catch (error) {
    console.error("Error initializing dashboard data:", error);
    throw error;
  }
};

// Fetch dashboard data for a user
export const fetchDashboardData = async (userId) => {
  try {
    const dashboardRef = doc(db, "dashboardData", userId);
    const docSnap = await getDoc(dashboardRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No dashboard data found for this user");
      // Create default data if none exists
      const userData = await fetchUserOnboardingData(userId);
      const dashboardData = generateDashboardData(userData);
      await setDoc(dashboardRef, dashboardData);
      return dashboardData;
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

// Helper function to get user's onboarding data
async function fetchUserOnboardingData(userId) {
  try {
    const userOnboardingRef = doc(db, "userOnboarding", userId);
    const docSnap = await getDoc(userOnboardingRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user onboarding data:", error);
    return null;
  }
}

// Update specific dashboard data values
export const updateDashboardData = async (userId, updatedData) => {
  try {
    const dashboardRef = doc(db, "dashboardData", userId);
    await updateDoc(dashboardRef, {
      ...updatedData,
      lastUpdated: new Date(),
    });
    return true;
  } catch (error) {
    console.error("Error updating dashboard data:", error);
    throw error;
  }
};

// Add a new report to the recent reports list
export const addReportToDashboard = async (userId, reportData) => {
  try {
    // First get the current dashboard data
    const dashboardRef = doc(db, "dashboardData", userId);
    const docSnap = await getDoc(dashboardRef);

    if (!docSnap.exists()) {
      throw new Error("Dashboard data does not exist");
    }

    const dashboardData = docSnap.data();
    const recentReports = dashboardData.tables?.recentReports || [];

    // Add new report to the beginning of the array and limit to 5 reports
    const updatedReports = [reportData, ...recentReports].slice(0, 5);

    // Update the dashboard data
    await updateDoc(dashboardRef, {
      "tables.recentReports": updatedReports,
      lastUpdated: new Date(),
    });

    return true;
  } catch (error) {
    console.error("Error adding report to dashboard:", error);
    throw error;
  }
};
