import "./Hero.css";
import DashboardImage from "../assets/dashboard.png"; // You'll need to add this image

const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-content">
        <h1>
          CSRD COMPLIANCE MADE SIMPLE
          <br />
          AI-POWERED ESG REPORTING
        </h1>
        <p>
          Streamline your sustainability reporting process with
          <br />
          AI powered insights and complete CSRD reqs 50% faster.
        </p>
        <button className="get-started-btn">Get started</button>
      </div>
      <div className="dashboard-preview">
        <img src={DashboardImage} alt="Dashboard Preview" />
      </div>
    </div>
  );
};

export default Hero;
