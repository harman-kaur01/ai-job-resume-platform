

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "../../components/NotificationBell";

function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [totalApplications, setTotalApplications] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  useEffect(() => {
    const fetchRecruiterDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error(
            "Please login as a recruiter."
          );
        }

        // Fetch recruiter jobs
        const jobsResponse = await fetch(
          "http://localhost:5000/api/jobs/recruiter/my",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const jobsData = await jobsResponse.json();

        if (!jobsResponse.ok) {
          throw new Error(
            jobsData.message ||
              "Failed to load recruiter jobs"
          );
        }

        const recruiterJobs = jobsData.jobs || [];

        setJobs(recruiterJobs);

        // Fetch applications for each job
        if (recruiterJobs.length > 0) {
          const applicationResults =
            await Promise.all(
              recruiterJobs.map(async (job) => {
                try {
                  const response = await fetch(
                    `http://localhost:5000/api/applications/job/${job._id}`,
                    {
                      headers: {
                        Authorization: `Bearer ${token}`
                      }
                    }
                  );

                  const data =
                    await response.json();

                  if (!response.ok) {
                    return 0;
                  }

                  return Array.isArray(
                    data.applications
                  )
                    ? data.applications.length
                    : 0;
                } catch (error) {
                  console.error(
                    `Failed to fetch applications for job ${job._id}:`,
                    error
                  );

                  return 0;
                }
              })
            );

          const applicationCount =
            applicationResults.reduce(
              (total, count) =>
                total + count,
              0
            );

          setTotalApplications(
            applicationCount
          );
        } else {
          setTotalApplications(0);
        }
      } catch (error) {
        console.error(
          "Recruiter dashboard error:",
          error
        );

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiterDashboard();
  }, []);

  const totalJobs = jobs.length;

  const activeJobs = jobs.filter(
    (job) => job.status === "active"
  ).length;

  const closedJobs = jobs.filter(
    (job) => job.status === "closed"
  ).length;

  if (loading) {
    return (
      <main className="recruiter-dashboard-page">
        <div className="recruiter-dashboard-container">
          <p>
            Loading recruiter dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="recruiter-dashboard-page">
      <div className="recruiter-dashboard-container">

        {/* HEADER */}
        <div className="recruiter-dashboard-header">

          <div>
            <p className="recruiter-dashboard-label">
              RECRUITER DASHBOARD
            </p>

            <h1>
              Welcome back,{" "}
              {user.name || "Recruiter"} 👋
            </h1>

            <p>
              Manage your job postings and find
              the right candidates.
            </p>
          </div>

          {/* HEADER ACTIONS */}
          <div className="recruiter-dashboard-header-actions">

            <NotificationBell />

            <Link
              to="/recruiter/create-job"
              className="recruiter-primary-button"
            >
              + Post New Job
            </Link>

            <button
              type="button"
              className="recruiter-logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </div>

        {/* ERROR */}
        {error && (
          <div className="recruiter-dashboard-error">
            {error}
          </div>
        )}

        {/* STATS */}
        <div className="recruiter-stats">

          <div className="recruiter-stat-card">
            <span>
              Total Jobs
            </span>

            <strong>
              {totalJobs}
            </strong>
          </div>

          <div className="recruiter-stat-card">
            <span>
              Active Jobs
            </span>

            <strong>
              {activeJobs}
            </strong>
          </div>

          <div className="recruiter-stat-card">
            <span>
              Closed Jobs
            </span>

            <strong>
              {closedJobs}
            </strong>
          </div>

          <div className="recruiter-stat-card">
            <span>
              Total Applications
            </span>

            <strong>
              {totalApplications}
            </strong>
          </div>

        </div>

        {/* QUICK ACTIONS */}
        <section className="recruiter-dashboard-section">

          <h2>
            Quick Actions
          </h2>

          <div className="recruiter-actions">

            <Link to="/recruiter/create-job">
              <strong>
                Post a Job
              </strong>

              <span>
                Create a new job opportunity
              </span>
            </Link>

            <Link to="/recruiter/jobs">
              <strong>
                Manage Jobs
              </strong>

              <span>
                View and manage your postings
              </span>
            </Link>

            <Link to="/recruiter/jobs">
              <strong>
                View Applicants
              </strong>

              <span>
                Select a job to review candidates
              </span>
            </Link>

          </div>

        </section>

        {/* RECENT JOBS */}
        <section className="recruiter-dashboard-section">

          <div className="recruiter-section-heading">

            <div>
              <h2>
                Recent Job Postings
              </h2>

              <p>
                Your latest job postings.
              </p>
            </div>

            <Link to="/recruiter/jobs">
              View All
            </Link>

          </div>

          {jobs.length === 0 ? (

            <div className="recruiter-empty">

              <h3>
                No jobs posted yet
              </h3>

              <p>
                Create your first job posting to
                start finding candidates.
              </p>

              <Link
                to="/recruiter/create-job"
                className="recruiter-primary-button"
              >
                Post Your First Job
              </Link>

            </div>

          ) : (

            <div className="recruiter-jobs-list">

              {jobs
                .slice(0, 5)
                .map((job) => (

                  <div
                    className="recruiter-job-card"
                    key={job._id}
                  >

                    {/* JOB INFORMATION */}
                    <div className="recruiter-job-info">

                      <div className="recruiter-job-top">

                        <span
                          className={`recruiter-job-status ${
                            job.status === "active"
                              ? "active"
                              : "closed"
                          }`}
                        >
                          {job.status}
                        </span>

                        <span className="recruiter-job-type">
                          {job.jobType}
                        </span>

                      </div>

                      <h3>
                        {job.title}
                      </h3>

                      <p>
                        {job.company}
                      </p>

                      <span className="recruiter-job-location">
                        📍 {job.location}
                      </span>

                      <div className="recruiter-job-details">

                        <span>
                          💰 {job.salary}
                        </span>

                        <span>
                          💼 {job.experience}
                        </span>

                      </div>

                    </div>

                    {/* ACTIONS */}
                    <div className="recruiter-job-actions">

                      <Link
                        to={`/jobs/${job._id}`}
                        className="recruiter-view-button"
                      >
                        View
                      </Link>

                      <Link
                        to={`/recruiter/jobs/${job._id}/applicants`}
                        className="recruiter-applicants-button"
                      >
                        Applicants
                      </Link>

                      <Link
                        to={`/recruiter/jobs/${job._id}/edit`}
                        className="recruiter-edit-button"
                      >
                        Edit
                      </Link>

                    </div>

                  </div>

                ))}

            </div>

          )}

        </section>

      </div>
    </main>
  );
}

export default RecruiterDashboard;

