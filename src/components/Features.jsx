import "./Features.css";
import DashboardMetrics from "../assets/dashboard.png"; // You'll need to add this image

const Features = () => {
  const featureSections = [
    {
      title: "Gather & Centralize Data with one click",
      description:
        "Automatically send reminders to departmental users and collect sustainability data from across your organization with a single action. Consolidate inputs from various departments into one centralized reporting hub.",
      features: [
        "Send automated data collection reminders to users",
        "Aggregate team inputs without manual coordination",
        "Track submissions and auto-follow up with non-responders",
      ],
      imageFirst: false,
    },
    {
      title: "Gather & Centralize Data with one click",
      description:
        "Automatically send reminders to departmental users and collect sustainability data from across your organization with a single action. Consolidate inputs from various departments into one centralized reporting hub.",
      features: [
        "Send automated data collection reminders to users",
        "Aggregate team inputs without manual coordination",
        "Track submissions and auto-follow up with non-responders",
      ],
      imageFirst: true,
    },
    {
      title: "Gather & Centralize Data with one click",
      description:
        "Automatically send reminders to departmental users and collect sustainability data from across your organization with a single action. Consolidate inputs from various departments into one centralized reporting hub.",
      features: [
        "Send automated data collection reminders to users",
        "Aggregate team inputs without manual coordination",
        "Track submissions and auto-follow up with non-responders",
      ],
      imageFirst: true,
    },
  ];

  const MetricsPreview = () => (
    <div className="metrics-preview">
      <div className="metrics-card">
        <div className="metrics-row">
          {[1, 2, 3].map((i) => (
            <div key={i} className="metric-item">
              <div className="metric-header">
                <span className="cart-icon">🛒</span>
                <span className="percentage">4.35% ↑</span>
              </div>
              <div className="metric-details">
                <span className="number">2403</span>
                <span className="label">Total Sales</span>
              </div>
            </div>
          ))}
        </div>

        <div className="metrics-charts">
          <div className="pie-chart">
            <h4>Emissions by Scope</h4>
            <div className="chart-content">
              <div className="chart-circle">77%</div>
              <div className="chart-legend">
                <span className="legend-dot"></span>
                <span>1500 MTCO2</span>
              </div>
            </div>
          </div>

          <div className="line-chart">
            <h4>Emissions over the years</h4>
            <div className="chart-value">-2.145%</div>
            <div className="chart-graph"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section className="features">
      <div className="features-header">
        <button className="features-btn">Features</button>
        <h2>
          <span className="highlight">Save 2+ hours/week</span> with Raylow
        </h2>
        <p>
          Save countless hours on manual data entry and aggregate all the
          sustainability data you need to focus on compliance easily
        </p>
      </div>

      {featureSections.map((section, index) => (
        <div
          key={index}
          className={`features-content ${
            section.imageFirst ? "image-first" : ""
          }`}
        >
          {section.imageFirst ? (
            <>
              <MetricsPreview />
              <div className="features-text">
                <h3>{section.title}</h3>
                <p>{section.description}</p>
                <ul className="features-list">
                  {section.features.map((feature, idx) => (
                    <li key={idx}>
                      <span className="check-icon">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="features-text">
                <h3>{section.title}</h3>
                <p>{section.description}</p>
                <ul className="features-list">
                  {section.features.map((feature, idx) => (
                    <li key={idx}>
                      <span className="check-icon">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <MetricsPreview />
            </>
          )}
        </div>
      ))}

      <div className="features-cta">
        <button className="see-all-features-btn">See all features</button>
      </div>
    </section>
  );
};

export default Features;
