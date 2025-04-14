import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { acceptTeamInvite } from "../../firebase/teamService";
import { toast } from "react-toastify";
import "./AcceptInvite.css";

const AcceptInvite = () => {
  const { inviteId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const inviteRef = doc(db, "teamInvites", inviteId);
        const inviteDoc = await getDoc(inviteRef);

        if (!inviteDoc.exists()) {
          setError("This invitation does not exist or has expired.");
          return;
        }

        const inviteData = inviteDoc.data();

        // Check if invite is expired
        if (inviteData.expiresAt.toDate() < new Date()) {
          setError("This invitation has expired.");
          return;
        }

        // Check if invite is already accepted
        if (inviteData.status === "accepted") {
          setError("This invitation has already been accepted.");
          return;
        }

        // Check if the invite is for the current user
        if (user && user.email !== inviteData.email) {
          setError("This invitation was sent to a different email address.");
          return;
        }

        setInvite(inviteData);
      } catch (err) {
        console.error("Error fetching invite:", err);
        setError("Failed to load invitation details.");
      } finally {
        setLoading(false);
      }
    };

    if (inviteId) {
      fetchInvite();
    }
  }, [inviteId, user]);

  const handleAcceptInvite = async () => {
    if (!user) {
      // Save the invite ID in session storage and redirect to login
      sessionStorage.setItem("pendingInvite", inviteId);
      navigate("/login");
      return;
    }

    try {
      setAccepting(true);
      await acceptTeamInvite(inviteId, user.uid);
      toast.success("You have successfully joined the team!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error accepting invite:", err);
      toast.error("Failed to accept invitation. Please try again.");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="accept-invite-container">
        <div className="loading-spinner"></div>
        <p>Loading invitation details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="accept-invite-container">
        <div className="error-message">
          <h2>Oops!</h2>
          <p>{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="primary-button"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="accept-invite-container">
      <div className="invite-card">
        <h2>Team Invitation</h2>
        {invite && (
          <>
            <p>
              You&apos;ve been invited to join{" "}
              <strong>{invite.companyName}</strong>
            </p>
            <div className="company-details">
              <p>
                <strong>Industry:</strong> {invite.industry}
              </p>
              <p>
                <strong>Company Size:</strong> {invite.companySize}
              </p>
            </div>
            <button
              onClick={handleAcceptInvite}
              disabled={accepting}
              className="accept-button"
            >
              {accepting ? "Accepting..." : "Accept Invitation"}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;
