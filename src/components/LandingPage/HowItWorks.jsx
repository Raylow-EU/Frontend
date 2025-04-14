import { useState } from "react";
import {
  Target,
  Zap,
  BarChart3,
  Bot,
  ChevronDown,
  Edit2,
  Trash2,
  Plus,
  Search,
  Filter,
  ArrowRight,
} from "lucide-react";
import "./HowItWorks.css";

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState("steps");

  const steps = [
    {
      icon: <Target size={24} />,
      title: "Create",
      description:
        "Design and launch compliant ESG reports quickly with pre-built templates and intuitive reporting tools.",
    },
    {
      icon: <Zap size={24} />,
      title: "Adjust",
      description:
        "Make adjustments to your reports as regulations evolve. Use real-time data to update your sustainability metrics.",
    },
    {
      icon: <BarChart3 size={24} />,
      title: "Analyze",
      description:
        "Gain comprehensive insights into your ESG performance with detailed analytics and automated reporting.",
    },
    {
      icon: <Bot size={24} />,
      title: "Automate",
      description:
        "Leverage AI-driven automation to continuously optimize your sustainability reporting. Automatically track compliance status.",
    },
  ];

  const reports = [
    {
      id: "4832930",
      name: "CSRD Annual Report",
      creator: "Alen Iverson",
      date: "13/05/2022",
      year: "2025",
      status: "Submitted",
    },
    {
      id: "3408923",
      name: "CSRD Q2 Review",
      creator: "Lebron James",
      date: "22/05/2022",
      year: "2025",
      status: "Submitted",
    },
    {
      id: "4920223",
      name: "CSRD Environmental Impact",
      creator: "Steph Curry",
      date: "15/06/2022",
      year: "2024",
      status: "In Process",
    },
    {
      id: "5823941",
      name: "CSRD Social Governance",
      creator: "Kevin Durant",
      date: "03/07/2022",
      year: "2024",
      status: "Cancelled",
    },
  ];

  return (
    <section className="how-it-works" id="how-it-works">
      <div className="section-background">
        <div className="section-dots"></div>
        <div className="section-gradient"></div>
      </div>

      <div className="section-container">
        <div className="section-header">
          <div className="section-badge">How it works</div>
          <h2>
            The most <span className="highlight">intuitive CSRD</span> solution
            in the market
          </h2>
          <p>
            Getting started with Raylow is as easy as 1-2-3. Our platform
            simplifies compliance while maximizing impact.
          </p>
        </div>

        <div className="section-tabs">
          <button
            className={`tab-button ${activeTab === "steps" ? "active" : ""}`}
            onClick={() => setActiveTab("steps")}
          >
            How It Works
          </button>
          <button
            className={`tab-button ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            Sample Reports
          </button>
        </div>

        {activeTab === "steps" && (
          <div className="steps-container">
            <div className="steps-grid">
              {steps.map((step, index) => (
                <div key={index} className="step-card">
                  <div className="step-number">{index + 1}</div>
                  <div className="step-icon">{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>

            <div className="steps-cta">
              <p>Ready to streamline your CSRD compliance?</p>
              <button className="get-started-btn">
                Get Started <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="reports-container">
            <div className="reports-header">
              <div className="reports-search">
                <Search size={18} />
                <input type="text" placeholder="Search reports..." />
              </div>

              <div className="reports-actions">
                <button className="filter-btn">
                  <Filter size={16} />
                  Filter
                </button>
                <button className="add-report-btn">
                  <Plus size={16} />
                  Add Report
                </button>
              </div>
            </div>

            <div className="reports-table-wrapper">
              <table className="reports-table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>File Name</th>
                    <th>Created By</th>
                    <th>Date</th>
                    <th>Year</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td>
                        <div className="report-id">{report.id}</div>
                      </td>
                      <td>
                        <div className="report-name">{report.name}</div>
                      </td>
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
                          <button className="edit-btn" aria-label="Edit report">
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="delete-btn"
                            aria-label="Delete report"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="reports-pagination">
              <button className="pagination-btn active">1</button>
              <button className="pagination-btn">2</button>
              <button className="pagination-btn">3</button>
              <button className="pagination-btn">
                <ChevronDown size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HowItWorks;
