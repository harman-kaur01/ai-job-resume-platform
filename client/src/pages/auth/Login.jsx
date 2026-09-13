
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import { loginUser } from "../../services/authService";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(email, password);

      // Save JWT token
      localStorage.setItem("token", data.token);

      // Save user information
      localStorage.setItem("user", JSON.stringify(data.user));

      alert("Login successful!");

      // Go to home page
      if (data.user.role === "recruiter") {
  navigate("/recruiter/dashboard");
} else if (data.user.role === "admin") {
  navigate("/admin/dashboard");
} else {
  navigate("/job-seeker/dashboard");
}
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="auth-page">

        <div className="auth-card">

          <div className="auth-header">
            <p>WELCOME BACK</p>

            <h1>Login to JobAI</h1>

            <span>
              Continue your career journey.
            </span>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>

            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="forgot-password">
              <Link to="#">
                Forgot Password?
              </Link>
            </div>

            {error && (
              <p className="auth-error">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          <div className="auth-footer">
            Don't have an account?

            <Link to="/register">
              Create Account
            </Link>
          </div>

        </div>

      </main>
    </>
  );
}

export default Login;

