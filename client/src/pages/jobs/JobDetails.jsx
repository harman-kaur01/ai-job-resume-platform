import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function JobDetails() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/jobs/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load job");
        }

        setJob(data.job);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const saveJob = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login as a job seeker to save jobs.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/saved-jobs/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save job");
      }

      setMessage("Job saved successfully!");
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const applyForJob = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("Please login as a job seeker to apply.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `http://localhost:5000/api/applications/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to apply for job");
      }

      setMessage("Application submitted successfully!");
    } catch (error) {
      setError(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="job-details-page">
        <div className="job-details-container">
          <div className="job-details-message">
            Loading job details...
          </div>
        </div>
      </main>
    );
  }

  if (error && !job) {
    return (
      <main className="job-details-page">
        <div className="job-details-container">
          <div className="job-details-error">
            {error}
          </div>

          <Link to="/jobs" className="back-to-jobs">
            ← Back to Jobs
          </Link>
        </div>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="job-details-page">
        <div className="job-details-container">
          <div className="job-details-message">
            Job not found.
          </div>

          <Link to="/jobs" className="back-to-jobs">
            ← Back to Jobs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="job-details-page">
      <div className="job-details-container">

        <Link to="/jobs" className="back-to-jobs">
          ← Back to Jobs
        </Link>

        <div className="job-details-card">

          <div className="job-details-header">
            <div>
              <span className="job-details-type">
                {job.jobType}
              </span>

              <h1>{job.title}</h1>

              <h2>{job.company}</h2>

              <p className="job-details-location">
                📍 {job.location}
              </p>
            </div>

            <div className="job-details-actions">
              <button
                className="save-job-details-button"
                onClick={saveJob}
                disabled={actionLoading}
              >
                ♡ {actionLoading ? "Please wait..." : "Save Job"}
              </button>

              <button
                className="apply-job-button"
                onClick={applyForJob}
                disabled={actionLoading}
              >
                {actionLoading ? "Please wait..." : "Apply Now"}
              </button>
            </div>
          </div>

          {message && (
            <div className="job-success-message">
              {message}
            </div>
          )}

          {error && (
            <div className="job-details-error">
              {error}
            </div>
          )}

          <div className="job-details-divider"></div>

          <div className="job-details-info">

            <div className="job-info-box">
              <span>Salary</span>
              <strong>{job.salary}</strong>
            </div>

            <div className="job-info-box">
              <span>Experience</span>
              <strong>{job.experience}</strong>
            </div>

            <div className="job-info-box">
              <span>Job Type</span>
              <strong>{job.jobType}</strong>
            </div>

            <div className="job-info-box">
              <span>Status</span>
              <strong>{job.status}</strong>
            </div>

          </div>

          <section className="job-details-section">
            <h2>Job Description</h2>
            <p>{job.description}</p>
          </section>

          <section className="job-details-section">
            <h2>Required Skills</h2>

            <div className="job-details-skills">
              {job.skills?.map((skill, index) => (
                <span key={index}>
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section className="job-details-section">
            <h2>About This Opportunity</h2>

            <p>
              This position is currently available on JobAI.
              Review the requirements above and apply if this
              opportunity matches your skills and career goals.
            </p>
          </section>

          <div className="job-details-bottom-action">
            <button
              className="apply-job-button"
              onClick={applyForJob}
              disabled={actionLoading}
            >
              {actionLoading
                ? "Submitting..."
                : "Apply for this Job"}
            </button>
          </div>

        </div>
      </div>
    </main>
  );
}

export default JobDetails;