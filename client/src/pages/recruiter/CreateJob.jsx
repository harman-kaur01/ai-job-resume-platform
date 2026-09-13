
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function CreateJob() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    description: "",
    skills: "",
    salary: "",
    jobType: "Full-time",
    experience: "Fresher"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please login as a recruiter.");
      }

      const skillsArray = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill !== "");

      if (skillsArray.length === 0) {
        throw new Error("Please enter at least one skill.");
      }

      const response = await fetch(
        "http://localhost:5000/api/jobs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            title: formData.title,
            company: formData.company,
            location: formData.location,
            description: formData.description,
            skills: skillsArray,
            salary: formData.salary,
            jobType: formData.jobType,
            experience: formData.experience
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create job"
        );
      }

      setSuccess("Job posted successfully!");

      setFormData({
        title: "",
        company: "",
        location: "",
        description: "",
        skills: "",
        salary: "",
        jobType: "Full-time",
        experience: "Fresher"
      });

      setTimeout(() => {
        navigate("/recruiter/jobs");
      }, 1000);

    } catch (error) {
      console.error("Create job error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="create-job-page">
      <div className="create-job-container">

        {/* Navigation */}
        <div className="create-job-navigation">

          <Link
            to="/recruiter/dashboard"
            className="create-job-back"
          >
            ← Dashboard
          </Link>

          <Link
            to="/recruiter/jobs"
            className="create-job-manage"
          >
            Manage Jobs
          </Link>

        </div>

        {/* Header */}
        <div className="create-job-header">

          <p className="create-job-label">
            RECRUITER
          </p>

          <h1>Post a New Job</h1>

          <p>
            Create a job opportunity and start finding
            the right candidates.
          </p>

        </div>

        {/* Form */}
        <form
          className="create-job-form"
          onSubmit={handleSubmit}
        >

          {error && (
            <div className="create-job-error">
              {error}
            </div>
          )}

          {success && (
            <div className="create-job-success">
              {success}
            </div>
          )}

          <div className="create-job-grid">

            <div className="create-job-field">
              <label>Job Title *</label>

              <input
                type="text"
                name="title"
                placeholder="e.g. Python Developer"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="create-job-field">
              <label>Company *</label>

              <input
                type="text"
                name="company"
                placeholder="e.g. Tech Solutions"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>

            <div className="create-job-field">
              <label>Location *</label>

              <input
                type="text"
                name="location"
                placeholder="e.g. Mohali"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="create-job-field">
              <label>Salary</label>

              <input
                type="text"
                name="salary"
                placeholder="e.g. 4-6 LPA"
                value={formData.salary}
                onChange={handleChange}
              />
            </div>

            <div className="create-job-field">
              <label>Job Type</label>

              <select
                name="jobType"
                value={formData.jobType}
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

            <div className="create-job-field">
              <label>Experience</label>

              <input
                type="text"
                name="experience"
                placeholder="e.g. Fresher"
                value={formData.experience}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="create-job-field">

            <label>Required Skills *</label>

            <input
              type="text"
              name="skills"
              placeholder="Python, Django, Flask, MySQL"
              value={formData.skills}
              onChange={handleChange}
              required
            />

            <small>
              Separate skills with commas.
            </small>

          </div>

          <div className="create-job-field">

            <label>Job Description *</label>

            <textarea
              name="description"
              placeholder="Describe the job responsibilities, requirements and expectations..."
              value={formData.description}
              onChange={handleChange}
              rows="8"
              required
            ></textarea>

          </div>

          <div className="create-job-actions">

            <Link
              to="/recruiter/dashboard"
              className="create-job-cancel"
            >
              Cancel
            </Link>

            <button
              type="submit"
              className="create-job-submit"
              disabled={loading}
            >
              {loading
                ? "Posting Job..."
                : "Post Job"}
            </button>

          </div>

        </form>

      </div>
    </main>
  );
}

export default CreateJob;

