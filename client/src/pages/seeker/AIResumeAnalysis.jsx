import { useState } from "react";

function AIResumeAnalysis() {
  const [resumeId, setResumeId] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeResume = async () => {
    if (!resumeId) {
      setError("Please enter a resume ID");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis(null);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/resume-analysis/${resumeId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Analysis failed"
        );
      }

      setAnalysis(data.analysis);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="ai-analysis-page">

      <div className="ai-analysis-container">

        <div className="ai-analysis-header">
          <p>AI POWERED</p>

          <h1>
            Resume Analysis
          </h1>

          <span>
            Get AI-powered feedback on your resume.
          </span>
        </div>

        <div className="ai-analysis-form">

          <label>
            Resume ID
          </label>

          <input
            type="text"
            placeholder="Enter your resume ID"
            value={resumeId}
            onChange={(e) =>
              setResumeId(e.target.value)
            }
          />

          <button
            onClick={analyzeResume}
            disabled={loading}
          >
            {loading
              ? "Analyzing..."
              : "Analyze Resume"}
          </button>

        </div>

        {error && (
          <p className="ai-analysis-error">
            {error}
          </p>
        )}

        {analysis && (
          <div className="analysis-result">

            <div className="score-card">

              <p>Resume Score</p>

              <h2>
                {analysis.score}
                <span>/100</span>
              </h2>

            </div>

            <div className="analysis-card">

              <h2>
                AI Summary
              </h2>

              <p>
                {analysis.summary}
              </p>

            </div>

            <div className="analysis-card">

              <h2>
                Strengths
              </h2>

              <ul>
                {analysis.strengths?.map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>

            </div>

            <div className="analysis-card">

              <h2>
                Weaknesses
              </h2>

              <ul>
                {analysis.weaknesses?.map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>

            </div>

            <div className="analysis-card">

              <h2>
                Missing Skills
              </h2>

              <ul>
                {analysis.missingSkills?.map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>

            </div>

            <div className="analysis-card">

              <h2>
                AI Suggestions
              </h2>

              <ul>
                {analysis.suggestions?.map(
                  (item, index) => (
                    <li key={index}>
                      {item}
                    </li>
                  )
                )}
              </ul>

            </div>

          </div>
        )}

      </div>

    </main>
  );
}

export default AIResumeAnalysis;