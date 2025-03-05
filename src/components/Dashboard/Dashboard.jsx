import { useDispatch } from "react-redux";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { logoutUserThunk } from "../../store/thunks/authThunks";
import "./Dashboard.css";
import {
  FaHome,
  FaCubes,
  FaChartBar,
  FaUsers,
  FaCog,
  FaShoppingCart,
} from "react-icons/fa";
import { BiLogOut } from "react-icons/bi";
import { AiOutlineQuestionCircle } from "react-icons/ai";
import logo from "../../assets/logo.png";
import PropTypes from "prop-types";

const Dashboard = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUserThunk()).unwrap();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const StatCard = ({ value, label, change }) => (
    <div className="stat-card">
      <FaShoppingCart className="stat-icon" />
      <div className="stat-content">
        <h3>{value}</h3>
        <p>{label}</p>
        <span className="stat-change">{change}% ↑</span>
      </div>
    </div>
  );

  StatCard.propTypes = {
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    change: PropTypes.string.isRequired,
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="logo">
          <img src={logo} alt="Raylow" />
          <span>RAYLOW</span>
        </div>

        <nav className="nav-menu">
          <Link
            to="/dashboard"
            className={location.pathname === "/dashboard" ? "active" : ""}
          >
            <FaHome /> Home
          </Link>
          <Link
            to="/dashboard/csrd"
            className={location.pathname === "/dashboard/csrd" ? "active" : ""}
          >
            <FaCubes /> CSRD
          </Link>
          <Link
            to="/dashboard/reports"
            className={
              location.pathname === "/dashboard/reports" ? "active" : ""
            }
          >
            <FaChartBar /> Reports
          </Link>
          <Link
            to="/dashboard/team"
            className={location.pathname === "/dashboard/team" ? "active" : ""}
          >
            <FaUsers /> Team
          </Link>
          <Link
            to="/dashboard/settings"
            className={
              location.pathname === "/dashboard/settings" ? "active" : ""
            }
          >
            <FaCog /> Settings
          </Link>
        </nav>

        <div className="sidebar-footer">
          <a href="#">
            <AiOutlineQuestionCircle /> Help & Information
          </a>
          <a href="#" onClick={handleLogout}>
            <BiLogOut /> Log Out
          </a>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
