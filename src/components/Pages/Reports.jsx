import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { FiDownload, FiTrash2, FiSearch, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import "./Reports.css";

const Reports = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Fetch reports from Firestore
  useEffect(() => {
    const fetchReports = async () => {
      if (!user?.uid) return;

      try {
        const q = query(
          collection(db, "csrdSubmissions"),
          where("userId", "==", user.uid)
        );

        const querySnapshot = await getDocs(q);
        const reportsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().timestamp?.toDate() || new Date(),
          lastAccessed: doc.data().timestamp?.toDate() || new Date(),
        }));

        console.log("Fetched reports:", reportsList);

        // Sort by date descending
        reportsList.sort((a, b) => b.date - a.date);

        setReports(reportsList);
        setFilteredReports(reportsList);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  // Generate and download report as text file (simple alternative)
  const generateReportFile = (report) => {
    try {
      console.log("Generating report for:", report.id);
      console.log("Report data:", report);

      // Create text content
      let textContent = `CSRD REPORT\n\n`;
      textContent += `Report ID: ${report.id}\n`;
      textContent += `Created by: ${report.userName || "Unknown"}\n`;
      textContent += `Date: ${report.date.toLocaleDateString()}\n\n`;

      // Add form data if it exists
      if (report.formData) {
        Object.entries(report.formData).forEach(
          ([sectionName, sectionData]) => {
            if (sectionData && Object.keys(sectionData).length > 0) {
              textContent += `\n== ${formatSectionName(sectionName)} ==\n\n`;

              Object.entries(sectionData).forEach(([key, value]) => {
                textContent += `${formatFieldName(key)}: ${
                  value || "Not provided"
                }\n`;
              });
            }
          }
        );
      } else {
        textContent += "No form data available for this report.";
      }

      // Create a Blob with the text content
      const blob = new Blob([textContent], { type: "text/plain" });

      // Create a download link and trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CSRD_Report_${report.id.substring(0, 7)}.txt`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    }
  };

  // Format section name
  const formatSectionName = (name) => {
    return (
      name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, " $1")
    );
  };

  // Format field name
  const formatFieldName = (name) => {
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  // Delete report
  const handleDeleteReport = async (reportId) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await deleteDoc(doc(db, "csrdSubmissions", reportId));
        setReports((prev) => prev.filter((report) => report.id !== reportId));
        setFilteredReports((prev) =>
          prev.filter((report) => report.id !== reportId)
        );
        toast.success("Report deleted successfully");
      } catch (error) {
        console.error("Error deleting report:", error);
        toast.error("Failed to delete report");
      }
    }
  };

  // Filter reports based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredReports(reports);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = reports.filter(
        (report) =>
          report.id.toLowerCase().includes(query) ||
          (report.formData?.materiality?.requiredSelect || "")
            .toLowerCase()
            .includes(query) ||
          (report.userName || "").toLowerCase().includes(query)
      );
      setFilteredReports(filtered);
    }
  }, [searchQuery, reports]);

  // Format date for display
  const formatDate = (date) => {
    if (!date) return "N/A";

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  // Get status class for styling
  const getStatusClass = (status) => {
    const statusLower = status.toLowerCase().replace(" ", "-");
    return `status-${statusLower}`;
  };

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentEntries = filteredReports.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  return (
    <div className="reports-container">
      <h1>CSRD Reports</h1>

      <div className="reports-header">
        <div className="entries-search">
          <div className="entries-dropdown">
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <button
          className="add-report-btn"
          onClick={() => navigate("/dashboard/csrd")}
        >
          <FiPlus /> Add Report
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading reports...</div>
      ) : (
        <>
          <div className="reports-table-container">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>File Name</th>
                  <th>Created By</th>
                  <th>Date</th>
                  <th>Last Accessed</th>
                  <th>Reporting Year</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  currentEntries.map((report) => (
                    <tr key={report.id}>
                      <td>{report.id.substring(0, 7)}</td>
                      <td>
                        CSRD{" "}
                        {report.formData?.materiality?.requiredSelect ||
                          "Report"}
                      </td>
                      <td>{report.userName}</td>
                      <td>{formatDate(report.date)}</td>
                      <td>{formatDate(report.lastAccessed)}</td>
                      <td>{new Date().getFullYear()}</td>
                      <td>
                        <span
                          className={`status-badge ${getStatusClass(
                            "Submitted"
                          )}`}
                        >
                          Submitted
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button
                          className="download-btn"
                          onClick={() => generateReportFile(report)}
                          title="Download Report"
                        >
                          <FiDownload />
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteReport(report.id)}
                          title="Delete report"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="no-reports">
                      No reports found. Create your first CSRD report!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    className={page === currentPage ? "active" : ""}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
