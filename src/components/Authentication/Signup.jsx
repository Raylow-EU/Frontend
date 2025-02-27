import { useState } from "react";
import "./Signup.css";
import googleIcon from "../../assets/google.png"; // You'll need to add this icon

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Firebase signup logic will go here
  };

  return (
    <div className="signup-container">
      <h1>Create an Account</h1>
      <p className="subtitle">Are you ready to join us!</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full name</label>
          <input
            type="text"
            name="fullName"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            placeholder="email@gmail.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="submit-btn">
          Sign-In
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <button type="button" className="google-btn">
          <img src={googleIcon} alt="Google" />
          Log in with Google
        </button>

        <p className="login-link">
          Already have an account! <a href="/login">Log-in</a>
        </p>
      </form>
    </div>
  );
};

export default Signup;
