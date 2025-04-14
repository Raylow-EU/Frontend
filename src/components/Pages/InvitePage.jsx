import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { acceptTeamInvite } from "../../firebase/teamService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { toast } from "react-hot-toast";
import { registerUser } from "../../store/thunks/authThunks";

const InvitePage = () => {
  const { inviteId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const inviteDoc = await getDoc(doc(db, "teamInvites", inviteId));
        if (!inviteDoc.exists()) {
          toast.error("Invite not found");
          navigate("/");
          return;
        }
        const inviteData = { id: inviteDoc.id, ...inviteDoc.data() };
        setInvite(inviteData);
        // Pre-fill the email from the invite
        setFormData((prev) => ({ ...prev, email: inviteData.email }));
      } catch (error) {
        console.error("Error fetching invite:", error);
        toast.error("Error loading invitation");
      } finally {
        setLoading(false);
      }
    };

    if (inviteId) {
      fetchInvite();
    }
  }, [inviteId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setAccepting(true);
      // Register the user
      await dispatch(
        registerUser({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          companyName: invite.companyName, // Pass company info from invite
          skipOnboarding: true, // Skip onboarding since they're joining existing company
        })
      ).unwrap();

      // Accept the invite
      await acceptTeamInvite(inviteId, user.uid);

      toast.success("Successfully joined the team!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error during signup:", error);
      toast.error(error.message || "Failed to create account");
    } finally {
      setAccepting(false);
    }
  };

  const handleAcceptInvite = async (inviteId) => {
    try {
      setAccepting(true);
      await acceptTeamInvite(inviteId, user.uid);
      toast.success("Successfully joined the team!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error accepting invite:", error);
      toast.error(error.message || "Failed to accept invitation");
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Invite Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            This invitation may have expired or been revoked.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Team Invitation
          </h1>
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              You have been invited to join{" "}
              <span className="font-semibold">{invite.companyName}</span> on our
              sustainability reporting platform.
            </p>
            {invite.status === "pending" ? (
              <button
                onClick={() => handleAcceptInvite(inviteId)}
                disabled={accepting}
                className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {accepting ? "Accepting..." : "Accept Invitation"}
              </button>
            ) : (
              <p className="text-center text-gray-600">
                This invitation has already been {invite.status}.
              </p>
            )}
          </div>
          <div className="text-center text-sm text-gray-500">
            <p>This invitation will expire in 7 days from when it was sent.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Join {invite.companyName}
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Create your account to accept the team invitation
        </p>

        <form onSubmit={handleSignup}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={accepting}
              className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {accepting ? "Creating Account..." : "Create Account & Join Team"}
            </button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:text-primary-dark">
            Log in instead
          </a>
        </p>
      </div>
    </div>
  );
};

export default InvitePage;
