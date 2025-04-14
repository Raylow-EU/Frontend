import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FiPlus, FiMail, FiUser, FiX } from "react-icons/fi";
import { createTeamInvite, getTeamMembers } from "../../firebase/teamService";
import "./Team.css";

const Team = () => {
  const user = useSelector((state) => state.auth.user);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.companyName) {
      loadTeamMembers();
    }
  }, [user]);

  const loadTeamMembers = async () => {
    try {
      const members = await getTeamMembers(user.companyName);
      setTeamMembers(members);
    } catch (error) {
      console.error("Error loading team members:", error);
      toast.error("Failed to load team members");
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    try {
      setLoading(true);
      await createTeamInvite(user.uid, inviteEmail);
      toast.success("Invitation sent successfully!");
      setInviteEmail("");
      setShowInviteModal(false);
    } catch (error) {
      console.error("Error sending invitation:", error);
      toast.error("Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="team-page">
      <div className="team-header">
        <h1>Team Members</h1>
        {user?.isAdmin && (
          <button
            className="invite-button"
            onClick={() => setShowInviteModal(true)}
          >
            <FiPlus /> Invite Team Member
          </button>
        )}
      </div>

      <div className="team-members-grid">
        {teamMembers.map((member) => (
          <div key={member.id} className="team-member-card">
            <div className="member-avatar">
              <FiUser />
            </div>
            <div className="member-info">
              <h3>{member.displayName || member.email}</h3>
              <p>{member.isAdmin ? "Admin" : "Team Member"}</p>
            </div>
          </div>
        ))}
      </div>

      {showInviteModal && (
        <div className="modal-overlay">
          <div className="invite-modal">
            <div className="modal-header">
              <h2>Invite Team Member</h2>
              <button
                className="close-button"
                onClick={() => setShowInviteModal(false)}
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleInviteSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-with-icon">
                  <FiMail />
                  <input
                    type="email"
                    id="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
