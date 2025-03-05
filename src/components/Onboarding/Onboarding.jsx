import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { saveOnboardingData } from "../../firebase/onboardingService";
import "./Onboarding.css";

const Onboarding = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    companySize: "",
    industry: "",
    sustainability_goals: [],
    previous_reporting: false,
  });

  // Questions for each step
  const steps = [
    {
      title: "Welcome to Raylow",
      fields: [
        {
          name: "companyName",
          label: "What's your company name?",
          type: "text",
          placeholder: "Enter company name",
          required: true,
        },
      ],
    },
    {
      title: "Tell us about your company",
      fields: [
        {
          name: "companySize",
          label: "Company size",
          type: "select",
          options: [
            { value: "", label: "Select company size" },
            { value: "1-10", label: "1-10 employees" },
            { value: "11-50", label: "11-50 employees" },
            { value: "51-200", label: "51-200 employees" },
            { value: "201-1000", label: "201-1000 employees" },
            { value: "1000+", label: "1000+ employees" },
          ],
          required: true,
        },
        {
          name: "industry",
          label: "Industry",
          type: "select",
          options: [
            { value: "", label: "Select industry" },
            { value: "technology", label: "Technology" },
            { value: "manufacturing", label: "Manufacturing" },
            { value: "retail", label: "Retail" },
            { value: "healthcare", label: "Healthcare" },
            { value: "finance", label: "Finance" },
            { value: "education", label: "Education" },
            { value: "other", label: "Other" },
          ],
          required: true,
        },
      ],
    },
    {
      title: "Sustainability Goals",
      fields: [
        {
          name: "sustainability_goals",
          label: "What are your sustainability reporting goals?",
          type: "checkbox",
          options: [
            { value: "csrd_compliance", label: "CSRD Compliance" },
            { value: "carbon_reduction", label: "Carbon Reduction" },
            {
              value: "sustainability_strategy",
              label: "Sustainability Strategy",
            },
            { value: "stakeholder_reporting", label: "Stakeholder Reporting" },
            { value: "supply_chain", label: "Supply Chain Assessment" },
          ],
        },
        {
          name: "previous_reporting",
          label: "Have you done sustainability reporting before?",
          type: "radio",
          options: [
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ],
        },
      ],
    },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      // Handle checkboxes (multiple selection)
      if (checked) {
        setFormData({
          ...formData,
          [name]: [...(formData[name] || []), value],
        });
      } else {
        setFormData({
          ...formData,
          [name]: formData[name].filter((item) => item !== value),
        });
      }
    } else {
      // Handle other input types
      setFormData({
        ...formData,
        [name]: type === "radio" ? value === "true" : value,
      });
    }
  };

  const handleNext = () => {
    // Basic validation before proceeding
    const currentStepData = steps[currentStep];
    const requiredFields = currentStepData.fields.filter(
      (field) => field.required
    );

    const isValid = requiredFields.every((field) => {
      if (Array.isArray(formData[field.name])) {
        return formData[field.name].length > 0;
      }
      return !!formData[field.name];
    });

    if (!isValid) {
      alert("Please fill out all required fields before continuing.");
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?.uid) {
      alert("User not authenticated");
      return;
    }

    setLoading(true);
    try {
      await saveOnboardingData(user.uid, formData);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      alert("There was an error saving your information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            id={field.name}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleInputChange}
            placeholder={field.placeholder}
            required={field.required}
            className="onboarding-input"
          />
        );
      case "select":
        return (
          <select
            id={field.name}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={handleInputChange}
            required={field.required}
            className="onboarding-select"
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case "checkbox":
        return (
          <div className="checkbox-group">
            {field.options.map((option) => (
              <label key={option.value} className="checkbox-label">
                <input
                  type="checkbox"
                  name={field.name}
                  value={option.value}
                  checked={
                    formData[field.name]?.includes(option.value) || false
                  }
                  onChange={handleInputChange}
                />
                {option.label}
              </label>
            ))}
          </div>
        );
      case "radio":
        return (
          <div className="radio-group">
            {field.options.map((option) => (
              <label key={option.value.toString()} className="radio-label">
                <input
                  type="radio"
                  name={field.name}
                  value={option.value.toString()}
                  checked={formData[field.name] === option.value}
                  onChange={handleInputChange}
                />
                {option.label}
              </label>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <div className="onboarding-progress">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`progress-step ${
                index <= currentStep ? "active" : ""
              }`}
              onClick={() => index < currentStep && setCurrentStep(index)}
            >
              {index + 1}
            </div>
          ))}
        </div>

        <h1>{currentStepData.title}</h1>
        <div className="onboarding-form">
          {currentStepData.fields.map((field) => (
            <div key={field.name} className="form-group">
              <label htmlFor={field.name}>{field.label}</label>
              {renderField(field)}
            </div>
          ))}
        </div>

        <div className="onboarding-actions">
          {currentStep > 0 && (
            <button
              className="back-btn"
              onClick={handleBack}
              disabled={loading}
            >
              Back
            </button>
          )}
          <button className="next-btn" onClick={handleNext} disabled={loading}>
            {currentStep === steps.length - 1 ? "Complete" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
