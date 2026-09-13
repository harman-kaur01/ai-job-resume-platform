
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          throw new Error("Please login as a recruiter.");
        }

        const response = await fetch(
          `http://localhost:5000/api/jobs/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load job"
          );
        }

        setJob(data.job);
      } catch (error) {
        console.error("Load job error:", error);
        setMessage(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [id]);

  const handleChange = (e) => {
    setJob({
      ...job,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login as a recruiter.");
      }

      const updatedJob = {
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        skills: job.skills,
        salary: job.salary,
        jobType: job.jobType,
        experience: job.experience,
        status: job.status
      };

      const response = await fetch(
        `http://localhost:5000/api/jobs/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updatedJob)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update job"
        );
      }

      alert("Job updated successfully!");

      navigate("/recruiter/jobs");
    } catch (error) {
      console.error("Update job error:", error);
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-job-page">
        <div className="edit-job-container">
          <h2>Loading job...</h2>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="edit-job-page">
        <div className="edit-job-container">

          <h2>Unable to load job</h2>

          <p>{message}</p>

          <Link to="/recruiter/jobs">
            Back to Manage Jobs
          </Link>

        </div>
      </div>
    );
  }

  return (
    <div className="edit-job-page">
      <div className="edit-job-container">

        {/* Navigation */}
        <div className="edit-job-navigation">

          <Link
            to="/recruiter/dashboard"
            className="edit-job-dashboard-link"
          >
            ← Dashboard
          </Link>

          <Link
            to="/recruiter/jobs"
            className="edit-job-back"
          >
            ← Manage Jobs
          </Link>

        </div>

        {/* Header */}
        <div className="edit-job-header">

          <p className="edit-job-label">
            RECRUITER
          </p>

          <h1>Edit Job</h1>

          <p>
            Update your job posting details.
          </p>

        </div>

        {/* Error */}
        {message && (
          <div className="edit-job-error">
            {message}
          </div>
        )}

        {/* Form */}
        <form
          className="edit-job-form"
          onSubmit={handleSubmit}
        >

          <div className="edit-job-grid">

            <div className="edit-job-field">
              <label>Job Title</label>

              <input
                type="text"
                name="title"
                value={job.title || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="edit-job-field">
              <label>Company</label>

              <input
                type="text"
                name="company"
                value={job.company || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="edit-job-field">
              <label>Location</label>

              <input
                type="text"
                name="location"
                value={job.location || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="edit-job-field">
              <label>Salary</label>

              <input
                type="text"
                name="salary"
                value={job.salary || ""}
                onChange={handleChange}
              />
            </div>

            <div className="edit-job-field">
              <label>Job Type</label>

              <select
                name="jobType"
                value={job.jobType || "Full-time"}
                onChange={handleChange}
              >
                <option value="Full-time">
                  Full-time
                </option>

                <option value="Part-time">
                  Part-time
                </option>

                <option value="Internship">
                  Internship
                </option>

                <option value="Contract">
                  Contract
                </option>
              </select>
            </div>

            <div className="edit-job-field">
              <label>Experience</label>

              <input
                type="text"
                name="experience"
                value={job.experience || ""}
                onChange={handleChange}
              />
            </div>

            <div className="edit-job-field">
              <label>Status</label>

              <select
                name="status"
                value={job.status || "active"}
                onChange={handleChange}
              >
                <option value="active">
                  Active
                </option>

                <option value="closed">
                  Closed
                </option>
              </select>
            </div>

          </div>

          {/* Skills */}
          <div className="edit-job-field">

            <label>Skills</label>

            <input
              type="text"
              name="skills"
              value={
                Array.isArray(job.skills)
                  ? job.skills.join(", ")
                  : job.skills || ""
              }
              onChange={(e) =>
                setJob({
                  ...job,
                  skills: e.target.value
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean)
                })
              }
              required
            />

            <small>
              Separate skills with commas.
            </small>

          </div>

          {/* Description */}
          <div className="edit-job-field">

            <label>Description</label>

            <textarea
              name="description"
              value={job.description || ""}
              onChange={handleChange}
              rows="8"
              required
            />

          </div>

          {/* Submit */}
          <div className="edit-job-actions">

            <button
              type="submit"
              className="edit-job-submit"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
}

export default EditJob;

