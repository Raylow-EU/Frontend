import "./Navbar.css";
import logo from "../../assets/logo.png"; // Make sure the path matches your logo location
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">
          <img src={logo} alt="Raylow Logo" className="logo-img" />
          <span className="logo">RAYLOW</span>
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
        <Link to="/docs">Docs</Link>
        <Link to="/blog">Blog</Link>
      </div>
      <div className="navbar-auth">
        <Link to="/login">
          <button className="login-btn">Log in</button>
        </Link>
        <Link to="/signup">
          <button className="signup-btn">Sign up</button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
