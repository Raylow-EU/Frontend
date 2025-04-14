import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../../assets/logo.png";
import "./Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className={`landing-navbar ${scrolled ? "navbar-scrolled" : ""}`}>
      <div className="landing-navbar-container">
        <div className="landing-navbar-logo">
          <Link to="/" aria-label="Home">
            <img
              src={logo || "/placeholder.svg"}
              alt=""
              className="landing-logo-img"
            />
            <span className="landing-logo">RAYLOW</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="landing-navbar-desktop">
          <div className="landing-navbar-links">
            {[
              { to: "/about", label: "About" },
              { to: "/contact", label: "Contact" },
              { to: "/docs", label: "Docs" },
              { to: "/blog", label: "Blog" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={isActive(link.to) ? "active-link" : ""}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="landing-navbar-auth">
            <Link to="/login">
              <button className="landing-login-btn">Log in</button>
            </Link>
            <Link to="/signup">
              <button className="landing-signup-btn">Sign up</button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="landing-mobile-menu-btn"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={`landing-mobile-menu ${isMenuOpen ? "menu-open" : ""}`}>
        <div className="landing-mobile-links">
          {[
            { to: "/about", label: "About" },
            { to: "/contact", label: "Contact" },
            { to: "/docs", label: "Docs" },
            { to: "/blog", label: "Blog" },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={isActive(link.to) ? "active-link" : ""}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="landing-mobile-auth">
            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
              <button className="landing-login-btn">Log in</button>
            </Link>
            <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
              <button className="landing-signup-btn">Sign up</button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
