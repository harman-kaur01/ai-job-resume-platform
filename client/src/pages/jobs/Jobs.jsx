
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Jobs() {
  const [jobs, setJobs] = useState([]);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [experience, setExperience] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJobs = async (
    searchText = "",
    locationText = "",
    jobTypeText = "",
    experienceText = "",
    pageNumber = 1
  ) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      // Keep page size small so pagination can be tested
      params.append("limit", "5");
      params.append("page", pageNumber.toString());

      if (searchText.trim() !== "") {
        params.append("search", searchText.trim());
      }

      if (locationText.trim() !== "") {
        params.append("location", locationText.trim());
      }

      if (jobTypeText !== "") {
        params.append("jobType", jobTypeText);
      }

      if (experienceText !== "") {
        params.append("experience", experienceText);
      }

      const url =
        `http://localhost:5000/api/jobs?${params.toString()}`;

      console.log("Request:", url);

      const response = await fetch(url);
      const data = await response.json();

      console.log("Response:", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load jobs"
        );
      }

      setJobs(data.jobs || []);
      setPage(data.currentPage || pageNumber);
      setTotalPages(data.totalPages || 1);

    } catch (err) {
      console.error("Jobs error:", err);

      setError(err.message);
      setJobs([]);

    } finally {
      setLoading(false);
    }
  };


  // Load jobs when page opens

  useEffect(() => {
    loadJobs();
  }, []);


  // Search and filters

  const handleSearch = (e) => {
    e.preventDefault();

    loadJobs(
      search,
      location,
      jobType,
      experience,
      1
    );
  };


  // Clear filters

  const handleClear = () => {
    setSearch("");
    setLocation("");
    setJobType("");
    setExperience("");

    loadJobs(
      "",
      "",
      "",
      "",
      1
    );
  };


  // Previous page

  const handlePrevious = () => {
    if (page > 1) {
      loadJobs(
        search,
        location,
        jobType,
        experience,
        page - 1
      );
    }
  };


  // Next page

  const handleNext = () => {
    if (page < totalPages) {
      loadJobs(
        search,
        location,
        jobType,
        experience,
        page + 1
      );
    }
  };


  return (
    <main className="jobs-page">

      <div className="jobs-container">

        {/* Header */}

        <div className="jobs-header">

          <p className="jobs-label">
            JOBAI
          </p>

          <h1>
            Find Your Next Job
          </h1>

          <p>
            Discover opportunities that match
            your skills and career goals.
          </p>

        </div>


        {/* Search & Filters */}

        <form
          className="jobs-search"
          onSubmit={handleSearch}
        >

          {/* Search */}

          <div className="jobs-search-field">

            <label>
              Search
            </label>

            <input
              type="text"
              placeholder="Job title, company or skill"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>


          {/* Location */}

          <div className="jobs-search-field">

            <label>
              Location
            </label>

            <input
              type="text"
              placeholder="e.g. Mohali"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
            />

          </div>


          {/* Job Type */}

          <div className="jobs-search-field">

            <label>
              Job Type
            </label>

            <select
              value={jobType}
              onChange={(e) =>
                setJobType(e.target.value)
              }
            >

              <option value="">
                All Job Types
              </option>

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


          {/* Experience */}

          <div className="jobs-search-field">

            <label>
              Experience
            </label>

            <select
              value={experience}
              onChange={(e) =>
                setExperience(e.target.value)
              }
            >

              <option value="">
                All Experience
              </option>

              <option value="Fresher">
                Fresher
              </option>

              <option value="0-1 Years">
                0-1 Years
              </option>

              <option value="1-3 Years">
                1-3 Years
              </option>

              <option value="3+ Years">
                3+ Years
              </option>

            </select>

          </div>


          {/* Search */}

          <button
            type="submit"
            className="jobs-search-button"
          >
            Search Jobs
          </button>


          {/* Clear */}

          <button
            type="button"
            className="jobs-clear-button"
            onClick={handleClear}
          >
            Clear
          </button>

        </form>


        {/* Loading */}

        {loading && (
          <div className="jobs-message">
            Loading jobs...
          </div>
        )}


        {/* Error */}

        {error && (
          <div className="jobs-error">
            {error}
          </div>
        )}


        {/* No Jobs */}

        {!loading &&
          !error &&
          jobs.length === 0 && (

            <div className="jobs-empty">

              <h2>
                No jobs found
              </h2>

              <p>
                Try changing your search or filters.
              </p>

            </div>

          )}


        {/* Jobs */}

        {!loading &&
          !error &&
          jobs.length > 0 && (

            <div className="jobs-content">

              <div className="jobs-results-header">

                <h2>
                  Available Jobs
                </h2>

                <span>
                  {jobs.length} jobs found
                </span>

              </div>


              <div className="jobs-list">

                {jobs.map((job) => (

                  <div
                    className="job-card"
                    key={job._id}
                  >

                    <div className="job-card-main">

                      <div className="job-card-info">

                        <p className="job-type">
                          {job.jobType}
                        </p>

                        <h2>
                          {job.title}
                        </h2>

                        <h3>
                          {job.company}
                        </h3>

                        <p className="job-location">
                          📍 {job.location}
                        </p>

                        <p className="job-description">
                          {job.description}
                        </p>

                        <div className="job-details">

                          <span>
                            💰 {job.salary}
                          </span>

                          <span>
                            💼 {job.experience}
                          </span>

                        </div>


                        <div className="job-skills">

                          {Array.isArray(job.skills) &&
                            job.skills.map(
                              (skill, index) => (

                                <span key={index}>
                                  {skill}
                                </span>

                              )
                            )}

                        </div>

                      </div>


                      <div className="job-card-action">

                        <Link
                          to={`/jobs/${job._id}`}
                          className="view-job-button"
                        >
                          View Job
                        </Link>

                      </div>

                    </div>

                  </div>

                ))}

              </div>


              {/* Pagination */}

              <div className="jobs-pagination">

                <button
                  type="button"
                  className="jobs-pagination-button"
                  onClick={handlePrevious}
                  disabled={page === 1}
                >
                  ← Previous
                </button>


                <span className="jobs-page-number">
                  Page {page} of {totalPages}
                </span>


                <button
                  type="button"
                  className="jobs-pagination-button"
                  onClick={handleNext}
                  disabled={page === totalPages}
                >
                  Next →
                </button>

              </div>

            </div>

          )}

      </div>

    </main>
  );
}

export default Jobs;

