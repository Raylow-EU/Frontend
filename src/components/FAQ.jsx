import { useState } from "react";
import "./FAQ.css";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What features does Raylow offer?",
      answer:
        "Raylow offers comprehensive CSRD reporting features including automated data collection, real-time analytics, and AI-powered optimization tools.",
    },
    {
      question:
        "Can I import data from other tools and platforms I'm already using?",
      answer:
        "Yes, Raylow supports seamless integration with various data sources and platforms, making it easy to import and consolidate your existing data.",
    },
    {
      question:
        "What kind of support and training resources does Raylow provide?",
      answer:
        "We provide comprehensive documentation, video tutorials, dedicated customer support, and personalized training sessions for your team.",
    },
    {
      question: "How does Raylow ensure the security and privacy of my data?",
      answer:
        "Raylow implements enterprise-grade security measures, including end-to-end encryption, regular security audits, and compliance with GDPR and other privacy regulations.",
    },
  ];

  return (
    <section className="faq">
      <h2>Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`faq-item ${openIndex === index ? "open" : ""}`}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <div className="faq-question">
              <h3>{faq.question}</h3>
              <span className="faq-icon">
                {openIndex === index ? "-" : "+"}
              </span>
            </div>
            <div className="faq-answer">
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
