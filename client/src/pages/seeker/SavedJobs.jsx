import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSavedJobs = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/saved-jobs/my",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load saved jobs"
        );
      }

      setSavedJobs(data.savedJobs || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const removeSavedJob = async (jobId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/saved-jobs/${jobId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to remove job"
        );
      }

      setSavedJobs((currentJobs) =>
        currentJobs.filter(
          (item) => item.jobId?._id !== jobId
        )
      );
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <main className="saved-jobs-page">
        <div className="saved-jobs-container">
          <p>Loading saved jobs...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="saved-jobs-page">
      <div className="saved-jobs-container">

        <div className="saved-jobs-header">
          <div>
            <p className="saved-jobs-label">
              JOB SEEKER
            </p>

            <h1>Saved Jobs</h1>

            <p>
              Jobs you saved for later.
            </p>
          </div>

          <Link
            to="/jobs"
            className="saved-jobs-button"
          >
            Find Jobs
          </Link>
        </div>

        {error && (
          <div className="saved-jobs-error">
            {error}
          </div>
        )}

        {!error && savedJobs.length === 0 && (
          <div className="saved-jobs-empty">
            <h2>No saved jobs</h2>

            <p>
              Save interesting jobs and they will
              appear here.
            </p>

            <Link to="/jobs">
              Browse Jobs
            </Link>
          </div>
        )}

        {savedJobs.length > 0 && (
          <div className="saved-jobs-list">

            {savedJobs.map((savedJob) => {
              const job = savedJob.jobId;

              if (!job) {
                return null;
              }

              return (
                <div
                  className="saved-job-card"
                  key={savedJob._id}
                >

                  <div className="saved-job-content">

                    <h2>{job.title}</h2>

                    <p className="saved-job-company">
                      {job.company}
                    </p>

                    <p className="saved-job-location">
                      📍 {job.location}
                    </p>

                    <div className="saved-job-details">
                      <span>
                        💼 {job.jobType}
                      </span>

                      <span>
                        💰 {job.salary}
                      </span>

                      <span>
                        Experience: {job.experience}
                      </span>
                    </div>

                  </div>

                  <div className="saved-job-actions">

                    <Link
                      to={`/jobs/${job._id}`}
                      className="view-job-button"
                    >
                      View Job
                    </Link>

                    <button
                      className="remove-job-button"
                      onClick={() =>
                        removeSavedJob(job._id)
                      }
                    >
                      Remove
                    </button>

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

export default SavedJobs;