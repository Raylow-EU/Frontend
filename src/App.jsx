import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import TrustedBy from "./components/TrustedBy";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import Testimonial from "./components/Testimonial";
import MoreFeatures from "./components/MoreFeatures";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="app">
      <Navbar />
      <Hero />
      <TrustedBy />
      <HowItWorks />
      <Features />
      <Testimonial />
      <MoreFeatures />
      <FAQ />
      <Footer />
    </div>
  );
}

export default App;
