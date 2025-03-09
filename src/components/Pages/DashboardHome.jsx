import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { BsThreeDotsVertical, BsCalendar } from "react-icons/bs";
import { FaShoppingCart } from "react-icons/fa";
import { FiGithub, FiTwitter } from "react-icons/fi";
import { AiFillDribbbleCircle } from "react-icons/ai";
import { RiTeamFill } from "react-icons/ri";
import { IoSearch } from "react-icons/io5";
import { HiArrowNarrowRight } from "react-icons/hi";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import { fetchDashboardData } from "../../firebase/dashboardService";
import "./DashboardHome.css";
import "../Dashboard/Dashboard.css";

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

const DashboardHome = () => {
  const { user } = useSelector((state) => state.auth);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Fetch dashboard data when component mounts
  useEffect(() => {
    const loadDashboardData = async () => {
      if (user?.uid) {
        try {
          setLoading(true);
          const data = await fetchDashboardData(user.uid);
          setDashboardData(data);
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadDashboardData();
  }, [user]);

  // Data for the donut chart
  const donutData = {
    labels: ["Scope 3", "Scope 2", "Scope 1"],
    datasets: [
      {
        data: dashboardData
          ? [
              dashboardData.chartData.emissionsByScope.scope3,
              dashboardData.chartData.emissionsByScope.scope2,
              dashboardData.chartData.emissionsByScope.scope1,
            ]
          : [77, 15, 8],
        backgroundColor: ["#e94c2b", "#e6a4a4", "#8d5c5c"],
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  // Data for the line chart
  const lineData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Emissions",
        data: dashboardData
          ? dashboardData.chartData.monthlyEmissions
          : [
              1200, 1000, 1400, 1100, 1300, 900, 1200, 800, 1100, 1000, 1200,
              900,
            ],
        borderColor: "#e94c2b",
        backgroundColor: "rgba(233, 76, 43, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
  };

  // Function to get user's first name
  const getFirstName = () => {
    if (!user || !user.displayName) return "User";
    return user.displayName.split(" ")[0];
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-home-layout">
      <div className="dashboard-main">
        <div className="dashboard-header">
          <div className="header-top-row">
            <h1 className="greeting">Hello, {getFirstName()}</h1>
            <div className="date-display">
              <BsCalendar className="calendar-icon" />
              <span>{formattedDate}</span>
            </div>
          </div>
          <p className="welcome-message">
            Welcome to the Dashboard portal. You can find everything here.
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card sales-card">
            <div className="stat-icon-container">
              <FaShoppingCart className="stat-icon" />
            </div>
            <div className="stat-info">
              <h2>
                {dashboardData?.stats.totalSales.toLocaleString() || "2,403"}
              </h2>
              <p>Total Sales</p>
            </div>
            <div className="stat-change positive">
              <span>4.35% ↑</span>
            </div>
          </div>
          <div className="stat-card emissions-card">
            <div className="stat-icon-container">
              <FaShoppingCart className="stat-icon" />
            </div>
            <div className="stat-info">
              <h2>
                {dashboardData?.stats.totalEmissions.toLocaleString() ||
                  "2,403"}
              </h2>
              <p>Total Emissions</p>
            </div>
            <div className="stat-change negative">
              <span>{dashboardData?.chartData.yearlyReduction || 7.25}% ↓</span>
            </div>
          </div>
          <div className="stat-card compliance-card">
            <div className="stat-icon-container">
              <FaShoppingCart className="stat-icon" />
            </div>
            <div className="stat-info">
              <h2>{dashboardData?.stats.complianceScore || 82}%</h2>
              <p>Compliance Score</p>
            </div>
            <div className="stat-change positive">
              <span>2.15% ↑</span>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card emissions-by-scope">
            <div className="chart-container">
              <div className="donut-chart-wrapper">
                <Doughnut data={donutData} options={donutOptions} />
                <div className="donut-center">
                  {dashboardData?.chartData.emissionsByScope.scope3 || 77}%
                </div>
              </div>
              <div className="scope-legend">
                <h3>Emissions by Scope</h3>
                <div className="scope-items">
                  <div className="scope-item">
                    <span className="scope-dot scope3"></span>
                    <span>Scope 3</span>
                  </div>
                  <div className="scope-item">
                    <span className="scope-dot scope2"></span>
                    <span>Scope 2</span>
                  </div>
                  <div className="scope-item">
                    <span className="scope-dot scope1"></span>
                    <span>Scope 1</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="chart-footer">
              <div className="mtco2-indicator">
                <div className="mtco2-dots">
                  <span className="scope-dot scope3"></span>
                  <span className="scope-dot scope2"></span>
                  <span className="scope-dot scope1"></span>
                </div>
                <span>1500 MTCO2</span>
              </div>
              <button className="view-details-btn">
                View detailed breakdown
                <HiArrowNarrowRight />
              </button>
            </div>
          </div>
          <div className="chart-card emissions-trend">
            <div className="chart-header">
              <h3>Emissions Trend</h3>
              <div className="chart-actions">
                <span className="chart-period">This Year</span>
                <BsThreeDotsVertical className="chart-menu" />
              </div>
            </div>
            <div className="line-chart-container">
              <Line data={lineData} options={lineOptions} />
            </div>
            <div className="chart-footer">
              <div className="chart-stat">
                <span className="stat-label">Average</span>
                <span className="stat-value">
                  {dashboardData
                    ? Math.round(
                        dashboardData.chartData.monthlyEmissions.reduce(
                          (a, b) => a + b,
                          0
                        ) / 12
                      ).toLocaleString()
                    : "1,100"}
                </span>
              </div>
              <div className="chart-stat">
                <span className="stat-label">YoY Change</span>
                <span
                  className={`stat-value ${
                    dashboardData?.chartData.yearlyReduction > 0
                      ? "negative"
                      : "positive"
                  }`}
                >
                  {dashboardData?.chartData.yearlyReduction || 5.25}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <section className="news-section">
          <h2 className="section-title">
            <span className="trend-icon">📈</span> Trending Sustainability News
          </h2>
          <div className="news-grid">
            <div className="news-card">
              <h3>EU Strictens CSRD Regulation</h3>
              <p>This change will affect 100k+ companies</p>
              <button className="view-article-btn">View Article</button>
            </div>
            <div className="news-card">
              <h3>New Regulation for SME&apos;s</h3>
              <p>This change will affect 80k+ companies</p>
              <button className="view-article-btn">View Article</button>
            </div>
          </div>
        </section>
      </div>

      <aside className="profile-sidebar">
        <div className="profile-card">
          <div className="profile-header">
            <img
              src={
                user?.photoURL ||
                `https://ui-avatars.com/api/?name=${getFirstName()}&background=e95c2c&color=fff`
              }
              alt="Profile"
              className="profile-avatar"
            />
            <BsThreeDotsVertical className="menu-dots" />
          </div>
          <h2 className="profile-name">{getFirstName()}</h2>
          <p className="profile-role">Mercadona - Admin</p>
          <div className="social-links">
            <a href="#" className="social-icon dribbble">
              <AiFillDribbbleCircle />
            </a>
            <a href="#" className="social-icon github">
              <FiGithub />
            </a>
            <a href="#" className="social-icon twitter">
              <FiTwitter />
            </a>
          </div>
          <p className="profile-bio">
            Minim dolor in amet nulla laboris enim dolore consequat proident...
          </p>
          <button className="view-profile-btn">VIEW PROFILE</button>
        </div>

        <div className="team-section">
          <div className="team-header">
            <h3>
              <RiTeamFill /> Mercadona Users
            </h3>
            <p>Connect and message other Mercadona employees to gather info.</p>
          </div>
          <div className="search-container">
            <div className="search-box">
              <IoSearch className="search-icon" />
              <input type="text" placeholder="Placeholder" />
            </div>
          </div>
          <div className="team-list">
            <div className="team-member">
              <img
                src="https://ui-avatars.com/api/?name=Wade+Warren&background=e0e0e0"
                alt="Wade Warren"
                className="member-avatar"
              />
              <div className="member-info">
                <h4>Wade Warren</h4>
                <p>Operations</p>
              </div>
              <button className="message-btn">MESSAGE</button>
            </div>
            <div className="team-member">
              <img
                src="https://ui-avatars.com/api/?name=Robert+Fox&background=e0e0e0"
                alt="Robert Fox"
                className="member-avatar"
              />
              <div className="member-info">
                <h4>Robert Fox</h4>
                <p>Logistics</p>
              </div>
              <button className="message-btn">MESSAGE</button>
            </div>
          </div>
          <div className="team-footer">
            <small>32 EMPLOYEES</small>
            <button className="team-page-btn">GO TO TEAM PAGE</button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default DashboardHome;
