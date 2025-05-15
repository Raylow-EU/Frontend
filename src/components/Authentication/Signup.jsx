import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { registerUser, signInWithGoogle } from "../../store/thunks/authThunks";
import { User, Mail, Lock, AlertCircle } from "lucide-react";
import "./Signup.css";
import googleIcon from "../../assets/google.png";
import logo from "../../assets/logo.png";

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
      navigate("/dashboard");
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
    <div className="auth-page">
      <div className="auth-background">
        <div className="auth-dots"></div>
        <div className="auth-gradient"></div>
      </div>

      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="auth-logo">
            <img
              src={logo || "/placeholder.svg?height=32&width=32"}
              alt="Raylow Logo"
            />
            <span>RAYLOW</span>
          </Link>
        </div>

        <div className="auth-card">
          <div className="auth-card-content">
            <h1>Create an Account</h1>
            <p className="subtitle">Join us to simplify your CSRD compliance</p>

            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="fullName">Full name</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Creating Account..." : "Sign Up"}
              </button>

              <div className="divider">
                <span>or continue with</span>
              </div>

              <button
                type="button"
                className="google-btn"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <img src={googleIcon || "/placeholder.svg"} alt="Google" />
                Sign up with Google
              </button>

              <p className="auth-link">
                Already have an account? <Link to="/login">Log in</Link>
              </p>
            </form>
          </div>
        </div>

        <div className="auth-footer">
          <p>
            &copy; {new Date().getFullYear()} Raylow. All rights reserved.{" "}
            <Link to="/terms">Terms</Link> · <Link to="/privacy">Privacy</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
