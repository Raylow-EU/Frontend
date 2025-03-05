import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/config";
import { setUser, setLoading } from "../../store/slices/authSlice";

const AuthStateListener = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("Setting up auth state listener");
    dispatch(setLoading(true));

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed", user ? "User exists" : "No user");

      if (user) {
        // Extract only serializable properties from the user object
        const serializableUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
        };
        console.log("Setting user in Redux:", serializableUser);
        dispatch(setUser(serializableUser));
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
