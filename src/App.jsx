import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import LandingPage from "./components/LandingPage/LandingPage";
import Login from "./components/Authentication/Login";
import Signup from "./components/Authentication/Signup";
import Dashboard from "./components/Dashboard/Dashboard";
import DashboardHome from "./components/Pages/DashboardHome";
import CSRD from "./components/Pages/CSRD";
import Reports from "./components/Pages/Reports";
import Team from "./components/Pages/Team";
import Settings from "./components/Pages/Settings";
import Navbar from "./components/LandingPage/Navbar";
import Onboarding from "./components/Onboarding/Onboarding";
import { checkOnboardingStatus } from "./firebase/onboardingService";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Component to check if user needs onboarding or can proceed to dashboard
const OnboardingCheck = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const [onboardingCompleted, setOnboardingCompleted] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      if (user?.uid) {
        try {
          const isCompleted = await checkOnboardingStatus(user.uid);
          setOnboardingCompleted(isCompleted);
        } catch (error) {
          console.error("Error checking onboarding status:", error);
          setOnboardingCompleted(false);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkStatus();
  }, [user]);

  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  if (onboardingCompleted === false) {
    return <Navigate to="/onboarding" />;
  }

  return children;
};

OnboardingCheck.propTypes = {
  children: PropTypes.node.isRequired,
};

const PrivateRoute = ({ children }) => {
  const { user, loading } = useSelector((state) => state.auth);

  // Check if we're still loading OR if user exists
  if (loading) {
    console.log("Auth state is loading...");
    return <div className="loading-spinner">Loading...</div>;
  }

  // Log the authentication state for debugging
  console.log(
    "Auth state in PrivateRoute:",
    user ? "Authenticated" : "Not authenticated"
  );

  // If we have a user, render the protected route
  if (user) {
    return children;
  }

  // Otherwise redirect to login
  console.log("No user found, redirecting to login");
  return <Navigate to="/login" />;
};

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

const App = () => {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={5000} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <>
              <Navbar />
              <Login />
            </>
          }
        />
        <Route
          path="/signup"
          element={
            <>
              <Navbar />
              <Signup />
            </>
          }
        />
        <Route
          path="/onboarding"
          element={
            <PrivateRoute>
              <Onboarding />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <OnboardingCheck>
                <Dashboard />
              </OnboardingCheck>
            </PrivateRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="csrd" element={<CSRD />} />
          <Route path="reports" element={<Reports />} />
          <Route path="team" element={<Team />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
