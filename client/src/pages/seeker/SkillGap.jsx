import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function SkillGap() {
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);

  const [selectedJob, setSelectedJob] = useState("");
  const [selectedResume, setSelectedResume] = useState("");

  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token");

        if (!token) {
          setError(
            "Please login as a job seeker first."
          );
          return;
        }

        const [
          jobsResponse,
          resumesResponse
        ] = await Promise.all([
          fetch(
            "http://localhost:5000/api/jobs?limit=50"
          ),

          fetch(
            "http://localhost:5000/api/resumes/my",
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
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

        setJobs(
          jobsData.jobs || []
        );

        setResumes(
          resumesData.resumes || []
        );

      } catch (error) {
        console.error(
          "Load skill gap data error:",
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
        `http://localhost:5000/api/skill-gap/${selectedJob}/${selectedResume}`,
        {
          method: "POST",
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
            "Skill gap analysis failed"
        );
      }

      setResult(data);

    } catch (error) {
      console.error(
        "Skill gap analysis error:",
        error
      );

      setError(error.message);

    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="skill-gap-page">

      <div className="skill-gap-container">

        <Link
          to="/job-seeker/dashboard"
          className="skill-gap-back"
        >
          ← Back to Dashboard
        </Link>

        <div className="skill-gap-header">

          <p className="skill-gap-label">
            AI CAREER ANALYSIS
          </p>

          <h1>
            Skill Gap Analysis
          </h1>

          <p>
            Compare your resume with a target
            job and discover which skills you
            should learn to become a stronger
            candidate.
          </p>

        </div>

        {error && (
          <div className="skill-gap-error">
            {error}
          </div>
        )}

        <div className="skill-gap-card">

          <h2>
            Analyze Your Skill Gap
          </h2>

          {loading ? (

            <p className="skill-gap-loading">
              Loading jobs and resumes...
            </p>

          ) : (

            <>
              <div className="skill-gap-fields">

                <div className="skill-gap-field">

                  <label>
                    Select Target Job
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

                <div className="skill-gap-field">

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
                className="skill-gap-button"
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing
                  ? "Analyzing..."
                  : "Analyze Skill Gap"}
              </button>

            </>
          )}

        </div>

        {result && result.skillGap && (

          <div className="skill-gap-result">

            <div className="skill-gap-result-header">

              <div>

                <p className="skill-gap-label">
                  AI ANALYSIS
                </p>

                <h2>
                  {result.job.title}
                </h2>

                <p>
                  {result.job.company}
                </p>

              </div>

            </div>

            <div className="skill-gap-grid">

              <div className="skill-gap-result-box">

                <h3>
                  Your Existing Skills
                </h3>

                {result.skillGap
                  .existingSkills?.length > 0 ? (

                  <div className="skill-gap-tags">

                    {result.skillGap.existingSkills.map(
                      (skill, index) => (
                        <span key={index}>
                          {skill}
                        </span>
                      )
                    )}

                  </div>

                ) : (

                  <p>
                    No existing skills identified.
                  </p>

                )}

              </div>

              <div className="skill-gap-result-box">

                <h3>
                  Missing Skills
                </h3>

                {result.skillGap
                  .missingSkills?.length > 0 ? (

                  <div className="skill-gap-tags">

                    {result.skillGap.missingSkills.map(
                      (skill, index) => (
                        <span key={index}>
                          {skill}
                        </span>
                      )
                    )}

                  </div>

                ) : (

                  <p>
                    No major skill gaps found.
                  </p>

                )}

              </div>

            </div>

            <div className="skill-gap-result-box">

              <h3>
                Priority Skills to Learn
              </h3>

              {result.skillGap
                .prioritySkills?.length > 0 ? (

                <ol className="skill-gap-priority">

                  {result.skillGap.prioritySkills.map(
                    (skill, index) => (
                      <li key={index}>
                        <strong>
                          {skill}
                        </strong>
                      </li>
                    )
                  )}

                </ol>

              ) : (

                <p>
                  No priority skills identified.
                </p>

              )}

            </div>

            <div className="skill-gap-result-box">

              <h3>
                Learning Plan
              </h3>

              {result.skillGap
                .learningPlan?.length > 0 ? (

                <ol className="skill-gap-learning">

                  {result.skillGap.learningPlan.map(
                    (step, index) => (
                      <li key={index}>
                        {step}
                      </li>
                    )
                  )}

                </ol>

              ) : (

                <p>
                  No learning plan available.
                </p>

              )}

            </div>

            <div className="skill-gap-advice">

              <h3>
                AI Career Advice
              </h3>

              <p>
                {result.skillGap.careerAdvice}
              </p>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default SkillGap;