import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/config";
import { setUser, setLoading } from "../../store/slices/authSlice";
import { fetchUserData } from "../../firebase/auth";

const AuthStateListener = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("Setting up auth state listener");
    dispatch(setLoading(true));

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed", user ? "User exists" : "No user");

      if (user) {
        // Extract basic serializable properties from the user object
        const baseUserData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
        };

        try {
          // Fetch additional user data from Firestore
          const userData = await fetchUserData(user.uid);

          // Combine base user data with Firestore data
          const completeUserData = {
            ...baseUserData,
            isAdmin: userData?.isAdmin || false,
            onboardingCompleted: userData?.onboardingCompleted || false,
          };

          console.log("Setting complete user data in Redux:", completeUserData);
          dispatch(setUser(completeUserData));
        } catch (error) {
          console.error("Error fetching extended user data:", error);
          console.log("Setting basic user data in Redux:", baseUserData);
          dispatch(setUser(baseUserData));
        }
      } else {
        console.log("No user found, setting null");
        dispatch(setUser(null));
      }

      // Important: Set loading to false AFTER updating user state
      setTimeout(() => {
        dispatch(setLoading(false));
      }, 100); // Small delay to ensure state updates properly
    });

    // Cleanup the listener on unmount
    return () => unsubscribe();
  }, [dispatch]);

  return children;
};

export default AuthStateListener;
