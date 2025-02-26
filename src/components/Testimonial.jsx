import "./Testimonial.css";
import testimonialImage from "../assets/eduardo.png"; // Add your image

const Testimonial = () => {
  return (
    <section className="testimonial">
      <div className="testimonial-content">
        <div className="rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className="star">
              ★
            </span>
          ))}
        </div>

        <blockquote>
          &quot;Raylow is incredibly easy to use. The intuitive interface and
          AI-powered optimization have streamlined our sustainability reporting,
          significantly improving our CSRD compliance.&quot;
        </blockquote>

        <div className="testimonial-author">
          <img src={testimonialImage} alt="Profile" className="author-image" />
          <div className="author-info">
            <h4>Eduardo Nicholas</h4>
            <p>Sustainability manager at X</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
