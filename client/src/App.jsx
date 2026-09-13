
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Jobs from "./pages/jobs/Jobs";
import JobDetails from "./pages/jobs/JobDetails";

import ProtectedRoute from "./components/ProtectedRoute";

import AIResumeAnalysis from "./pages/seeker/AIResumeAnalysis";
import JobSeekerDashboard from "./pages/seeker/JobSeekerDashboard";
import MyApplications from "./pages/seeker/MyApplications";
import SavedJobs from "./pages/seeker/SavedJobs";
import JobMatch from "./pages/seeker/JobMatch";
import AIRecommendations from "./pages/seeker/AIRecommendations";
import SkillGap from "./pages/seeker/SkillGap";

import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import CreateJob from "./pages/recruiter/CreateJob";
import ManageJobs from "./pages/recruiter/ManageJobs";
import Applicants from "./pages/recruiter/Applicants";
import EditJob from "./pages/recruiter/EditJob";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================================
            PUBLIC ROUTES
        ================================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/jobs"
          element={<Jobs />}
        />

        <Route
          path="/jobs/:id"
          element={<JobDetails />}
        />


        {/* ================================
            JOB SEEKER ROUTES
        ================================= */}

        <Route
          path="/job-seeker/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["job-seeker"]}
            >
              <JobSeekerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/job-seeker/ai-resume-analysis"
          element={
            <ProtectedRoute
              allowedRoles={["job-seeker"]}
            >
              <AIResumeAnalysis />
            </ProtectedRoute>
          }
        />

        <Route
          path="/job-seeker/applications"
          element={
            <ProtectedRoute
              allowedRoles={["job-seeker"]}
            >
              <MyApplications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/job-seeker/saved-jobs"
          element={
            <ProtectedRoute
              allowedRoles={["job-seeker"]}
            >
              <SavedJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/job-seeker/job-match"
          element={
            <ProtectedRoute
              allowedRoles={["job-seeker"]}
            >
              <JobMatch />
            </ProtectedRoute>
          }
        />

        <Route
          path="/job-seeker/recommendations"
          element={
            <ProtectedRoute
              allowedRoles={["job-seeker"]}
            >
              <AIRecommendations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/job-seeker/skill-gap"
          element={
            <ProtectedRoute
              allowedRoles={["job-seeker"]}
            >
              <SkillGap />
            </ProtectedRoute>
          }
        />


        {/* ================================
            RECRUITER ROUTES
        ================================= */}

        <Route
          path="/recruiter/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["recruiter"]}
            >
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/create-job"
          element={
            <ProtectedRoute
              allowedRoles={["recruiter"]}
            >
              <CreateJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/jobs"
          element={
            <ProtectedRoute
              allowedRoles={["recruiter"]}
            >
              <ManageJobs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/jobs/:id/edit"
          element={
            <ProtectedRoute
              allowedRoles={["recruiter"]}
            >
              <EditJob />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recruiter/jobs/:jobId/applicants"
          element={
            <ProtectedRoute
              allowedRoles={["recruiter"]}
            >
              <Applicants />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;



