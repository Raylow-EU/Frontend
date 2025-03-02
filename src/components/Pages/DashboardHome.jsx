import { useSelector } from "react-redux";
import { FaShoppingCart } from "react-icons/fa";
import PropTypes from "prop-types";

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
    <>
      <header className="main-header">
        <div>
          <h1>Hello, {user?.displayName || "User"}</h1>
          <p>Welcome to the Dashboard portal. You can find everything here.</p>
        </div>
        <div className="date">15, September 2025</div>
      </header>

      <div className="stats-grid">
        <StatCard value="2403" label="Total Sales" change="4.35" />
        <StatCard value="2403" label="Total Sales" change="4.35" />
        <StatCard value="2403" label="Total Sales" change="4.35" />
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
    </>
  );
};

export default DashboardHome;
