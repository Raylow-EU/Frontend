import { useState, useRef, useEffect } from "react";
import "./CSRD.css";
import { BsChat, BsX, BsClockHistory, BsPlusCircle } from "react-icons/bs";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { db } from "../../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { addReportToDashboard } from "../../firebase/dashboardService";
import {
  createChatSession,
  getUserChatSessions,
  getChatSession,
  addMessageToChatSession,
  updateChatSessionTitle,
  deleteChatSession,
} from "../../firebase/chatService";

const CSRD = () => {
  const { user } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  // Form state
  const [activeTab, setActiveTab] = useState("materiality");
  const [chatWidgetOpen, setChatWidgetOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Chat session state
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [chatSessions, setChatSessions] = useState([]);
  const [showSessionHistory, setShowSessionHistory] = useState(false);
  const [sessionHistoryLoading, setSessionHistoryLoading] = useState(false);

  const [formData, setFormData] = useState({
    materiality: {},
    stakeholder: {},
    governance: {},
    target: {},
    data: {},
  });

  // Add state to track backend availability
  const [backendStatus, setBackendStatus] = useState("unknown"); // "online", "offline", "unknown"
  const [isTempSession, setIsTempSession] = useState(false); // Track if this is a temporary session

  // Load chat sessions when the user opens the chat widget
  useEffect(() => {
    if (chatWidgetOpen && user?.uid && !currentSessionId) {
      // Create a temporary session when opening the chat
      startNewChatSession(true); // Pass true to indicate this is a temporary session
    }
  }, [chatWidgetOpen, user]);

  // Handle component unmount with empty chat
  useEffect(() => {
    // Setup a cleanup function that runs when the component unmounts or dependencies change
    return () => {
      // Check if there's a current temporary session that's empty
      if (
        currentSessionId &&
        isTempSession &&
        messages.length === 0 &&
        user?.uid
      ) {
        // Only attempt to delete if the user is logged in
        // Instead of deleting directly, which might fail due to permissions on unmount,
        // just mark for future deletion
        try {
          localStorage.setItem("pendingEmptySessionDelete", currentSessionId);
          console.debug(
            `Marked empty session for deletion: ${currentSessionId}`
          );
        } catch (e) {
          console.debug("Error marking empty chat session for deletion", e);
        }
      }
    };
  }, [currentSessionId, isTempSession, messages.length, user?.uid]);

  // Additionally handle page unload events for more reliability
  useEffect(() => {
    const handleBeforeUnload = () => {
      // If there's a current temporary session that's empty
      if (currentSessionId && isTempSession && messages.length === 0) {
        // Try to delete it when the page unloads
        // Note: For beforeunload, we can't reliably perform async operations
        // This is a best-effort attempt to mark the session for deletion
        try {
          // Store the session ID that should be deleted in localStorage
          localStorage.setItem("pendingEmptySessionDelete", currentSessionId);
        } catch (e) {
          console.debug(
            "Error marking empty chat session for deletion on page unload",
            e
          );
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentSessionId, isTempSession, messages.length]);

  // Check for and clean up any pending session deletions from previous page unloads
  useEffect(() => {
    const checkPendingDeletions = async () => {
      if (!user?.uid) return;

      const pendingSessionId = localStorage.getItem(
        "pendingEmptySessionDelete"
      );
      if (pendingSessionId) {
        try {
          // Delete the session that was marked for deletion
          await deleteChatSession(pendingSessionId);
          console.debug(
            `Deleted pending empty chat session: ${pendingSessionId}`
          );
        } catch (error) {
          console.error("Error deleting pending empty chat session:", error);
        } finally {
          // Clear the pending deletion
          localStorage.removeItem("pendingEmptySessionDelete");
        }
      }
    };

    // Run the check when the component mounts
    if (user?.uid) {
      checkPendingDeletions();
    }
  }, [user?.uid]);

  // Load chat sessions from Firestore
  const loadChatSessions = async () => {
    if (!user?.uid) return;

    try {
      setSessionHistoryLoading(true);
      const sessions = await getUserChatSessions(user.uid);
      setChatSessions(sessions);
    } catch (error) {
      console.error("Error loading chat sessions:", error);
      toast.error("Failed to load chat history");
    } finally {
      setSessionHistoryLoading(false);
    }
  };

  // Start a new chat session
  const startNewChatSession = async (isTemporary = false) => {
    // Check if current session is empty and temporary before starting a new one
    if (currentSessionId && isTempSession && messages.length === 0) {
      try {
        // Try to delete the current empty session before creating a new one
        await deleteEmptySession(currentSessionId);
      } catch {
        // If deletion fails, just log it and continue - we'll still create a new session
        console.debug(
          "Could not delete previous empty session, continuing with new session creation"
        );
      }
    }

    if (!user?.uid) return;

    try {
      setLoading(true);
      const newSession = await createChatSession(user.uid);
      setCurrentSessionId(newSession.id);
      setMessages([]);
      setIsTempSession(isTemporary); // Track if this is a temporary session

      // Add the new session to the list if it's not temporary
      if (!isTemporary) {
        setChatSessions((prev) => [newSession, ...prev]);
      }
    } catch (error) {
      console.error("Error creating new chat session:", error);
      toast.error("Failed to start new chat");
    } finally {
      setLoading(false);
    }
  };

  // Load a specific chat session
  const loadChatSession = async (sessionId) => {
    try {
      // Check if current session is empty and temporary before loading a new one
      if (
        currentSessionId &&
        isTempSession &&
        messages.length === 0 &&
        currentSessionId !== sessionId
      ) {
        try {
          // Delete the current empty temporary session before loading a different one
          await deleteEmptySession(currentSessionId);
        } catch {
          // If deletion fails, just log it and continue with loading the requested session
          console.debug(
            "Could not delete previous empty session, continuing with loading requested session"
          );
        }
      }

      setLoading(true);
      // Reset temporary status when loading an existing session
      setIsTempSession(false);

      const session = await getChatSession(sessionId);
      setCurrentSessionId(session.id);

      // Convert the messages array from the stored format to the component format
      const formattedMessages = session.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        id: msg.id,
      }));

      setMessages(formattedMessages);
      setShowSessionHistory(false);
    } catch (error) {
      console.error("Error loading chat session:", error);
      toast.error("Failed to load chat session");
    } finally {
      setLoading(false);
    }
  };

  // Toggle chat history panel
  const toggleSessionHistory = async () => {
    if (!showSessionHistory) {
      await loadChatSessions();
    }
    setShowSessionHistory(!showSessionHistory);
  };

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Delete an empty chat session
  const deleteEmptySession = async (sessionId) => {
    if (!sessionId || !user?.uid) return;

    try {
      // Check if we have the permission to delete this session
      // Session must belong to the current user
      const chatSessions = await getUserChatSessions(user.uid);
      const sessionExists = chatSessions.some(
        (session) => session.id === sessionId
      );

      if (!sessionExists) {
        console.debug(
          `Session ${sessionId} not found or not owned by current user, skipping deletion`
        );
        return;
      }

      await deleteChatSession(sessionId);

      // Also remove it from the local state if it's in the list
      setChatSessions((prev) =>
        prev.filter((session) => session.id !== sessionId)
      );

      // Clear from localStorage if it was pending deletion
      if (localStorage.getItem("pendingEmptySessionDelete") === sessionId) {
        localStorage.removeItem("pendingEmptySessionDelete");
      }

      console.debug(`Deleted empty chat session: ${sessionId}`);
    } catch (error) {
      console.error("Error deleting empty chat session:", error);

      // For permission errors, just remove from local state
      if (
        error.message &&
        (error.message.includes("permission") ||
          error.message.includes("insufficient") ||
          error.message.includes("unauthorized"))
      ) {
        console.debug(
          "Permission error, removing session from local state only"
        );

        // Remove from local state anyway
        setChatSessions((prev) =>
          prev.filter((session) => session.id !== sessionId)
        );

        // Clear from localStorage if it was pending deletion
        if (localStorage.getItem("pendingEmptySessionDelete") === sessionId) {
          localStorage.removeItem("pendingEmptySessionDelete");
        }
      }
      // Don't show a toast for this error as it's not critical to the user experience
    }
  };

  // Close chat widget with animation
  const handleCloseChat = () => {
    setIsClosing(true);
    setIsAnimating(true);

    // Check if we should delete the current session
    if (currentSessionId && isTempSession && messages.length === 0) {
      // Delete empty temporary session before closing
      deleteEmptySession(currentSessionId);
    }

    // Use a slightly longer timeout than the animation duration
    setTimeout(() => {
      setChatWidgetOpen(false);
      setIsClosing(false);
      setCurrentSessionId(null);
      setMessages([]);
      setIsTempSession(false); // Reset the temp session flag

      // Add a small delay before allowing button to appear
      setTimeout(() => {
        setIsAnimating(false);
      }, 50);
    }, 350);
  };

  // Open chat widget
  const handleOpenChat = () => {
    setIsAnimating(true);
    setChatWidgetOpen(true);

    // Reset animating state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 350);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle chat submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Ensure we have a session ID
    if (!currentSessionId) {
      await startNewChatSession();
      // If we still don't have a session ID after trying to create one, abort
      if (!currentSessionId) {
        toast.error("Couldn't create a chat session");
        return;
      }
    } else if (isTempSession) {
      // If this is the first message in a temporary session, make it permanent
      setIsTempSession(false);
      // Add to the chat sessions list now that it's no longer temporary
      const currentSession = chatSessions.find(
        (s) => s.id === currentSessionId
      );
      if (!currentSession) {
        // Only add to the list if it's not already there
        const newSessionObj = {
          id: currentSessionId,
          title: `Chat ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString(
            [],
            { hour: "2-digit", minute: "2-digit" }
          )}`,
          createdAt: new Date(),
          userId: user.uid,
        };
        setChatSessions((prev) => [newSessionObj, ...prev]);
      }
    }

    // Get the user's question
    const question = input.trim();

    // Create user message object
    const userMessage = {
      role: "user",
      content: question,
      timestamp: new Date(), // Add timestamp for better tracking
    };

    // Add user message to local chat history
    setMessages((prev) => [...prev, userMessage]);

    // Save the user message to Firestore
    let userMessageId;
    try {
      const savedUserMessage = await addMessageToChatSession(
        currentSessionId,
        userMessage
      );
      userMessageId = savedUserMessage.id;
    } catch (error) {
      console.error("Error saving user message:", error);
      // If we can't save the message, alert the user but continue with the chat
      toast.warning(
        "Your message couldn't be saved, but the chat will continue"
      );
    }

    // Clear input and set loading state
    setInput("");
    setLoading(true);

    // Create a temporary ID for the assistant message in the UI
    const tempId = Date.now().toString();

    // Add empty assistant message that we'll update with streamed content
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
        id: tempId,
      },
    ]);

    // This variable will collect the full response
    let assistantResponse = "";
    let isError = false;

    try {
      // First check if the backend is available
      const checkBackendAvailable = async () => {
        try {
          // Simple request to check if the backend is reachable
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          // Use GET method with the actual endpoint that works
          const response = await fetch(
            `${
              import.meta.env.VITE_BACKEND_API_URL
            }/query/stream?question=ping`,
            {
              method: "GET",
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);
          return response.ok;
        } catch (error) {
          console.error("Backend availability check failed:", error);
          return false;
        }
      };

      // Check backend before trying to establish EventSource
      const backendAvailable = await checkBackendAvailable();

      if (!backendAvailable) {
        throw new Error("Backend service is not available");
      }

      // Create an EventSource connection to the streaming endpoint
      const eventSource = new EventSource(
        `${
          import.meta.env.VITE_BACKEND_API_URL
        }/query/stream?question=${encodeURIComponent(question)}`
      );

      let timeoutId;

      // Function to set up timeout
      const setupTimeout = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          console.log("Stream timeout");
          eventSource.close();

          // Save what we got so far if timeout occurs
          saveAssistantMessage(
            assistantResponse || "Response timed out. Please try again."
          );

          setLoading(false);
        }, 60000); // 60 seconds timeout
      };

      // Set initial timeout
      setupTimeout();

      // Handle incoming message chunks
      eventSource.onmessage = (event) => {
        console.log("Received chunk:", event.data);
        const chunk = event.data;
        if (chunk === "__END__") {
          eventSource.close();
          setLoading(false);
          // Save the full assistantResponse here
          saveAssistantMessage(assistantResponse);
          return;
        }
        assistantResponse += chunk;

        // Update the assistant message with the new chunk
        setMessages((prevMessages) =>
          prevMessages.map((message) =>
            message.id === tempId
              ? { ...message, content: assistantResponse }
              : message
          )
        );

        // Auto scroll to the latest message
        scrollToBottom();
      };

      // Handle errors
      eventSource.onerror = async (error) => {
        // Check if this is a normal connection close or a real error
        const isNormalClose =
          assistantResponse && // We got a response already
          error.target &&
          error.target.readyState === 2; // 2 = CLOSED

        if (!isNormalClose) {
          // Only log as error if it's not a normal close
          console.error("EventSource error:", error);

          // Log more details if available
          if (error && error.target) {
            console.debug("EventSource readyState:", error.target.readyState);
            // readyState: 0 = CONNECTING, 1 = OPEN, 2 = CLOSED
          }
        } else {
          // For normal closures, just log debug info
          console.debug(
            "EventSource connection closed normally after receiving response"
          );
        }

        // Always close the connection on error
        eventSource.close();
        clearTimeout(timeoutId);
        setLoading(false);
        isError = true;

        // If we got no content, set an error message
        if (!assistantResponse) {
          let errorMessage =
            "I couldn't connect to the AI service at the moment. " +
            "This might be because the backend server is not running or the streaming endpoint isn't accessible. " +
            "Please check that your backend server is running properly.";

          assistantResponse = errorMessage;

          // Update UI
          setMessages((prevMessages) => {
            return prevMessages.map((message) =>
              message.id === tempId
                ? { ...message, content: assistantResponse }
                : message
            );
          });
        }

        // Save the error message to the database
        saveAssistantMessage(assistantResponse);
      };

      // Update the close event handler
      eventSource.addEventListener("close", async () => {
        console.debug("EventSource close event received");
        eventSource.close();
        clearTimeout(timeoutId);
        setLoading(false);

        // Don't save the message again if we've already saved it in the error handler
        if (!isError && assistantResponse) {
          saveAssistantMessage(assistantResponse);
        }
      });

      // Function to save the assistant's message to the database
      const saveAssistantMessage = async (content) => {
        // Only save if we have content and a session ID
        if (content && currentSessionId) {
          try {
            // Create assistant message object
            const assistantMessage = {
              role: "assistant",
              content: content,
              id: tempId,
              timestamp: new Date(),
              inResponseTo: userMessageId, // Reference to the user message this is responding to
            };

            // Save to Firestore
            await addMessageToChatSession(currentSessionId, assistantMessage);

            // If this is the first exchange, update the session title based on content
            const currentSession = chatSessions.find(
              (s) => s.id === currentSessionId
            );
            if (currentSession && messages.length <= 2) {
              // Create a title from the first user message
              const firstUserMessage = messages.find((m) => m.role === "user");
              if (firstUserMessage) {
                const userMessageText = firstUserMessage.content;
                let title = userMessageText.substring(0, 30);
                if (userMessageText.length > 30) {
                  title += "...";
                }
                await updateChatSessionTitle(currentSessionId, title);

                // Update the title in local state
                setChatSessions((sessions) =>
                  sessions.map((s) =>
                    s.id === currentSessionId ? { ...s, title } : s
                  )
                );
              }
            }
          } catch (error) {
            console.error("Error saving assistant message:", error);
            toast.warning("The AI response couldn't be saved to your history");
          }
        }
      };

      // Clean up function that will be called when the component unmounts
      return () => {
        eventSource.close();
        clearTimeout(timeoutId);
        setLoading(false);

        // If the component unmounts while still loading, save what we have
        if (loading && assistantResponse) {
          saveAssistantMessage(
            assistantResponse + " (incomplete - connection closed)"
          );
        }
      };
    } catch (error) {
      console.error("Error setting up streaming:", error);
      setLoading(false);

      // Set a more specific error message based on the error type
      let errorMessage;

      if (error.message === "Backend service is not available") {
        errorMessage =
          "I couldn't connect to the AI service at the moment. " +
          "This might be because the backend server is not running or the streaming endpoint isn't accessible. " +
          "Please check that your backend server is running properly.";
      } else {
        errorMessage =
          "Sorry, I encountered an error connecting to the AI service. Please try again.";
      }

      // Update the assistant message with the error
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === tempId
            ? { ...message, content: errorMessage }
            : message
        )
      );

      // Save the error message to the database
      try {
        const assistantMessage = {
          role: "assistant",
          content: errorMessage,
          id: tempId,
          timestamp: new Date(),
          inResponseTo: userMessageId,
          error: true, // Flag that this was an error response
        };
        await addMessageToChatSession(currentSessionId, assistantMessage);
      } catch (saveError) {
        console.error("Error saving error message:", saveError);
      }
    }
  };

  // Handle form field changes
  const handleFormChange = (category, fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [fieldName]: value,
      },
    }));
  };

  // Format chat session date for display
  const formatSessionDate = (date) => {
    if (!date) return "";

    // If today, show just the time
    const today = new Date();
    const sessionDate = new Date(date);

    if (today.toDateString() === sessionDate.toDateString()) {
      return sessionDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // If this year, show month and day
    if (today.getFullYear() === sessionDate.getFullYear()) {
      return sessionDate.toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
    }

    // Otherwise show full date
    return sessionDate.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle form submission
  const handleFormSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to submit the form");
      return;
    }

    console.log("Current user:", user);

    setSubmitting(true);

    try {
      // Ensure user is properly authenticated
      if (!user.uid) {
        throw new Error("User ID is missing");
      }

      // Create a submission object with metadata
      const submission = {
        userId: user.uid,
        userName: user.displayName || "Anonymous",
        timestamp: serverTimestamp(),
        formData: formData,
      };

      // Add to Firestore
      const docRef = await addDoc(
        collection(db, "csrdSubmissions"),
        submission
      );

      // Convert timestamp to Date for dashboard display
      const reportData = {
        id: docRef.id,
        title: `CSRD Report - ${new Date().toLocaleDateString()}`,
        date: new Date(),
        type: "CSRD",
        status: "Submitted",
      };

      // Add to dashboard data
      await addReportToDashboard(user.uid, reportData);

      console.log("Document written with ID:", docRef.id);
      toast.success("Your CSRD form has been submitted successfully!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(`Failed to submit form: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Add function to check backend status periodically
  useEffect(() => {
    if (!chatWidgetOpen) return;

    const checkBackendStatus = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        // Use GET instead of HEAD and check against the actual endpoint we're using
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_API_URL}/query/stream?question=ping`,
          {
            method: "GET",
            signal: controller.signal,
          }
        );

        clearTimeout(timeoutId);
        setBackendStatus(response.ok ? "online" : "offline");
      } catch (error) {
        console.warn("Backend status check failed:", error);
        setBackendStatus("offline");
      }
    };

    // Check immediately when the chat opens
    checkBackendStatus();

    // Check periodically
    const intervalId = setInterval(checkBackendStatus, 30000); // Check every 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [chatWidgetOpen]);

  return (
    <div className={`csrd-page ${chatWidgetOpen ? "chat-open" : ""}`}>
      <div className="csrd-content">
        {/* Tab Navigation */}
        <div className="csrd-tabs">
          <button
            className={`tab-button ${
              activeTab === "materiality" ? "active" : ""
            }`}
            onClick={() => setActiveTab("materiality")}
          >
            Materiality Assessment
          </button>
          <button
            className={`tab-button ${
              activeTab === "stakeholder" ? "active" : ""
            }`}
            onClick={() => setActiveTab("stakeholder")}
          >
            Stakeholder Engagement
          </button>
          <button
            className={`tab-button ${
              activeTab === "governance" ? "active" : ""
            }`}
            onClick={() => setActiveTab("governance")}
          >
            Governance & Oversight
          </button>
          <button
            className={`tab-button ${activeTab === "target" ? "active" : ""}`}
            onClick={() => setActiveTab("target")}
          >
            Target & Actions
          </button>
          <button
            className={`tab-button ${activeTab === "data" ? "active" : ""}`}
            onClick={() => setActiveTab("data")}
          >
            Data & Reporting
          </button>
        </div>

        {/* Form Content */}
        <div className="csrd-form-container">
          {activeTab === "materiality" && (
            <div className="form-section">
              <div className="section-header">
                <h2>Materiality Assessment</h2>
                <p className="section-description">
                  Double Materiality: impacts on people & planet, and financial
                  impacts on your company.
                </p>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      1.1 Which sustainability topics does your company have an
                      impact on? (e.g. Climate change, Water use, Labour
                      practices, Biodiversity, …)
                    </label>
                    <select
                      multiple
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        handleFormChange(
                          "materiality",
                          "impactTopics",
                          selectedOptions
                        );
                      }}
                    >
                      <option value="climateChange">Climate Change</option>
                      <option value="waterUse">Water Use</option>
                      <option value="labourPractices">Labour Practices</option>
                      <option value="biodiversity">Biodiversity</option>
                      {/* Add more options as needed */}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      1.2 Which of those topics can have a material financial
                      impact on your company?
                    </label>
                    <select
                      multiple
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        handleFormChange(
                          "materiality",
                          "financialImpactTopics",
                          selectedOptions
                        );
                      }}
                    >
                      <option value="climateChange">Climate Change</option>
                      <option value="waterUse">Water Use</option>
                      <option value="labourPractices">Labour Practices</option>
                      <option value="biodiversity">Biodiversity</option>
                      {/* Add more options as needed */}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      1.3 For each selected topic, rate the severity of your
                      company\u2019s impact on a scale of 1 (low) to 5 (high).
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      onChange={(e) =>
                        handleFormChange(
                          "materiality",
                          "impactSeverity",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      1.4 For each selected topic, rate the likelihood of that
                      impact occurring on a scale of 1 (unlikely) to 5 (very
                      likely).
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      onChange={(e) =>
                        handleFormChange(
                          "materiality",
                          "impactLikelihood",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      1.5 Based on the above, which topics do you consider
                      material and should be included in your report?
                    </label>
                    <select
                      multiple
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        handleFormChange(
                          "materiality",
                          "materialTopics",
                          selectedOptions
                        );
                      }}
                    >
                      <option value="climateChange">Climate Change</option>
                      <option value="waterUse">Water Use</option>
                      <option value="labourPractices">Labour Practices</option>
                      <option value="biodiversity">Biodiversity</option>
                      {/* Add more options as needed */}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "stakeholder" && (
            <div className="form-section">
              <div className="section-header">
                <h2>Stakeholder Engagement</h2>
                <p className="section-description">
                  Document how your organization engages with various
                  stakeholders on sustainability matters.
                </p>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      2.1 Which stakeholder groups do you engage for
                      sustainability input? (e.g. Employees, Suppliers, Local
                      communities, NGOs, Investors)
                    </label>
                    <select
                      multiple
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        handleFormChange(
                          "stakeholder",
                          "engagedGroups",
                          selectedOptions
                        );
                      }}
                    >
                      <option value="employees">Employees</option>
                      <option value="suppliers">Suppliers</option>
                      <option value="localCommunities">
                        Local Communities
                      </option>
                      <option value="ngos">NGOs</option>
                      <option value="investors">Investors</option>
                      {/* Add more options as needed */}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      2.2 For each selected group, what engagement methods do
                      you use? (e.g. Surveys, Workshops, Interviews, Town halls,
                      Whistle‑blowing line)
                    </label>
                    <select
                      multiple
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        handleFormChange(
                          "stakeholder",
                          "engagementMethods",
                          selectedOptions
                        );
                      }}
                    >
                      <option value="surveys">Surveys</option>
                      <option value="workshops">Workshops</option>
                      <option value="interviews">Interviews</option>
                      <option value="townHalls">Town Halls</option>
                      <option value="whistleBlowing">
                        Whistle-blowing Line
                      </option>
                      {/* Add more options as needed */}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      2.3 How frequently do you engage each stakeholder group?
                    </label>
                    <select
                      onChange={(e) =>
                        handleFormChange(
                          "stakeholder",
                          "engagementFrequency",
                          e.target.value
                        )
                      }
                    >
                      <option value="" disabled>
                        Select frequency
                      </option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                      <option value="adHoc">Ad-hoc</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      2.4 Do you have an anonymous feedback/whistle-blowing
                      mechanism?
                    </label>
                    <div>
                      <input
                        type="radio"
                        id="whistleYes"
                        name="whistleBlowing"
                        value="yes"
                        onChange={(e) =>
                          handleFormChange(
                            "stakeholder",
                            "whistleBlowing",
                            e.target.value
                          )
                        }
                      />
                      <label htmlFor="whistleYes">Yes</label>
                      <input
                        type="radio"
                        id="whistleNo"
                        name="whistleBlowing"
                        value="no"
                        onChange={(e) =>
                          handleFormChange(
                            "stakeholder",
                            "whistleBlowing",
                            e.target.value
                          )
                        }
                      />
                      <label htmlFor="whistleNo">No</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      2.5 Briefly describe how you record, track and follow up
                      on stakeholder input.
                    </label>
                    <textarea
                      rows="4"
                      onChange={(e) =>
                        handleFormChange(
                          "stakeholder",
                          "stakeholderInputTracking",
                          e.target.value
                        )
                      }
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "governance" && (
            <div className="form-section">
              <div className="section-header">
                <h2>Governance & Oversight</h2>
                <p className="section-description">
                  Detail your organization\u2019s governance structure for
                  sustainability issues.
                </p>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      3.1 Who in your organisation is ultimately responsible for
                      CSRD governance? (Name / Role)
                    </label>
                    <input
                      type="text"
                      onChange={(e) =>
                        handleFormChange(
                          "governance",
                          "responsiblePerson",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      3.2 Which governing body oversees sustainability
                      reporting?
                    </label>
                    <select
                      onChange={(e) =>
                        handleFormChange(
                          "governance",
                          "governingBody",
                          e.target.value
                        )
                      }
                    >
                      <option value="" disabled>
                        Select governing body
                      </option>
                      <option value="board">Board</option>
                      <option value="esgCommittee">ESG Committee</option>
                      <option value="auditCommittee">Audit Committee</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      3.3 How often does this body meet to review sustainability
                      performance?
                    </label>
                    <select
                      onChange={(e) =>
                        handleFormChange(
                          "governance",
                          "meetingFrequency",
                          e.target.value
                        )
                      }
                    >
                      <option value="" disabled>
                        Select frequency
                      </option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      3.4 Do you have documented policies or charters governing
                      sustainability data quality and process?
                    </label>
                    <div>
                      <input
                        type="radio"
                        id="policiesYes"
                        name="documentedPolicies"
                        value="yes"
                        onChange={(e) =>
                          handleFormChange(
                            "governance",
                            "documentedPolicies",
                            e.target.value
                          )
                        }
                      />
                      <label htmlFor="policiesYes">Yes</label>
                      <input
                        type="radio"
                        id="policiesNo"
                        name="documentedPolicies"
                        value="no"
                        onChange={(e) =>
                          handleFormChange(
                            "governance",
                            "documentedPolicies",
                            e.target.value
                          )
                        }
                      />
                      <label htmlFor="policiesNo">No</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      3.5 Please upload or link your organisational chart or
                      governance policy.
                    </label>
                    <input
                      type="file"
                      onChange={(e) =>
                        handleFormChange(
                          "governance",
                          "orgChart",
                          e.target.files[0]
                        )
                      }
                    />
                    <input
                      type="url"
                      placeholder="Or enter URL"
                      onChange={(e) =>
                        handleFormChange(
                          "governance",
                          "orgChartUrl",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "target" && (
            <div className="form-section">
              <div className="section-header">
                <h2>Target & Actions</h2>
                <p className="section-description">
                  Set specific, measurable sustainability targets and track your
                  progress.
                </p>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      4.1 For each material topic, please define your target
                      (what, baseline, target value, deadline).
                    </label>
                    <div className="repeatable-table">
                      {/* Repeatable table for targets */}
                      <div className="table-row">
                        <input
                          type="text"
                          placeholder="Target description"
                          onChange={(e) =>
                            handleFormChange(
                              "target",
                              "targetDescription",
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="number"
                          placeholder="Baseline value"
                          onChange={(e) =>
                            handleFormChange(
                              "target",
                              "baselineValue",
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="date"
                          placeholder="Baseline year"
                          onChange={(e) =>
                            handleFormChange(
                              "target",
                              "baselineYear",
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="number"
                          placeholder="Target value"
                          onChange={(e) =>
                            handleFormChange(
                              "target",
                              "targetValue",
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="date"
                          placeholder="Target year"
                          onChange={(e) =>
                            handleFormChange(
                              "target",
                              "targetYear",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      {/* Add more rows as needed */}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      4.2 What milestones or interim dates have you set?
                    </label>
                    <input
                      type="date"
                      multiple
                      onChange={(e) =>
                        handleFormChange("target", "milestones", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      4.3 List the actions you\u2019ll take to reach each
                      target.
                    </label>
                    <div className="repeatable-group">
                      {/* Repeatable group for actions */}
                      <div className="group-row">
                        <input
                          type="text"
                          placeholder="Action description"
                          onChange={(e) =>
                            handleFormChange(
                              "target",
                              "actionDescription",
                              e.target.value
                            )
                          }
                        />
                        <select
                          onChange={(e) =>
                            handleFormChange(
                              "target",
                              "linkedTarget",
                              e.target.value
                            )
                          }
                        >
                          <option value="" disabled>
                            Select linked target
                          </option>
                          {/* Options populated from 4.1 entries */}
                        </select>
                        <input
                          type="text"
                          placeholder="Owner"
                          onChange={(e) =>
                            handleFormChange(
                              "target",
                              "actionOwner",
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="date"
                          placeholder="Due date"
                          onChange={(e) =>
                            handleFormChange(
                              "target",
                              "dueDate",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      {/* Add more groups as needed */}
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      4.5 Do you update or revise targets/actions over time?
                    </label>
                    <div>
                      <input
                        type="radio"
                        id="updateYes"
                        name="updateTargets"
                        value="yes"
                        onChange={(e) =>
                          handleFormChange(
                            "target",
                            "updateTargets",
                            e.target.value
                          )
                        }
                      />
                      <label htmlFor="updateYes">Yes</label>
                      <input
                        type="radio"
                        id="updateNo"
                        name="updateTargets"
                        value="no"
                        onChange={(e) =>
                          handleFormChange(
                            "target",
                            "updateTargets",
                            e.target.value
                          )
                        }
                      />
                      <label htmlFor="updateNo">No</label>
                    </div>
                    <textarea
                      placeholder="Optional comments"
                      onChange={(e) =>
                        handleFormChange(
                          "target",
                          "updateComments",
                          e.target.value
                        )
                      }
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "data" && (
            <div className="form-section">
              <div className="section-header">
                <h2>Data & Reporting</h2>
                <p className="section-description">
                  Specify your reporting frameworks and data collection
                  methodologies.
                </p>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      5.1 Which metrics/KPIs do you currently track for each
                      target?
                    </label>
                    <select
                      multiple
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        handleFormChange(
                          "data",
                          "trackedMetrics",
                          selectedOptions
                        );
                      }}
                    >
                      <option value="metric1">Metric 1</option>
                      <option value="metric2">Metric 2</option>
                      {/* Add more options as needed */}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      5.2 For each metric, what is the data source? (e.g. ERP
                      system, Manual survey, Third‑party provider)
                    </label>
                    <input
                      type="text"
                      onChange={(e) =>
                        handleFormChange("data", "dataSource", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>5.3 How often is each metric collected?</label>
                    <select
                      onChange={(e) =>
                        handleFormChange(
                          "data",
                          "collectionFrequency",
                          e.target.value
                        )
                      }
                    >
                      <option value="" disabled>
                        Select frequency
                      </option>
                      <option value="daily">Daily</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      5.4 How would you rate the quality of each data source?
                    </label>
                    <select
                      onChange={(e) =>
                        handleFormChange("data", "dataQuality", e.target.value)
                      }
                    >
                      <option value="" disabled>
                        Select quality
                      </option>
                      <option value="poor">Poor</option>
                      <option value="fair">Fair</option>
                      <option value="good">Good</option>
                      <option value="excellent">Excellent</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      5.5 Do you have any data gaps preventing you from tracking
                      progress?
                    </label>
                    <div>
                      <input
                        type="radio"
                        id="dataGapsYes"
                        name="dataGaps"
                        value="yes"
                        onChange={(e) =>
                          handleFormChange("data", "dataGaps", e.target.value)
                        }
                      />
                      <label htmlFor="dataGapsYes">Yes</label>
                      <input
                        type="radio"
                        id="dataGapsNo"
                        name="dataGaps"
                        value="no"
                        onChange={(e) =>
                          handleFormChange("data", "dataGaps", e.target.value)
                        }
                      />
                      <label htmlFor="dataGapsNo">No</label>
                    </div>
                    <textarea
                      placeholder="Describe data gaps"
                      onChange={(e) =>
                        handleFormChange(
                          "data",
                          "dataGapsDescription",
                          e.target.value
                        )
                      }
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      5.6 Do you maintain an audit trail for your data?
                    </label>
                    <div>
                      <input
                        type="radio"
                        id="auditTrailYes"
                        name="auditTrail"
                        value="yes"
                        onChange={(e) =>
                          handleFormChange("data", "auditTrail", e.target.value)
                        }
                      />
                      <label htmlFor="auditTrailYes">Yes</label>
                      <input
                        type="radio"
                        id="auditTrailNo"
                        name="auditTrail"
                        value="no"
                        onChange={(e) =>
                          handleFormChange("data", "auditTrail", e.target.value)
                        }
                      />
                      <label htmlFor="auditTrailNo">No</label>
                    </div>
                    <textarea
                      placeholder="Describe audit trail"
                      onChange={(e) =>
                        handleFormChange(
                          "data",
                          "auditTrailDescription",
                          e.target.value
                        )
                      }
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      5.7 In what format should your final CSRD report be
                      exported?
                    </label>
                    <select
                      onChange={(e) =>
                        handleFormChange("data", "reportFormat", e.target.value)
                      }
                    >
                      <option value="" disabled>
                        Select format
                      </option>
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="xbrl">XBRL</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      5.8 Who is responsible for preparing and submitting the
                      report?
                    </label>
                    <input
                      type="text"
                      onChange={(e) =>
                        handleFormChange("data", "reportOwner", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="form-submit-container">
            <button
              className="form-submit-button"
              onClick={handleFormSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit CSRD Form"}
            </button>
          </div>
        </div>
      </div>

      {/* Chat Button and Widget */}
      <div
        className={`chat-widget-button ${
          chatWidgetOpen || isAnimating ? "hidden" : ""
        }`}
        onClick={handleOpenChat}
      >
        <BsChat size={24} />
        <div className="chat-tooltip">
          <h4>Chat with our Expert AI</h4>
          <p>Click me! I can answer all your CSRD related questions</p>
        </div>
      </div>

      {(chatWidgetOpen || isAnimating) && (
        <div className={`chat-widget ${isClosing ? "closing" : ""}`}>
          <div className="chat-widget-header">
            <h3>Chat with our Expert AI</h3>
            <div className="chat-actions">
              <button
                className="history-button"
                onClick={toggleSessionHistory}
                title="Chat History"
              >
                <BsClockHistory size={18} />
              </button>
              <button
                className="new-chat-button"
                onClick={startNewChatSession}
                title="New Chat"
              >
                <BsPlusCircle size={18} />
              </button>
              <button onClick={handleCloseChat} title="Close Chat">
                <BsX size={24} />
              </button>
            </div>
          </div>

          {showSessionHistory ? (
            <div className="chat-history-panel">
              <h4>Chat History</h4>
              {sessionHistoryLoading ? (
                <div className="loading-sessions">Loading history...</div>
              ) : chatSessions.length > 0 ? (
                <div className="chat-session-list">
                  {chatSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`chat-session-item ${
                        currentSessionId === session.id ? "active" : ""
                      }`}
                      onClick={() => loadChatSession(session.id)}
                    >
                      <div className="session-title">{session.title}</div>
                      <div className="session-date">
                        {formatSessionDate(session.updatedAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-sessions">No chat history found</div>
              )}
            </div>
          ) : (
            <div className="chat-messages">
              {messages.length === 0 && (
                <div className="welcome-message">
                  <h1>Hi,</h1>
                  <p>How can I assist you today?</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div
                  key={message.id || index}
                  className={`message ${
                    message.role === "user"
                      ? "user-message"
                      : "assistant-message"
                  } ${message.error ? "error" : ""}`}
                >
                  <div className="message-content">
                    {(message.content || " ").replace(/\*/g, "")}
                    {message.role === "assistant" &&
                      loading &&
                      index === messages.length - 1 && (
                        <span className="typing-indicator">
                          <span className="dot"></span>
                          <span className="dot"></span>
                          <span className="dot"></span>
                        </span>
                      )}
                    {message.error && (
                      <div className="error-indicator">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        <span>Error connecting to AI service</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {!showSessionHistory && (
            <>
              <form onSubmit={handleSubmit} className="chat-input-container">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    backendStatus === "offline"
                      ? "AI service unavailable..."
                      : "Type a message..."
                  }
                  disabled={loading || backendStatus === "offline"}
                  className="chat-input"
                />
                <button
                  type="submit"
                  disabled={loading || backendStatus === "offline"}
                  className="send-button"
                >
                  {loading ? "..." : "Send"}
                </button>
              </form>

              {backendStatus !== "unknown" && (
                <div className={`backend-status ${backendStatus}`}>
                  <div className={`status-indicator ${backendStatus}`}></div>
                  <span>
                    {backendStatus === "online"
                      ? "AI Service Connected"
                      : "AI Service Unavailable - Try a simple question to test connection"}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CSRD;
