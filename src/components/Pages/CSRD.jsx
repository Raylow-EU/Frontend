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

  // Load chat sessions when the user opens the chat widget
  useEffect(() => {
    if (chatWidgetOpen && user?.uid && !currentSessionId) {
      // Create a new session by default when opening the chat
      startNewChatSession();
    }
  }, [chatWidgetOpen, user]);

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
  const startNewChatSession = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const newSession = await createChatSession(user.uid);
      setCurrentSessionId(newSession.id);
      setMessages([]);
      // Add the new session to the list
      setChatSessions((prev) => [newSession, ...prev]);
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
      setLoading(true);
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

  // Close chat widget with animation
  const handleCloseChat = () => {
    setIsClosing(true);
    setIsAnimating(true);

    // Use a slightly longer timeout than the animation duration
    setTimeout(() => {
      setChatWidgetOpen(false);
      setIsClosing(false);
      setCurrentSessionId(null);
      setMessages([]);

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
        }, 30000); // 30 seconds timeout
      };

      // Set initial timeout
      setupTimeout();

      // Handle incoming message chunks
      eventSource.onmessage = (event) => {
        // Reset timeout on each message
        setupTimeout();

        const chunk = event.data;
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
                  Identify and prioritize the sustainability issues that are
                  most significant to your organization and stakeholders.
                </p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div className="form-label-group">
                    <label>Assessment Details</label>
                    <div className="form-field">
                      <label>
                        Assessment Method <span className="required">*</span>
                      </label>
                      <select
                        defaultValue=""
                        onChange={(e) =>
                          handleFormChange(
                            "materiality",
                            "assessmentMethod",
                            e.target.value
                          )
                        }
                      >
                        <option value="" disabled>
                          Select assessment method
                        </option>
                        <option value="doubleMaterilaity">
                          Double Materiality
                        </option>
                        <option value="stakeholderEngagement">
                          Stakeholder Engagement
                        </option>
                        <option value="impactAssessment">
                          Impact Assessment
                        </option>
                      </select>
                      <span className="helper-text">
                        The methodology used to assess materiality
                      </span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-field">
                    <label>Assessment Frequency</label>
                    <select
                      defaultValue=""
                      onChange={(e) =>
                        handleFormChange(
                          "materiality",
                          "assessmentFrequency",
                          e.target.value
                        )
                      }
                    >
                      <option value="" disabled>
                        Select frequency
                      </option>
                      <option value="annual">Annual</option>
                      <option value="biannual">Bi-annual</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                    <span className="helper-text">
                      How often your organization conducts materiality
                      assessments
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      Top Material Topics <span className="required">*</span>
                    </label>
                    <textarea
                      placeholder="List your top 3-5 material topics identified in your assessment"
                      onChange={(e) =>
                        handleFormChange(
                          "materiality",
                          "materialTopics",
                          e.target.value
                        )
                      }
                      rows="4"
                    ></textarea>
                    <span className="helper-text">
                      These are the issues that have the most significant impact
                      on your business and stakeholders
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <div className="form-field">
                    <label>Last Assessment Date</label>
                    <input
                      type="date"
                      onChange={(e) =>
                        handleFormChange(
                          "materiality",
                          "lastAssessmentDate",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="form-field error">
                    <label>
                      Stakeholders Involved <span className="required">*</span>
                    </label>
                    <select
                      defaultValue={[]}
                      onChange={(e) => {
                        const selectedOptions = Array.from(
                          e.target.selectedOptions,
                          (option) => option.value
                        );
                        handleFormChange(
                          "materiality",
                          "stakeholdersInvolved",
                          selectedOptions
                        );
                      }}
                      multiple
                    >
                      <option value="employees">Employees</option>
                      <option value="customers">Customers</option>
                      <option value="suppliers">Suppliers</option>
                      <option value="investors">Investors</option>
                      <option value="localCommunities">
                        Local Communities
                      </option>
                      <option value="ngos">NGOs</option>
                    </select>
                    <div className="error-message">
                      Please select at least one stakeholder group
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>Assessment Methodology Description</label>
                    <textarea
                      placeholder="Briefly describe how your organization conducted the materiality assessment..."
                      onChange={(e) =>
                        handleFormChange(
                          "materiality",
                          "methodologyDescription",
                          e.target.value
                        )
                      }
                      rows="3"
                    ></textarea>
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
                      Stakeholder Groups <span className="required">*</span>
                    </label>
                    <select
                      onChange={(e) =>
                        handleFormChange(
                          "stakeholder",
                          "stakeholderGroups",
                          e.target.value
                        )
                      }
                    >
                      <option value="" disabled>
                        Select stakeholder groups
                      </option>
                      <option value="employees">Employees</option>
                      <option value="customers">Customers</option>
                      <option value="investors">Investors</option>
                      <option value="suppliers">Suppliers</option>
                      <option value="communities">Local Communities</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>Engagement Method</label>
                    <textarea
                      placeholder="Describe your stakeholder engagement methods"
                      rows="4"
                      onChange={(e) =>
                        handleFormChange(
                          "stakeholder",
                          "engagementMethod",
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
                  Detail your organization&apos;s governance structure for
                  sustainability issues.
                </p>
              </div>

              <div className="form-row">
                <div className="form-group full-width">
                  <div className="form-field">
                    <label>
                      Sustainability Governance{" "}
                      <span className="required">*</span>
                    </label>
                    <textarea
                      placeholder="Describe your sustainability governance structure"
                      rows="4"
                      onChange={(e) =>
                        handleFormChange(
                          "governance",
                          "sustainabilityGovernance",
                          e.target.value
                        )
                      }
                    ></textarea>
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
                      Carbon Reduction Target{" "}
                      <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 50% by 2030"
                      onChange={(e) =>
                        handleFormChange(
                          "target",
                          "carbonTarget",
                          e.target.value
                        )
                      }
                    />
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
                      Reporting Framework <span className="required">*</span>
                    </label>
                    <select
                      defaultValue=""
                      onChange={(e) =>
                        handleFormChange(
                          "data",
                          "reportingFramework",
                          e.target.value
                        )
                      }
                    >
                      <option value="" disabled>
                        Select reporting framework
                      </option>
                      <option value="gri">GRI Standards</option>
                      <option value="sasb">SASB</option>
                      <option value="tcfd">TCFD</option>
                      <option value="csrd">CSRD</option>
                    </select>
                    <span className="helper-text">
                      The primary framework used for sustainability reporting
                    </span>
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
                    {message.content || " "}
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
