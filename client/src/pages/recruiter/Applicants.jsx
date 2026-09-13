
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function Applicants() {
  const { jobId } = useParams();

  const [applicants, setApplicants] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchApplicants = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login as a recruiter.");
      }

      const response = await fetch(
        `http://localhost:5000/api/applications/job/${jobId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load applicants"
        );
      }

      setApplicants(data.applications || []);
      setJob(data.job || null);
    } catch (error) {
      console.error("Applicants loading error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const updateStatus = async (applicationId, status) => {
    try {
      const token = localStorage.getItem("token");

      setUpdatingId(applicationId);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/applications/${applicationId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            status
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update application status"
        );
      }

      setApplicants((currentApplicants) =>
        currentApplicants.map((application) =>
          application._id === applicationId
            ? {
                ...application,
                status: status
              }
            : application
        )
      );
    } catch (error) {
      console.error("Status update error:", error);
      setError(error.message);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <main className="applicants-page">
        <div className="applicants-container">
          <p>Loading applicants...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="applicants-page">
      <div className="applicants-container">

        {/* Navigation */}
        <div className="applicants-navigation">

          <Link
            to="/recruiter/dashboard"
            className="applicants-dashboard-link"
          >
            ← Dashboard
          </Link>

          <Link
            to="/recruiter/jobs"
            className="applicants-back"
          >
            ← Manage Jobs
          </Link>

        </div>

        {/* Header */}
        <div className="applicants-header">

          <div>
            <p className="applicants-label">
              RECRUITER
            </p>

            <h1>Applicants</h1>

            {job && (
              <p>
                Applications for{" "}
                <strong>{job.title}</strong>
              </p>
            )}
          </div>

          <div className="applicants-count">
            <span>Total Applicants</span>
            <strong>{applicants.length}</strong>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="applicants-error">
            {error}
          </div>
        )}

        {/* No Applicants */}
        {!error && applicants.length === 0 && (
          <div className="applicants-empty">
            <h2>No applicants yet</h2>

            <p>
              No candidates have applied for this job yet.
            </p>
          </div>
        )}

        {/* Applicants List */}
        {applicants.length > 0 && (
          <div className="applicants-list">

            {applicants.map((application) => {

              const applicant =
                application.applicantId || {};

              return (
                <div
                  className="applicant-card"
                  key={application._id}
                >

                  {/* Applicant Information */}
                  <div className="applicant-main">

                    <div className="applicant-avatar">
                      {applicant.name
                        ? applicant.name
                            .charAt(0)
                            .toUpperCase()
                        : "U"}
                    </div>

                    <div className="applicant-info">

                      <h2>
                        {applicant.name ||
                          "Unknown Candidate"}
                      </h2>

                      <p>
                        {applicant.email ||
                          "Email not available"}
                      </p>

                      <span>
                        Applied on{" "}
                        {new Date(
                          application.createdAt
                        ).toLocaleDateString()}
                      </span>

                    </div>

                  </div>

                  {/* Application Details */}
                  <div className="applicant-middle">

                    <div className="applicant-status">
                      <span>Status</span>

                      <strong
                        className={`applicant-status-badge status-${application.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {application.status}
                      </strong>
                    </div>

                    {application.coverLetter && (
                      <div className="applicant-cover-letter">
                        <span>Cover Letter</span>

                        <p>
                          {application.coverLetter}
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Status Update */}
                  <div className="applicant-actions">

                    <label>
                      Update Status
                    </label>

                    <select
                      value={application.status}
                      disabled={
                        updatingId === application._id
                      }
                      onChange={(e) =>
                        updateStatus(
                          application._id,
                          e.target.value
                        )
                      }
                    >
                      <option value="Applied">
                        Applied
                      </option>

                      <option value="Shortlisted">
                        Shortlisted
                      </option>

                      <option value="Interview">
                        Interview
                      </option>

                      <option value="Rejected">
                        Rejected
                      </option>

                      <option value="Hired">
                        Hired
                      </option>
                    </select>

                    {updatingId === application._id && (
                      <small>
                        Updating...
                      </small>
                    )}

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}

export default Applicants;

