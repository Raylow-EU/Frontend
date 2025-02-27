import { useState } from "react";
import "./Login.css";
import googleIcon from "../../assets/google.png";

const Login = () => {
  const [formData, setFormData] = useState({
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
    // Firebase login logic will go here
  };

  return (
    <div className="login-container">
      <h1>Welcome Back</h1>
      <p className="subtitle">Log in to your account to continue</p>

      <form onSubmit={handleSubmit}>
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
          Log In
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <button type="button" className="google-btn">
          <img src={googleIcon} alt="Google" />
          Log in with Google
        </button>

        <p className="signup-link">
          Don&apos;t have an account? <a href="/signup">Sign up</a>
        </p>
      </form>
    </div>
  );
};

export default Login;
