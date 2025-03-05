import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import "./index.css";
import App from "./App.jsx";
import AuthStateListener from "./components/Authentication/AuthStateListener";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <AuthStateListener>
        <App />
      </AuthStateListener>
    </Provider>
  </StrictMode>
);
