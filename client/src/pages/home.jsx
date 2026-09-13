import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";

function Home() {
  return (
    <>
      <Navbar />

      <main className="home-page">

        <section className="hero-section">
          <div className="hero-content">

            <p className="hero-tag">
              AI-POWERED CAREER PLATFORM
            </p>

            <h1>
              Find Your Next
              <span> Career Opportunity</span>
            </h1>

            <p className="hero-description">
              Discover jobs that match your skills and experience.
              Analyze your resume and get smarter career recommendations
              powered by AI.
            </p>

            <div className="hero-buttons">

              <Link to="/jobs" className="primary-button">
                Find Jobs
              </Link>

              <Link to="/register" className="secondary-button">
                Get Started
              </Link>

            </div>

          </div>
        </section>

        <section className="features-section">

          <div className="section-heading">
            <p>SMART CAREER TOOLS</p>

            <h2>
              Everything You Need to Find the Right Job
            </h2>
          </div>

          <div className="features-grid">

            <div className="feature-card">
              <div className="feature-icon">🤖</div>

              <h3>AI Job Matching</h3>

              <p>
                Find jobs that match your skills, experience
                and career goals.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📄</div>

              <h3>Resume Analysis</h3>

              <p>
                Upload your resume and get AI-powered feedback
                and improvement suggestions.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📈</div>

              <h3>Career Insights</h3>

              <p>
                Understand your skill gaps and discover
                opportunities for career growth.
              </p>
            </div>

          </div>

        </section>

      </main>
    </>
  );
}

export default Home;