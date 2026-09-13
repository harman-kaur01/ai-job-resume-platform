import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/applications/my",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load applications"
          );
        }

        setApplications(data.applications || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return (
      <main className="applications-page">
        <div className="applications-container">
          <p>Loading applications...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="applications-page">
      <div className="applications-container">

        <div className="applications-header">
          <div>
            <p className="applications-label">
              JOB SEEKER
            </p>

            <h1>My Applications</h1>

            <p>
              Track the jobs you have applied for.
            </p>
          </div>

          <Link
            to="/jobs"
            className="applications-button"
          >
            Find More Jobs
          </Link>
        </div>

        {error && (
          <div className="applications-error">
            {error}
          </div>
        )}

        {!error && applications.length === 0 && (
          <div className="applications-empty">
            <h2>No applications yet</h2>

            <p>
              Start applying for jobs to track your
              applications here.
            </p>

            <Link to="/jobs">
              Browse Jobs
            </Link>
          </div>
        )}

        {applications.length > 0 && (
          <div className="applications-list">

            {applications.map((application) => (
              <div
                className="application-card"
                key={application._id}
              >

                <div className="application-main">

                  <div>
                    <h2>
                      {application.jobId?.title ||
                        "Job"}
                    </h2>

                    <p className="application-company">
                      {application.jobId?.company ||
                        "Company"}
                    </p>

                    <p className="application-location">
                      📍{" "}
                      {application.jobId?.location ||
                        "Location not available"}
                    </p>
                  </div>

                  <span
                    className={`application-status status-${application.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {application.status}
                  </span>

                </div>

                <div className="application-details">

                  <span>
                    💼{" "}
                    {application.jobId?.jobType ||
                      "Not specified"}
                  </span>

                  <span>
                    💰{" "}
                    {application.jobId?.salary ||
                      "Not disclosed"}
                  </span>

                  <span>
                    Applied{" "}
                    {new Date(
                      application.createdAt
                    ).toLocaleDateString()}
                  </span>

                </div>

              </div>
            ))}

          </div>
        )}

      </div>
    </main>
  );
}

export default MyApplications;