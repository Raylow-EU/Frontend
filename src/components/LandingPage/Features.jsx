import { useState } from "react";
import {
  CheckCircle,
  BarChart2,
  TrendingUp,
  Users,
  Database,
  Shield,
  Zap,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import "./Features.css";

const Features = () => {
  // Sample data for the metrics
  const [activeTab, setActiveTab] = useState(0);

  const featureSections = [
    {
      id: "data-collection",
      title: "Gather & Centralize Data with One Click",
      description:
        "Automatically send reminders to departmental users and collect sustainability data from across your organization with a single action. Consolidate inputs from various departments into one centralized reporting hub.",
      features: [
        "Send automated data collection reminders to users",
        "Aggregate team inputs without manual coordination",
        "Track submissions and auto-follow up with non-responders",
      ],
      icon: <Database size={24} />,
      metrics: {
        title: "Data Collection Dashboard",
        stats: [
          {
            label: "Data Sources",
            value: "24",
            change: "+12%",
            icon: <Database size={16} />,
          },
          {
            label: "Departments",
            value: "8",
            change: "+2",
            icon: <Users size={16} />,
          },
          {
            label: "Completion",
            value: "92%",
            change: "+8%",
            icon: <CheckCircle size={16} />,
          },
        ],
        charts: [
          {
            type: "pie",
            title: "Data Sources",
            value: "92%",
            subtitle: "Completion Rate",
          },
          {
            type: "line",
            title: "Collection Trend",
            value: "+18%",
            subtitle: "vs. Last Quarter",
          },
        ],
      },
    },
    {
      id: "compliance-tracking",
      title: "Track Compliance Requirements Automatically",
      description:
        "Stay on top of changing CSRD regulations with our automated compliance tracking system. Receive alerts about upcoming deadlines and regulatory changes that affect your reporting requirements.",
      features: [
        "Real-time compliance status monitoring",
        "Automated alerts for regulatory changes",
        "Gap analysis to identify missing compliance elements",
      ],
      icon: <Shield size={24} />,
      metrics: {
        title: "Compliance Dashboard",
        stats: [
          {
            label: "Compliance Rate",
            value: "98%",
            change: "+5%",
            icon: <Shield size={16} />,
          },
          {
            label: "Requirements",
            value: "143",
            change: "+12",
            icon: <CheckCircle size={16} />,
          },
          {
            label: "Days to Deadline",
            value: "45",
            change: "",
            icon: <TrendingUp size={16} />,
          },
        ],
        charts: [
          {
            type: "pie",
            title: "Compliance Status",
            value: "98%",
            subtitle: "Requirements Met",
          },
          {
            type: "line",
            title: "Compliance Trend",
            value: "+5%",
            subtitle: "vs. Last Quarter",
          },
        ],
      },
    },
    {
      id: "performance-analytics",
      title: "Analyze ESG Performance with AI Insights",
      description:
        "Leverage advanced analytics and AI to gain deeper insights into your sustainability performance. Identify trends, benchmark against industry standards, and discover opportunities for improvement.",
      features: [
        "AI-powered performance analysis and recommendations",
        "Industry benchmarking and peer comparison",
        "Predictive analytics for future sustainability targets",
      ],
      icon: <BarChart2 size={24} />,
      metrics: {
        title: "Analytics Dashboard",
        stats: [
          {
            label: "Carbon Footprint",
            value: "1,245",
            change: "-12%",
            icon: <TrendingUp size={16} />,
          },
          {
            label: "Energy Usage",
            value: "845",
            change: "-8%",
            icon: <Zap size={16} />,
          },
          {
            label: "Water Usage",
            value: "3,210",
            change: "-5%",
            icon: <TrendingUp size={16} />,
          },
        ],
        charts: [
          {
            type: "pie",
            title: "Emissions by Scope",
            value: "77%",
            subtitle: "Scope 3 Emissions",
          },
          {
            type: "line",
            title: "Emissions Trend",
            value: "-12%",
            subtitle: "Year over Year",
          },
        ],
      },
    },
  ];

  const MetricsPreview = ({ metrics }) => (
    <div className="metrics-preview">
      <div className="metrics-card">
        <h4 className="metrics-title">{metrics.title}</h4>

        <div className="metrics-row">
          {metrics.stats.map((stat, i) => (
            <div key={i} className="metric-item">
              <div className="metric-header">
                <span className="metric-icon">{stat.icon}</span>
                {stat.change && (
                  <span
                    className={`percentage ${
                      stat.change.includes("+") ? "positive" : "negative"
                    }`}
                  >
                    {stat.change}
                  </span>
                )}
              </div>
              <div className="metric-details">
                <span className="number">{stat.value}</span>
                <span className="label">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="metrics-charts">
          <div className="pie-chart">
            <h5>{metrics.charts[0].title}</h5>
            <div className="chart-content">
              <div className="chart-circle">{metrics.charts[0].value}</div>
              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-dot primary"></span>
                  <span>{metrics.charts[0].subtitle}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="line-chart">
            <h5>{metrics.charts[1].title}</h5>
            <div className="chart-value">{metrics.charts[1].value}</div>
            <div className="chart-subtitle">{metrics.charts[1].subtitle}</div>
            <div className="chart-graph">
              <div className="chart-line"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="features" id="features">
      <div className="section-background">
        <div className="section-dots"></div>
        <div className="section-gradient"></div>
      </div>

      <div className="features-container">
        <div className="features-header">
          <div className="section-badge">Features</div>
          <h2>
            <span className="highlight">Save 2+ hours/week</span> with Raylow
          </h2>
          <p>
            Save countless hours on manual data entry and aggregate all the
            sustainability data you need to focus on compliance easily
          </p>
        </div>

        <div className="features-tabs">
          {featureSections.map((section, index) => (
            <button
              key={section.id}
              className={`feature-tab ${activeTab === index ? "active" : ""}`}
              onClick={() => setActiveTab(index)}
            >
              <span className="tab-icon">{section.icon}</span>
              <span className="tab-text">{section.title}</span>
            </button>
          ))}
        </div>

        <div className="features-content-wrapper">
          {featureSections.map((section, index) => (
            <div
              key={section.id}
              className={`features-content ${
                activeTab === index ? "active" : ""
              } ${index % 2 === 1 ? "image-first" : ""}`}
            >
              <div className="features-text">
                <div className="feature-icon-large">{section.icon}</div>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
                <ul className="features-list">
                  {section.features.map((feature, idx) => (
                    <li key={idx}>
                      <span className="check-icon">
                        <CheckCircle size={18} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className="learn-more-btn">
                  Learn more <ChevronRight size={16} />
                </button>
              </div>
              <MetricsPreview metrics={section.metrics} />
            </div>
          ))}
        </div>

        <div className="features-cta">
          <div className="cta-content">
            <h3>Ready to streamline your CSRD reporting?</h3>
            <p>
              Join hundreds of companies already using Raylow to simplify their
              sustainability reporting process.
            </p>
            <button className="see-all-features-btn">
              See all features <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
