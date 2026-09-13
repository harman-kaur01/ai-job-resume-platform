
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const user = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        <Link to="/" className="navbar-logo">
          JobAI
        </Link>

        <div className="navbar-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/jobs">
            Find Jobs
          </Link>

          {!token ? (
            <>
              <Link to="/login">
                Login
              </Link>

              <Link
                to="/register"
                className="navbar-signup"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {user.role === "job-seeker" && (
                <Link to="/job-seeker/dashboard">
                  Dashboard
                </Link>
              )}

              {user.role === "recruiter" && (
                <Link to="/recruiter/dashboard">
                  Dashboard
                </Link>
              )}

              <button
                type="button"
                className="navbar-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}

        </div>

      </div>
    </nav>
  );
}

export default Navbar;

