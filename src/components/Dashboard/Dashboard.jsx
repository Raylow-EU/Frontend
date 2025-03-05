import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link, Outlet, useLocation } from "react-router-dom";
import { logout } from "../../store/slices/authSlice.js";
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
  const [collapsed, setCollapsed] = useState(false);

  // Determine if sidebar should be collapsed based on current route
  useEffect(() => {
    if (location.pathname === "/dashboard") {
      setCollapsed(false);
    } else {
      setCollapsed(true);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
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
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="logo">
          <img src={logo} alt="Raylow" />
          {!collapsed && <span>RAYLOW</span>}
        </div>

        <button
          className="toggle-sidebar"
          onClick={toggleSidebar}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? "›" : "‹"}
        </button>

        <nav className="nav-menu">
          <Link
            to="/dashboard"
            className={location.pathname === "/dashboard" ? "active" : ""}
            title="Home"
          >
            <FaHome /> {!collapsed && "Home"}
          </Link>
          <Link
            to="/dashboard/csrd"
            className={location.pathname === "/dashboard/csrd" ? "active" : ""}
            title="CSRD"
          >
            <FaCubes /> {!collapsed && "CSRD"}
          </Link>
          <Link
            to="/dashboard/reports"
            className={
              location.pathname === "/dashboard/reports" ? "active" : ""
            }
            title="Reports"
          >
            <FaChartBar /> {!collapsed && "Reports"}
          </Link>
          <Link
            to="/dashboard/team"
            className={location.pathname === "/dashboard/team" ? "active" : ""}
            title="Team"
          >
            <FaUsers /> {!collapsed && "Team"}
          </Link>
          <Link
            to="/dashboard/settings"
            className={
              location.pathname === "/dashboard/settings" ? "active" : ""
            }
            title="Settings"
          >
            <FaCog /> {!collapsed && "Settings"}
          </Link>
        </nav>

        <div className="sidebar-footer">
          <a href="#" title="Help & Information">
            <AiOutlineQuestionCircle /> {!collapsed && "Help & Information"}
          </a>
          <a href="#" onClick={handleLogout} title="Log Out">
            <BiLogOut /> {!collapsed && "Log Out"}
          </a>
        </div>
      </aside>

      <main className={`main-content ${collapsed ? "expanded" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
