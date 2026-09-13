import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";

function Register() {
  return (
    <>
      <Navbar />

      <main className="auth-page">

        <div className="auth-card register-card">

          <div className="auth-header">
            <p>START YOUR JOURNEY</p>

            <h1>Create Your Account</h1>

            <span>
              Join JobAI and discover better opportunities.
            </span>
          </div>

          <form className="auth-form">

            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Create a password"
              />
            </div>

            <div className="form-group">
              <label>Account Type</label>

              <select defaultValue="job-seeker">
                <option value="job-seeker">
                  Job Seeker
                </option>

                <option value="recruiter">
                  Recruiter
                </option>
              </select>
            </div>

            <button type="submit" className="auth-button">
              Create Account
            </button>

          </form>

          <div className="auth-footer">
            Already have an account?

            <Link to="/login">
              Login
            </Link>
          </div>

        </div>

      </main>
    </>
  );
}

export default Register;