import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AIRecommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [resume, setResume] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecommendations = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please login as a job seeker first.");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/recommendations",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load recommendations"
          );
        }

        setResume(data.resume || null);
        setRecommendations(
          data.recommendations || []
        );

      } catch (error) {
        console.error(
          "Recommendation error:",
          error
        );

        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, []);

  return (
    <div className="ai-recommendations-page">
      <div className="ai-recommendations-container">

        <Link
          to="/job-seeker/dashboard"
          className="ai-recommendations-back"
        >
          ← Back to Dashboard
        </Link>

        <div className="ai-recommendations-header">

          <p className="ai-recommendations-label">
            AI POWERED
          </p>

          <h1>
            Recommended Jobs
          </h1>

          <p>
            AI analyzes your latest resume and
            recommends the jobs that best match
            your skills and experience.
          </p>

        </div>

        {error && (
          <div className="ai-recommendations-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="ai-recommendations-card">
            <p className="ai-recommendations-loading">
              Analyzing your resume and finding
              the best jobs...
            </p>
          </div>
        ) : (
          <>
            {resume && (
              <div className="ai-recommendations-resume">
                <span>Analyzed Resume</span>

                <strong>
                  {resume.fileName}
                </strong>
              </div>
            )}

            {recommendations.length === 0 &&
              !error && (
                <div className="ai-recommendations-card">
                  <h2>
                    No matching jobs found
                  </h2>

                  <p>
                    Try uploading a stronger resume
                    or check again when new jobs are
                    available.
                  </p>
                </div>
              )}

            <div className="ai-recommendations-list">

              {recommendations.map(
                (recommendation, index) => {
                  const job =
                    recommendation.job;

                  return (
                    <div
                      className="ai-recommendation-card"
                      key={job._id}
                    >

                      <div className="ai-recommendation-top">

                        <div>
                          <span className="ai-recommendation-number">
                            #{index + 1}
                          </span>

                          <h2>
                            {job.title}
                          </h2>

                          <p className="ai-recommendation-company">
                            {job.company}
                          </p>
                        </div>

                        <div className="ai-recommendation-score">
                          <strong>
                            {recommendation.matchScore}
                          </strong>

                          <span>
                            % Match
                          </span>
                        </div>

                      </div>

                      <div className="ai-recommendation-details">

                        <span>
                          📍 {job.location}
                        </span>

                        <span>
                          💼 {job.jobType}
                        </span>

                        <span>
                          🎯 {job.experience}
                        </span>

                        <span>
                          💰 {job.salary || "Not disclosed"}
                        </span>

                      </div>

                      <div className="ai-recommendation-skills">

                        <h3>
                          Required Skills
                        </h3>

                        <div>
                          {job.skills?.map(
                            (skill, skillIndex) => (
                              <span key={skillIndex}>
                                {skill}
                              </span>
                            )
                          )}
                        </div>

                      </div>

                      <div className="ai-recommendation-reason">

                        <h3>
                          Why AI Recommended This
                        </h3>

                        <p>
                          {recommendation.reason}
                        </p>

                      </div>

                      <Link
                        to={`/jobs/${job._id}`}
                        className="ai-recommendation-button"
                      >
                        View Job
                      </Link>

                    </div>
                  );
                }
              )}

            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default AIRecommendations;