
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login as a recruiter.");
      }

      const response = await fetch(
        "http://localhost:5000/api/jobs/recruiter/my",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load jobs"
        );
      }

      setJobs(data.jobs || []);

    } catch (error) {
      console.error(
        "Manage jobs error:",
        error
      );

      setError(error.message);

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchJobs();
  }, []);


  const deleteJob = async (jobId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/jobs/${jobId}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete job"
        );
      }

      setJobs((currentJobs) =>
        currentJobs.filter(
          (job) => job._id !== jobId
        )
      );

    } catch (error) {
      alert(error.message);
    }
  };


  const closeJob = async (job) => {
    try {
      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/jobs/${job._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`
          },
          body: JSON.stringify({
            status: "closed"
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to close job"
        );
      }

      setJobs((currentJobs) =>
        currentJobs.map(
          (currentJob) =>
            currentJob._id === job._id
              ? {
                  ...currentJob,
                  status: "closed"
                }
              : currentJob
        )
      );

    } catch (error) {
      alert(error.message);
    }
  };


  if (loading) {
    return (
      <main className="manage-jobs-page">

        <div className="manage-jobs-container">

          <p>
            Loading your jobs...
          </p>

        </div>

      </main>
    );
  }


  return (
    <main className="manage-jobs-page">

      <div className="manage-jobs-container">

        {/* HEADER */}

        <div className="manage-jobs-header">

          <div>

            <p className="manage-jobs-label">
              RECRUITER
            </p>

            <h1>
              Manage Jobs
            </h1>

            <p>
              View and manage all the jobs
              you have posted.
            </p>

          </div>


          <div className="manage-jobs-header-actions">

            <Link
              to="/recruiter/dashboard"
              className="manage-jobs-dashboard-button"
            >
              ← Dashboard
            </Link>


            <Link
              to="/recruiter/create-job"
              className="manage-jobs-primary-button"
            >
              + Post New Job
            </Link>

          </div>

        </div>


        {/* ERROR */}

        {error && (
          <div className="manage-jobs-error">
            {error}
          </div>
        )}


        {/* EMPTY */}

        {!error &&
          jobs.length === 0 && (

            <div className="manage-jobs-empty">

              <h2>
                No jobs posted yet
              </h2>

              <p>
                Create your first job posting
                to start finding candidates.
              </p>

              <Link
                to="/recruiter/create-job"
                className="manage-jobs-primary-button"
              >
                Post a Job
              </Link>

            </div>

          )}


        {/* JOBS */}

        {jobs.length > 0 && (

          <div className="manage-jobs-list">

            {jobs.map((job) => (

              <div
                className="manage-job-card"
                key={job._id}
              >

                <div className="manage-job-main">

                  <div className="manage-job-top">

                    <span
                      className={`manage-job-status ${
                        job.status === "active"
                          ? "active"
                          : "closed"
                      }`}
                    >
                      {job.status}
                    </span>

                    <span className="manage-job-type">
                      {job.jobType}
                    </span>

                  </div>


                  <h2>
                    {job.title}
                  </h2>

                  <h3>
                    {job.company}
                  </h3>


                  <p className="manage-job-location">
                    📍 {job.location}
                  </p>


                  <div className="manage-job-details">

                    <span>
                      💰 {job.salary}
                    </span>

                    <span>
                      💼 {job.experience}
                    </span>

                  </div>


                  <div className="manage-job-skills">

                    {job.skills?.map(
                      (skill, index) => (

                        <span key={index}>
                          {skill}
                        </span>

                      )
                    )}

                  </div>

                </div>


                {/* ACTIONS */}

                <div className="manage-job-actions">

                  <Link
                    to={`/jobs/${job._id}`}
                    className="manage-job-view-button"
                  >
                    View
                  </Link>


                  <Link
                    to={`/recruiter/jobs/${job._id}/applicants`}
                    className="manage-job-applicants-button"
                  >
                    Applicants
                  </Link>


                  <Link
                    to={`/recruiter/jobs/${job._id}/edit`}
                    className="manage-job-edit-button"
                  >
                    Edit
                  </Link>


                  {job.status === "active" && (

                    <button
                      className="manage-job-close-button"
                      onClick={() =>
                        closeJob(job)
                      }
                    >
                      Close
                    </button>

                  )}


                  <button
                    className="manage-job-delete-button"
                    onClick={() =>
                      deleteJob(job._id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </main>
  );
}

export default ManageJobs;

