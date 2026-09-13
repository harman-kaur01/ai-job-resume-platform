
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function JobMatch() {
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);

  const [selectedJob, setSelectedJob] = useState("");
  const [selectedResume, setSelectedResume] = useState("");

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const [result, setResult] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please login as a job seeker first.");
          return;
        }

        const [jobsResponse, resumesResponse] =
          await Promise.all([
            fetch(
              "http://localhost:5000/api/jobs?limit=50"
            ),

            fetch(
              "http://localhost:5000/api/resumes/my",
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            )
          ]);

        const jobsData =
          await jobsResponse.json();

        const resumesData =
          await resumesResponse.json();

        if (!jobsResponse.ok) {
          throw new Error(
            jobsData.message ||
              "Failed to load jobs"
          );
        }

        if (!resumesResponse.ok) {
          throw new Error(
            resumesData.message ||
              "Failed to load resumes"
          );
        }

        setJobs(jobsData.jobs || []);
        setResumes(
          resumesData.resumes || []
        );

      } catch (error) {
        console.error(
          "Load Job Match data error:",
          error
        );

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAnalyze = async () => {
    if (!selectedJob) {
      setError("Please select a job.");
      return;
    }

    if (!selectedResume) {
      setError("Please select a resume.");
      return;
    }

    try {
      setAnalyzing(true);
      setError("");
      setResult(null);

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/job-matching/${selectedJob}/${selectedResume}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Job matching failed"
        );
      }

      setResult(data);

    } catch (error) {
      console.error(
        "Job matching error:",
        error
      );

      setError(error.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="job-match-page">
      <div className="job-match-container">

        <Link
          to="/job-seeker/dashboard"
          className="job-match-back"
        >
          ← Back to Dashboard
        </Link>

        <div className="job-match-header">
          <p className="job-match-label">
            AI POWERED
          </p>

          <h1>AI Job Match</h1>

          <p>
            Compare your resume with a job
            and discover how well your skills
            match the requirements.
          </p>
        </div>

        {error && (
          <div className="job-match-error">
            {error}
          </div>
        )}

        <div className="job-match-card">

          <h2>
            Find Your Job Match
          </h2>

          {loading ? (
            <p className="job-match-loading">
              Loading jobs and resumes...
            </p>
          ) : (
            <>
              <div className="job-match-fields">

                <div className="job-match-field">
                  <label>
                    Select Job
                  </label>

                  <select
                    value={selectedJob}
                    onChange={(e) => {
                      setSelectedJob(
                        e.target.value
                      );
                      setResult(null);
                    }}
                  >
                    <option value="">
                      Choose a job
                    </option>

                    {jobs.map((job) => (
                      <option
                        key={job._id}
                        value={job._id}
                      >
                        {job.title} —{" "}
                        {job.company}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="job-match-field">
                  <label>
                    Select Resume
                  </label>

                  <select
                    value={selectedResume}
                    onChange={(e) => {
                      setSelectedResume(
                        e.target.value
                      );
                      setResult(null);
                    }}
                  >
                    <option value="">
                      Choose a resume
                    </option>

                    {resumes.map((resume) => (
                      <option
                        key={resume._id}
                        value={resume._id}
                      >
                        {resume.fileName}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              <button
                className="job-match-button"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing
                  ? "Analyzing..."
                  : "Analyze Job Match"}
              </button>
            </>
          )}
        </div>

        {result && result.matching && (
          <div className="job-match-result">

            <div className="job-match-result-header">
              <div>
                <p className="job-match-label">
                  AI ANALYSIS
                </p>

                <h2>
                  {result.job.title}
                </h2>

                <p>
                  {result.job.company}
                </p>
              </div>

              <div className="job-match-score">
                <span>
                  {result.matching.matchScore}
                </span>
                <small>
                  / 100
                </small>
              </div>
            </div>

            <div className="job-match-result-grid">

              <div className="job-match-result-box">
                <h3>
                  Matched Skills
                </h3>

                {result.matching
                  .matchedSkills?.length > 0 ? (
                  <div className="job-match-tags">
                    {result.matching.matchedSkills.map(
                      (skill, index) => (
                        <span key={index}>
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p>
                    No matched skills found.
                  </p>
                )}
              </div>

              <div className="job-match-result-box">
                <h3>
                  Missing Skills
                </h3>

                {result.matching
                  .missingSkills?.length > 0 ? (
                  <div className="job-match-tags">
                    {result.matching.missingSkills.map(
                      (skill, index) => (
                        <span key={index}>
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p>
                    No important missing skills.
                  </p>
                )}
              </div>

            </div>

            <div className="job-match-result-box">
              <h3>
                Strengths
              </h3>

              {result.matching
                .strengths?.length > 0 ? (
                <ul>
                  {result.matching.strengths.map(
                    (strength, index) => (
                      <li key={index}>
                        {strength}
                      </li>
                    )
                  )}
                </ul>
              ) : (
                <p>
                  No strengths available.
                </p>
              )}
            </div>

            <div className="job-match-recommendation">
              <h3>
                AI Recommendation
              </h3>

              <p>
                {result.matching
                  .recommendation}
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default JobMatch;

