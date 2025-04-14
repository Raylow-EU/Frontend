import { useEffect, useRef, useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import "./Hero.css";
import DashboardImage from "../../assets/dashboard.png";

const Hero = () => {
  const dashboardRef = useRef(null);
  const contentRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Set loaded state after component mounts for entrance animation
    setIsLoaded(true);

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const maxScroll = 500; // Adjust this value to control animation speed

      if (scrollPosition <= maxScroll) {
        const progress = Math.min(scrollPosition / maxScroll, 1);

        // Transform dashboard from tilted to straight
        if (dashboardRef.current) {
          dashboardRef.current.style.transform = `
            perspective(1000px) 
            rotateX(${25 - progress * 25}deg) 
            scale(${1 + progress * 0.1})
          `;
          // Adjust shadow based on scroll
          dashboardRef.current.style.boxShadow = `0 ${20 - progress * 10}px ${
            40 - progress * 20
          }px rgba(0, 0, 0, ${0.1 + progress * 0.1})`;
        }

        // Fade out content
        if (contentRef.current) {
          contentRef.current.style.opacity = `${1 - progress * 1.5}`;
          contentRef.current.style.transform = `translateY(${
            progress * -50
          }px)`;
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className={`hero ${isLoaded ? "hero-loaded" : ""}`}>
      <div className="hero-background">
        <div className="hero-gradient"></div>
        <div className="hero-dots"></div>
      </div>

      <div className="hero-content-wrapper">
        <div className="hero-content" ref={contentRef}>
          <div className="hero-badge">
            <span>New</span> CSRD Compliance Solution
          </div>

          <h1>
            <span className="highlight">CSRD Compliance</span> Made Simple
            <br />
            <span className="subtitle">Less Hassle, More Impact!</span>
          </h1>

          <p>
            Streamline your sustainability reporting process with AI-powered
            insights and complete CSRD requirements 50% faster. Join hundreds of
            companies already simplifying their reporting.
          </p>

          <div className="hero-cta">
            <button className="get-started-btn">
              Get Started <ArrowRight size={16} />
            </button>
            <button className="watch-demo-btn">
              <Play size={16} /> Watch Demo
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">50%</span>
              <span className="stat-label">Time Saved</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100+</span>
              <span className="stat-label">Companies</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">99%</span>
              <span className="stat-label">Compliance Rate</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="dashboard-wrapper" ref={dashboardRef}>
          <div className="dashboard-overlay"></div>
          <img
            src={DashboardImage || "/placeholder.svg?height=600&width=1000"}
            alt="Sustainability reporting dashboard"
            className="dashboard-image"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
