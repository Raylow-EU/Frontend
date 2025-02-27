// import all components and return the landing page

import Navbar from "./Navbar";
import Hero from "./Hero";
import TrustedBy from "./TrustedBy";
import HowItWorks from "./HowItWorks";
import Features from "./Features";
import Testimonial from "./Testimonial";
import MoreFeatures from "./MoreFeatures";
import FAQ from "./FAQ";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div>
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
