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
import Signup from "./components/Authentication/SignUp";
import Dashboard from "./components/Dashboard/Dashboard";
import DashboardHome from "./components/Pages/DashboardHome";
import CSRD from "./components/Pages/CSRD";
import Reports from "./components/Pages/Reports";
import Team from "./components/Pages/Team";
import Settings from "./components/Pages/Settings";
import Navbar from "./components/LandingPage/Navbar";

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
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
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
