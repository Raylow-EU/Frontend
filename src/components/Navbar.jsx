import "./Navbar.css";
import logo from "../assets/logo.png"; // Make sure the path matches your logo location

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Raylow Logo" className="logo-img" />
        <span className="logo">RAYLOW</span>
      </div>
      <div className="navbar-links">
        <a href="#about">About</a>
        <a href="#contact">Contact</a>
        <a href="#docs">Docs</a>
        <a href="#blog">Blog</a>
      </div>
      <div className="navbar-auth">
        <button className="login-btn">Log in</button>
        <button className="signup-btn">Sign up</button>
      </div>
    </nav>
  );
};

export default Navbar;
