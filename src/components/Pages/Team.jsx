import { useSelector } from "react-redux";

const Team = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <div className="page-container">
      <h1>Team</h1>
      <p>Your team dashboard and tools</p>
      {user?.isAdmin && <p>hi</p>}

      {/* Add team specific content here */}
    </div>
  );
};

export default Team;
