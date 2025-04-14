import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ArrowRight,
} from "lucide-react";
import "./Footer.css";
import logo from "../../assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-background">
        <div className="footer-dots"></div>
        <div className="footer-gradient"></div>
      </div>

      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <img
                src={logo || "/placeholder.svg?height=40&width=40"}
                alt="Raylow Logo"
              />
              <span>RAYLOW</span>
            </div>
            <p>
              Simplifying CSRD compliance with AI-powered sustainability
              reporting solutions. Save time, ensure compliance, and make a
              positive impact.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="#" aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-links-column">
              <h3>Product</h3>
              <ul>
                <li>
                  <a href="#">Features</a>
                </li>
                <li>
                  <a href="#">Pricing</a>
                </li>
                <li>
                  <a href="#">Case Studies</a>
                </li>
                <li>
                  <a href="#">Reviews</a>
                </li>
                <li>
                  <a href="#">Updates</a>
                </li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h3>Company</h3>
              <ul>
                <li>
                  <a href="#">About Us</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
                <li>
                  <a href="#">Press</a>
                </li>
                <li>
                  <a href="#">Partners</a>
                </li>
                <li>
                  <a href="#">Contact</a>
                </li>
              </ul>
            </div>

            <div className="footer-links-column">
              <h3>Resources</h3>
              <ul>
                <li>
                  <a href="#">Blog</a>
                </li>
                <li>
                  <a href="#">CSRD Guide</a>
                </li>
                <li>
                  <a href="#">Webinars</a>
                </li>
                <li>
                  <a href="#">Documentation</a>
                </li>
                <li>
                  <a href="#">Support</a>
                </li>
              </ul>
            </div>

            <div className="footer-newsletter">
              <h3>Stay Updated</h3>
              <p>
                Subscribe to our newsletter for the latest CSRD updates and
                product news.
              </p>
              <div className="newsletter-form">
                <input type="email" placeholder="Your email address" />
                <button type="submit" aria-label="Subscribe">
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-legal">
            <span>&copy; {currentYear} Raylow. All rights reserved.</span>
            <div className="footer-legal-links">
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
