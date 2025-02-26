import "./TrustedBy.css";

const TrustedBy = () => {
  const companies = [
    { name: "Vancouver", logo: "src/assets/google.png" },
    { name: "Black+", logo: "src/assets/google.png" },
    { name: "Geneva", logo: "src/assets/google.png" },
    { name: "Cambridge", logo: "src/assets/google.png" },
    { name: "Atlantic", logo: "src/assets/google.png" },
    { name: "Nairobi", logo: "src/assets/google.png" },
    { name: "Memphis", logo: "src/assets/google.png" },
    { name: "Madrid", logo: "src/assets/google.png" },
    { name: "Aura", logo: "src/assets/google.png" },
    { name: "Recharge", logo: "src/assets/google.png" },
  ];

  return (
    <section className="trusted-by">
      <h2>Trusted by 100+ SMEs</h2>
      <div className="logo-grid">
        {companies.map((company) => (
          <div key={company.name} className="logo-item">
            <img src={company.logo} alt={`${company.name} logo`} />
            <p>{company.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrustedBy;
