import { useSelector } from "react-redux";
import { FaShoppingCart } from "react-icons/fa";
import PropTypes from "prop-types";
import { BsThreeDotsVertical } from "react-icons/bs";
import "../Dashboard/Dashboard.css";
import "./DashboardHome.css";

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

const DashboardHome = () => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="dashboard-home-layout">
      <div className="dashboard-main">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.displayName || "User"}!</p>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon carbon"></div>
            <div className="stat-content">
              <h3>1,200 tons</h3>
              <p>Carbon emissions</p>
              <span className="stat-change down">-2.4% ↓</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon compliance"></div>
            <div className="stat-content">
              <h3>89%</h3>
              <p>Compliance score</p>
              <span className="stat-change up">+3.1% ↑</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon reports"></div>
            <div className="stat-content">
              <h3>6</h3>
              <p>ESG reports</p>
              <span className="stat-change">0% =</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon tasks"></div>
            <div className="stat-content">
              <h3>12</h3>
              <p>Open tasks</p>
              <span className="stat-change down">-4 ↓</span>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <h3>Emissions by Scope</h3>
            <div className="scope-chart">
              <div className="donut-chart">77%</div>
              <div className="scope-legend">
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
              <div className="chart-footer">
                <span>1500 MTCO2</span>
                <button className="view-details">
                  View detailed breakdown →
                </button>
              </div>
            </div>
          </div>

          <div className="chart-card">
            <h3>Emissions over the years</h3>
            <div className="emissions-chart">
              <div className="chart-header">
                <h4>-2.145%</h4>
                <span>2025</span>
              </div>
              {/* Chart will go here */}
            </div>
          </div>
        </div>

        <section className="news-section">
          <h2>Trending Sustainability News</h2>
          <div className="news-grid">
            <div className="news-card">
              <h3>EU Strictens CSRD Regulation</h3>
              <p>This change will affect 100k+ companies</p>
              <button>View Article</button>
            </div>
            <div className="news-card">
              <h3>New Regulation for SME&apos;s</h3>
              <p>This change will affect 80k+ companies</p>
              <button>View Article</button>
            </div>
          </div>
        </section>
      </div>

      <aside className="profile-sidebar">
        <div className="profile-card">
          <div className="profile-header">
            <img
              src={user?.photoURL || "https://ui-avatars.com/api/?name=User"}
              alt="Profile"
            />
            <BsThreeDotsVertical className="menu-dots" />
          </div>
          <h2>{user?.displayName || "User"}</h2>
          <p className="role">Mercadona - Admin</p>
          <div className="social-links">{/* Add social icons here */}</div>
          <p className="bio">
            Minim dolor in amet nulla laboris enim dolore consequat proident...
          </p>
          <button className="view-profile">VIEW PROFILE</button>
        </div>

        <div className="team-section">
          <h3>Mercadona Users</h3>
          <p>Connect and message other Mercadona employees to gather info.</p>
          <div className="search-box">
            <input type="text" placeholder="Placeholder" />
          </div>
          <div className="team-list">
            <div className="team-member">
              <img
                src="https://ui-avatars.com/api/?name=Wade+Warren"
                alt="Wade Warren"
              />
              <div className="member-info">
                <h4>Wade Warren</h4>
                <p>Operations</p>
              </div>
              <button className="message-btn">MESSAGE</button>
            </div>
            <div className="team-member">
              <img
                src="https://ui-avatars.com/api/?name=Robert+Fox"
                alt="Robert Fox"
              />
              <div className="member-info">
                <h4>Robert Fox</h4>
                <p>Logistics</p>
              </div>
              <button className="message-btn">MESSAGE</button>
            </div>
          </div>
          <button className="team-page-btn">GO TO TEAM PAGE</button>
        </div>
      </aside>
    </div>
  );
};

export default DashboardHome;
