import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUserThunk } from "../../store/thunks/authThunks";
import "./Dashboard.css";

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUserThunk()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <h2>Welcome, {user?.displayName || "User"}!</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </nav>
      <div className="dashboard-content">
        <h1>Dashboard</h1>
        <p>Your email: {user?.email}</p>
        {/* Add more dashboard content here */}
      </div>
    </div>
  );
};

export default Dashboard;
