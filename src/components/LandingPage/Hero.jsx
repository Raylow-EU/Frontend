import { useEffect, useRef } from "react";
import "./Hero.css";
import DashboardImage from "../../assets/dashboard.png"; // You'll need to add this image

const Hero = () => {
  const dashboardRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
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
    <div className="hero">
      <div className="hero-content" ref={contentRef}>
        <h1>
          CSRD COMPLIANCE MADE SIMPLE
          <br />
          LESS HASSLE, MORE IMPACT!
        </h1>
        <p>
          Streamline your sustainability reporting process with
          <br />
          AI powered insights and complete CSRD reqs 50% faster.
        </p>
        <button className="get-started-btn">Get started</button>
      </div>
      <div className="dashboard-container">
        <div className="dashboard-wrapper" ref={dashboardRef}>
          <img
            src={DashboardImage}
            alt="Dashboard Preview"
            className="dashboard-image"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
