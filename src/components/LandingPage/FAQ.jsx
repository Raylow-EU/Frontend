import { useState } from "react";
import { ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import "./FAQ.css";

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: "What is CSRD compliance and why is it important?",
      answer:
        "The Corporate Sustainability Reporting Directive (CSRD) is an EU regulation requiring companies to report on their environmental and social impact. It's important because it promotes transparency, helps investors make informed decisions, and encourages companies to adopt sustainable practices. Non-compliance can result in significant penalties and reputational damage.",
    },
    {
      question: "How does Raylow simplify CSRD reporting?",
      answer:
        "Raylow simplifies CSRD reporting through automated data collection, centralized reporting tools, and AI-powered insights. Our platform streamlines the entire process from gathering data across departments to generating compliant reports. We also provide real-time compliance tracking and updates on regulatory changes, reducing the time and resources needed for reporting by up to 50%.",
    },
    {
      question: "Who needs to use Raylow's CSRD compliance solution?",
      answer:
        "Raylow is designed for companies subject to CSRD requirements, including EU-based companies with more than 250 employees, €40 million in revenue, or €20 million in assets. It's also valuable for non-EU companies with significant operations in the EU, sustainability teams, ESG managers, compliance officers, and executives responsible for sustainability reporting.",
    },
    {
      question: "How long does it take to implement Raylow?",
      answer:
        "Most companies can implement Raylow and start using it effectively within 2-4 weeks. Our onboarding process includes data integration, user training, and customization to your specific reporting needs. We provide dedicated support throughout the implementation process to ensure a smooth transition and quick time-to-value.",
    },
    {
      question: "Can Raylow integrate with our existing systems?",
      answer:
        "Yes, Raylow is designed to integrate seamlessly with your existing systems including ERP software, data management platforms, and sustainability tools. We offer pre-built connectors for popular systems like SAP, Oracle, Salesforce, and Microsoft Dynamics, as well as custom API integrations for specialized systems.",
    },
    {
      question: "What kind of support does Raylow provide?",
      answer:
        "Raylow provides comprehensive support including dedicated customer success managers, technical support, and regular training sessions. We offer 24/7 technical assistance, monthly check-ins with your success manager, quarterly business reviews, and access to our knowledge base and community forum. Our regulatory experts also provide updates on CSRD requirements and best practices.",
    },
  ];

  return (
    <section className="faq-section" id="faq">
      <div className="section-background">
        <div className="section-dots"></div>
        <div className="section-gradient"></div>
      </div>

      <div className="faq-container">
        <div className="faq-header">
          <div className="section-badge">FAQ</div>
          <h2>Frequently Asked Questions</h2>
          <p>
            Find answers to common questions about CSRD compliance and how
            Raylow can help your organization.
          </p>
        </div>

        <div className="faq-content">
          <div className="faq-accordion">
            {faqItems.map((item, index) => (
              <div
                key={index}
                className={`accordion-item ${
                  activeIndex === index ? "active" : ""
                }`}
                onClick={() => toggleAccordion(index)}
              >
                <div className="accordion-header">
                  <h3>{item.question}</h3>
                  <span className="accordion-icon">
                    {activeIndex === index ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </span>
                </div>
                <div
                  className={`accordion-content ${
                    activeIndex === index ? "open" : ""
                  }`}
                >
                  <p>{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="faq-cta">
          <div className="cta-card">
            <div className="cta-icon">
              <MessageCircle size={28} />
            </div>
            <h3>Still have questions?</h3>
            <p>
              Our team is ready to answer any questions you may have about CSRD
              compliance and our platform.
            </p>
            <button className="contact-btn">Contact Us</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
