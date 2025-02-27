import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage/LandingPage";
import Login from "./components/Authentication/Login";
import Signup from "./components/Authentication/Signup";
import Navbar from "./components/LandingPage/Navbar";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            <>
              <Navbar />
              <Login />
            </>
          }
        />
        <Route
          path="/signup"
          element={
            <>
              <Navbar />
              <Signup />
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
