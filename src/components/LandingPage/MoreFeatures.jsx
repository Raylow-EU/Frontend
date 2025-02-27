import "./MoreFeatures.css";

const MoreFeatures = () => {
  const features = [
    {
      icon: "✧",
      title: "Gather & Centralize",
      description:
        "Automatically send reminders to departmental users and collect sustainability data from across your organization with a single action.",
    },
    {
      icon: "✧",
      title: "Gather & Centralize",
      description:
        "Automatically send reminders to departmental users and collect sustainability data from across your organization with a single action.",
    },
    {
      icon: "✧",
      title: "Gather & Centralize",
      description:
        "Automatically send reminders to departmental users and collect sustainability data from across your organization with a single action.",
    },
    {
      icon: "✧",
      title: "Gather & Centralize",
      description:
        "Automatically send reminders to departmental users and collect sustainability data from across your organization with a single action.",
    },
    {
      icon: "✧",
      title: "Gather & Centralize",
      description:
        "Automatically send reminders to departmental users and collect sustainability data from across your organization with a single action.",
    },
    {
      icon: "✧",
      title: "Gather & Centralize",
      description:
        "Automatically send reminders to departmental users and collect sustainability data from across your organization with a single action.",
    },
  ];

  return (
    <section className="more-features">
      <div className="more-features-header">
        <h2>More features</h2>
        <p>Convert is built to save you time and money</p>
      </div>

      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <span className="feature-icon">{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MoreFeatures;
