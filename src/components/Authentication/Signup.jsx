import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUser, signInWithGoogle } from "../../store/thunks/authThunks";
import "./Signup.css";
import googleIcon from "../../assets/google.png"; // You'll need to add this icon

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(registerUser(formData)).unwrap();
      navigate("/dashboard"); // Navigate to dashboard after successful signup
    } catch (error) {
      console.error("Signup failed:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await dispatch(signInWithGoogle()).unwrap();
      navigate("/dashboard");
    } catch (error) {
      console.error("Google signin failed:", error);
    }
  };

  return (
    <div className="signup-container">
      <h1>Create an Account</h1>
      <p className="subtitle">Are you ready to join us!</p>
      {error && <div className="error-message">{error}</div>}

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

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <div className="divider">
          <span>or</span>
        </div>

        <button
          type="button"
          className="google-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <img src={googleIcon} alt="Google" />
          Sign up with Google
        </button>

        <p className="login-link">
          Already have an account! <a href="/login">Log-in</a>
        </p>
      </form>
    </div>
  );
};

export default Signup;
