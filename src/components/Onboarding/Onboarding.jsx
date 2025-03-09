import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { saveOnboardingData } from "../../firebase/onboardingService";
import "./Onboarding.css";
import { BsCheckCircleFill } from "react-icons/bs";

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
      description:
        "Let's set up your account in just a few simple steps. First, tell us about your company.",
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
      description: "This information helps us personalize your experience.",
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
            { value: "", label: "Select your industry" },
            { value: "technology", label: "Technology" },
            { value: "manufacturing", label: "Manufacturing" },
            { value: "retail", label: "Retail" },
            { value: "healthcare", label: "Healthcare" },
            { value: "finance", label: "Finance" },
            { value: "energy", label: "Energy" },
            { value: "education", label: "Education" },
            { value: "other", label: "Other" },
          ],
          required: true,
        },
      ],
    },
    {
      title: "Sustainability Goals",
      description:
        "Select the areas you're focusing on for sustainability reporting.",
      fields: [
        {
          name: "sustainability_goals",
          label:
            "Which sustainability goals are most important to your organization?",
          type: "checkbox",
          options: [
            { value: "carbon_reduction", label: "Carbon Reduction" },
            { value: "waste_management", label: "Waste Management" },
            { value: "water_conservation", label: "Water Conservation" },
            { value: "social_responsibility", label: "Social Responsibility" },
            { value: "supply_chain", label: "Sustainable Supply Chain" },
          ],
          required: true,
        },
      ],
    },
    {
      title: "Previous Reporting Experience",
      description:
        "Let us know about your reporting history to better tailor our service.",
      fields: [
        {
          name: "previous_reporting",
          label: "Have you published sustainability reports before?",
          type: "radio",
          options: [
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ],
          required: true,
        },
      ],
    },
  ];

  const handleInputChange = (e) => {
    const { name, type, value, checked } = e.target;

    // Handle checkbox groups (multi-select)
    if (type === "checkbox") {
      if (checked) {
        // Add to array if checked
        setFormData({
          ...formData,
          [name]: [...(formData[name] || []), value],
        });
      } else {
        // Remove from array if unchecked
        setFormData({
          ...formData,
          [name]: formData[name].filter((item) => item !== value),
        });
      }
    } else if (type === "radio") {
      // Handle radio buttons - convert string "true"/"false" to actual boolean values
      setFormData({
        ...formData,
        [name]: value === "true",
      });
    } else {
      // Handle other input types
      setFormData({
        ...formData,
        [name]: value,
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
      // For boolean values (like radio buttons with false value), we need a special check
      return formData[field.name] !== undefined && formData[field.name] !== "";
    });

    if (!isValid) {
      alert("Please fill out all required fields before continuing.");
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
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

      // Better error messaging based on error type
      if (error.code === "permission-denied") {
        alert(
          "You don't have permission to complete onboarding. This might be due to Firestore security rules. Please contact your administrator."
        );
      } else {
        alert(
          "There was an error saving your information. Please try again or contact support if the issue persists."
        );
      }
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
                  value={option.value}
                  checked={formData[field.name] === option.value}
                  onChange={handleInputChange}
                  required={field.required}
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
          {steps.map((step, index) => (
            <div
              key={index}
              className={`progress-step ${
                index === currentStep ? "active" : ""
              } ${index < currentStep ? "completed" : ""}`}
              onClick={() => index < currentStep && setCurrentStep(index)}
              data-title={steps[index].title}
            >
              {index < currentStep ? (
                <BsCheckCircleFill size={16} />
              ) : (
                index + 1
              )}
            </div>
          ))}
        </div>

        <h1>{currentStepData.title}</h1>
        {currentStepData.description && (
          <p className="step-description">{currentStepData.description}</p>
        )}

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
            {loading
              ? "Processing..."
              : currentStep === steps.length - 1
              ? "Complete Setup"
              : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
