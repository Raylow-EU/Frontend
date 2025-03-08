import { useState } from "react";
import { useSelector } from "react-redux";
import "./Settings.css";
import { BsQuestionCircle } from "react-icons/bs";
import defaultAvatar from "../../assets/default-avatar.png";

const Settings = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    username: user?.displayName || "",
    phoneNumber: "",
    countryCode: "+34",
    biography:
      "Hi there! 👋 I handle the reporting submission for the company. Please feel free to message me in case of any doubts.",
    profilePicture: user?.photoURL || defaultAvatar,
    emailNotification: false,
    soundNotification: true,
    // Company tab fields
    companyName: "",
    industry: "",
    employees: "",
    address: "",
    // General tab fields
    language: "english",
    theme: "light",
    autoSave: true,
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      // Show success message
      alert("Settings saved successfully");
    }, 1000);
  };

  // Handle profile picture change
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profilePicture: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile picture delete
  const handleDeleteProfilePicture = () => {
    setFormData((prev) => ({
      ...prev,
      profilePicture: defaultAvatar,
    }));
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <div className="settings-search">
          <input
            type="text"
            placeholder="Search settings..."
            className="settings-search-input"
          />
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-tabs">
          <button
            className={`tab-button ${activeTab === "general" ? "active" : ""}`}
            onClick={() => setActiveTab("general")}
          >
            General
          </button>
          <button
            className={`tab-button ${activeTab === "company" ? "active" : ""}`}
            onClick={() => setActiveTab("company")}
          >
            Company
          </button>
          <button
            className={`tab-button ${activeTab === "account" ? "active" : ""}`}
            onClick={() => setActiveTab("account")}
          >
            Account
            <span className="tab-notification">3</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === "general" && (
            <div className="settings-section">
              <div className="settings-group">
                <h2>Preferences</h2>
                <p className="settings-description">
                  Choose your preferences for the application
                </p>

                <div className="form-row">
                  <div className="form-group">
                    <div className="form-field">
                      <label>Language</label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                      >
                        <option value="english">English</option>
                        <option value="spanish">Spanish</option>
                        <option value="french">French</option>
                        <option value="german">German</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="form-field">
                      <label>Theme</label>
                      <select
                        name="theme"
                        value={formData.theme}
                        onChange={handleChange}
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System Default</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <div className="form-field checkbox-field">
                      <input
                        type="checkbox"
                        id="autoSave"
                        name="autoSave"
                        checked={formData.autoSave}
                        onChange={handleChange}
                      />
                      <div>
                        <label htmlFor="autoSave">
                          Auto-save draft reports
                        </label>
                        <p className="form-hint">
                          Your reports will be automatically saved as drafts
                          every 2 minutes
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <h2>Export & Data</h2>
                <p className="settings-description">
                  Manage your data and export options
                </p>

                <div className="form-row">
                  <div className="form-group full-width">
                    <div className="settings-card">
                      <div>
                        <h3>Export Personal Data</h3>
                        <p>Download all your data in a CSV or JSON format</p>
                      </div>
                      <button type="button" className="secondary-button">
                        Export
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <div className="settings-card danger">
                      <div>
                        <h3>Delete Account</h3>
                        <p>
                          Permanently delete your account and all associated
                          data
                        </p>
                      </div>
                      <button type="button" className="danger-button">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "company" && (
            <div className="settings-section">
              <div className="settings-group">
                <h2>Company Information</h2>
                <p className="settings-description">
                  Update your company details
                </p>

                <div className="form-row">
                  <div className="form-group">
                    <div className="form-field">
                      <label>
                        Company Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Raylow Technologies"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="form-field">
                      <label>Industry</label>
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                      >
                        <option value="" disabled selected>
                          Select industry
                        </option>
                        <option value="technology">Technology</option>
                        <option value="finance">Finance</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="retail">Retail</option>
                        <option value="energy">Energy</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <div className="form-field">
                      <label>Number of Employees</label>
                      <select
                        name="employees"
                        value={formData.employees}
                        onChange={handleChange}
                      >
                        <option value="" disabled selected>
                          Select range
                        </option>
                        <option value="1-10">1-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-200">51-200</option>
                        <option value="201-500">201-500</option>
                        <option value="501-1000">501-1000</option>
                        <option value="1000+">1000+</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="form-field">
                      <label>Company Website</label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://raylow.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <div className="form-field">
                      <label>Company Address</label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter your company's address"
                        rows="3"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <h2>Compliance Settings</h2>
                <p className="settings-description">
                  Configure your compliance reporting settings
                </p>

                <div className="form-row">
                  <div className="form-group full-width">
                    <div className="form-field checkbox-field">
                      <input
                        type="checkbox"
                        id="csrdCompliance"
                        name="csrdCompliance"
                        checked={formData.csrdCompliance}
                        onChange={handleChange}
                      />
                      <div>
                        <label htmlFor="csrdCompliance">
                          CSRD Compliance Required
                        </label>
                        <p className="form-hint">
                          Enable this if your company is subject to Corporate
                          Sustainability Reporting Directive
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <div className="form-field checkbox-field">
                      <input
                        type="checkbox"
                        id="sfdrCompliance"
                        name="sfdrCompliance"
                        checked={formData.sfdrCompliance}
                        onChange={handleChange}
                      />
                      <div>
                        <label htmlFor="sfdrCompliance">
                          SFDR Compliance Required
                        </label>
                        <p className="form-hint">
                          Enable this if your company is subject to Sustainable
                          Finance Disclosure Regulation
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="settings-section">
              <div className="settings-group">
                <h2>Your Profile</h2>
                <p className="settings-description">
                  Please update your profile settings here
                </p>

                <div className="form-row">
                  <div className="form-group">
                    <div className="form-field">
                      <label>Username</label>
                      <div className="username-field">
                        <span className="domain-prefix">raylow.com/</span>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleChange}
                          placeholder="username"
                          className="username-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <div className="form-field">
                      <label>Phone Number</label>
                      <div className="phone-field">
                        <select
                          className="country-code"
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleChange}
                        >
                          <option value="+1">🇺🇸 +1</option>
                          <option value="+44">🇬🇧 +44</option>
                          <option value="+34">🇪🇸 +34</option>
                          <option value="+49">🇩🇪 +49</option>
                          <option value="+33">🇫🇷 +33</option>
                        </select>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          placeholder="672 008 998"
                          className="phone-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <div className="profile-picture-container">
                      <label>Profile Picture</label>
                      <div className="profile-picture-wrapper">
                        <img
                          src={formData.profilePicture}
                          alt="Profile"
                          className="profile-picture"
                        />
                        <div className="profile-picture-actions">
                          <label className="profile-edit-button">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProfilePictureChange}
                              style={{ display: "none" }}
                            />
                            Edit
                          </label>
                          <button
                            type="button"
                            className="profile-delete-button"
                            onClick={handleDeleteProfilePicture}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <div className="form-field">
                      <div className="biography-header">
                        <label>Biography</label>
                        <BsQuestionCircle
                          className="info-icon"
                          title="Tell other users about yourself"
                        />
                      </div>
                      <textarea
                        name="biography"
                        value={formData.biography}
                        onChange={handleChange}
                        placeholder="Tell others about yourself..."
                        rows="4"
                      ></textarea>
                      <div className="character-count">
                        {325 - formData.biography.length} characters remaining
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <h2>Notifications</h2>
                <p className="settings-description">
                  Configure how you receive notifications
                </p>

                <div className="form-row">
                  <div className="form-group full-width">
                    <div className="notification-option">
                      <div className="toggle-wrapper">
                        <input
                          type="checkbox"
                          id="emailNotification"
                          className="toggle-input"
                          name="emailNotification"
                          checked={formData.emailNotification}
                          onChange={handleChange}
                        />
                        <label
                          htmlFor="emailNotification"
                          className="toggle-label"
                        ></label>
                      </div>
                      <div className="notification-text">
                        <h3>Email Notification</h3>
                        <p>You will be notified when a new email arrives.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <div className="notification-option">
                      <div className="toggle-wrapper">
                        <input
                          type="checkbox"
                          id="soundNotification"
                          className="toggle-input"
                          name="soundNotification"
                          checked={formData.soundNotification}
                          onChange={handleChange}
                        />
                        <label
                          htmlFor="soundNotification"
                          className="toggle-label"
                        ></label>
                      </div>
                      <div className="notification-text">
                        <h3>Sound Notification</h3>
                        <p>
                          You will be notified with sound when someone messages
                          you.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="settings-actions">
            <button type="button" className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="save-button" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
