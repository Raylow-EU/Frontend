import "./HowItWorks.css";

const HowItWorks = () => {
  const steps = [
    {
      icon: "🎯",
      title: "Create",
      description:
        "Design and launch compliant ESG reports quickly with pre-built templates and intuitive reporting tools.",
    },
    {
      icon: "⚡",
      title: "Adjust",
      description:
        "Make adjustments to your reports as regulations evolve. Use real-time data to update your sustainability metrics.",
    },
    {
      icon: "📊",
      title: "Analyze",
      description:
        "Gain comprehensive insights into your ESG performance with detailed analytics and automated reporting.",
    },
    {
      icon: "🤖",
      title: "Automate",
      description:
        "Leverage AI-driven automation to continuously optimize your sustainability reporting. Automatically track compliance status.",
    },
  ];

  const reports = [
    {
      id: "4832930",
      name: "CSRD recent",
      creator: "Alen Iverson",
      date: "13/05/2022",
      year: "2025",
      status: "Submitted",
    },
    {
      id: "3408923",
      name: "CSRD test",
      creator: "Lebron",
      date: "22/05/2022",
      year: "2025",
      status: "Submitted",
    },
    {
      id: "4920223",
      name: "CSRD trial",
      creator: "Steph",
      date: "15/06/2022",
      year: "2024",
      status: "In Process",
    },
    // Add more reports as needed
  ];

  return (
    <section className="how-it-works">
      <div className="section-header">
        <button className="how-it-works-btn">How it works</button>
        <h2>
          The most <span className="highlight">intuitive CSRD</span> solution in
          the market
        </h2>
        <p>Getting started with Raylow is as easy as 1-2-3.</p>
      </div>

      <div className="steps-grid">
        {steps.map((step, index) => (
          <div key={index} className="step-card">
            <div className="step-icon">{step.icon}</div>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>

      <div className="reports-preview">
        <div className="reports-header">
          <h3 className="reports-title">CSRD Reports</h3>
          <button className="add-report-btn">
            <span>+</span> Add Report
          </button>
        </div>
        <table className="reports-table">
          <thead>
            <tr>
              <th>Report ID</th>
              <th>File Name</th>
              <th>Created By</th>
              <th>Date</th>
              <th>Reporting Year</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.id}</td>
                <td>{report.name}</td>
                <td>{report.creator}</td>
                <td>{report.date}</td>
                <td>{report.year}</td>
                <td>
                  <span
                    className={`status-badge status-${report.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {report.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button>Edit</button>
                    <button>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default HowItWorks;
