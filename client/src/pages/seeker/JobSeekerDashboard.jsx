
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NotificationBell from "../../components/NotificationBell";

function JobSeekerDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);

  const [loading, setLoading] = useState(true);

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
    const loadDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        const headers = {
          Authorization: `Bearer ${token}`
        };

        const [
          jobsResponse,
          applicationsResponse,
          savedJobsResponse
        ] = await Promise.all([
          fetch(
            "http://localhost:5000/api/jobs?limit=100",
            { headers }
          ),

          fetch(
            "http://localhost:5000/api/applications/my",
            { headers }
          ),

          fetch(
            "http://localhost:5000/api/saved-jobs/my",
            { headers }
          )
        ]);

        const jobsData =
          await jobsResponse.json();

        const applicationsData =
          await applicationsResponse.json();

        const savedJobsData =
          await savedJobsResponse.json();

        if (jobsResponse.ok) {
          setJobs(jobsData.jobs || []);
        }

        if (applicationsResponse.ok) {
          setApplications(
            applicationsData.applications || []
          );
        }

        if (savedJobsResponse.ok) {
          setSavedJobs(
            savedJobsData.savedJobs || []
          );
        }

      } catch (error) {
        console.error(
          "Dashboard loading error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">
          <p>Loading dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard-page">

      <div className="dashboard-container">

        {/* Header */}

        <div className="dashboard-header">

          <div>

            <p className="dashboard-label">
              JOB SEEKER DASHBOARD
            </p>

            <h1>
              Welcome back,{" "}
              {user.name || "Job Seeker"} 👋
            </h1>

            <p>
              Manage your job search and career journey.
            </p>

          </div>

          <div className="dashboard-header-actions">

            <NotificationBell />

            <Link
              to="/jobs"
              className="dashboard-primary-button"
            >
              Find Jobs
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

        {/* Stats */}

        <div className="dashboard-stats">

          <div className="dashboard-stat-card">
            <span>Available Jobs</span>
            <strong>{jobs.length}</strong>
          </div>

          <div className="dashboard-stat-card">
            <span>Applications</span>
            <strong>{applications.length}</strong>
          </div>

          <div className="dashboard-stat-card">
            <span>Saved Jobs</span>
            <strong>{savedJobs.length}</strong>
          </div>

        </div>

        {/* Quick Actions */}

        <section className="dashboard-section">

          <h2>Quick Actions</h2>

          <div className="dashboard-actions">

            <Link to="/jobs">
              Find Jobs
            </Link>

            <Link to="/job-seeker/applications">
              My Applications
            </Link>

            <Link to="/job-seeker/saved-jobs">
              Saved Jobs
            </Link>

            <Link to="/job-seeker/ai-resume-analysis">
              AI Resume Analysis
            </Link>

            <Link to="/job-seeker/job-match">
              AI Job Match
            </Link>

            <Link to="/job-seeker/recommendations">
              AI Job Recommendations
            </Link>

            <Link to="/job-seeker/skill-gap">
              AI Skill Gap Analysis
            </Link>

          </div>

        </section>

        {/* Recent Applications */}

        <section className="dashboard-section">

          <div className="section-heading">

            <h2>
              Recent Applications
            </h2>

            <Link to="/job-seeker/applications">
              View All
            </Link>

          </div>

          {applications.length === 0 ? (

            <div className="empty-dashboard">
              You haven't applied for any jobs yet.
            </div>

          ) : (

            <div className="application-list">

              {applications
                .slice(0, 5)
                .map((application) => (

                  <div
                    className="application-item"
                    key={application._id}
                  >

                    <div>

                      <h3>
                        {application.jobId?.title}
                      </h3>

                      <p>
                        {application.jobId?.company}
                      </p>

                    </div>

                    <span
                      className={`status-badge status-${application.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {application.status}
                    </span>

                  </div>

                ))}

            </div>

          )}

        </section>

      </div>

    </main>
  );
}

export default JobSeekerDashboard;

