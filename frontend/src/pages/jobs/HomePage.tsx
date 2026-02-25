import { useEffect, useState } from "react";
import type { SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { jobApi } from "../../api";
import { Button } from "../../components/ui";
import type { IJob } from "../../types";

const statusBadgeClasses: Record<string, string> = {
  open: "bg-primary",
  in_progress: "bg-secondary",
  completed: "bg-success",
  cancelled: "bg-danger",
};

export function HomePage() {
  const [jobs, setJobs] = useState<IJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    void loadJobs();
  }, []);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const data = await jobApi.getAll({ status: "open" });
      setJobs(data.jobs.slice(0, 6));
    } catch (error) {
      console.error("Failed to load jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await jobApi.getAll({ search, status: "open" });
      setJobs(data.jobs.slice(0, 6));
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderStatusBadge = (status: string) => (
    <span
      className={`badge ${statusBadgeClasses[status] ?? "bg-secondary"} text-uppercase`}
    >
      {status.replace("_", " ")}
    </span>
  );

  return (
    <div className="d-flex flex-column">
      <section className="py-5 bg-primary text-light overflow-hidden position-relative">
        <div className="container py-5 text-center position-relative">
          <span className="badge bg-white text-primary rounded-pill px-3 py-2 fw-semibold shadow-sm">
            The Future of Work
          </span>
          <h1 className="display-5 fw-bold mt-3 mb-3">
            Where exceptional <br />
            <span className="text-white">talent</span> meets extraordinary{" "}
            <span className="text-white-50">opportunities</span>
          </h1>
          <p className="lead text-white-50 mb-4">
            Connect with world-class freelancers and clients. Build your
            reputation. Do your best work.
          </p>

          <form
            onSubmit={handleSearch}
            className="row g-2 justify-content-center"
          >
            <div className="col-12 col-md-8">
              <div className="input-group rounded-pill shadow-sm bg-white">
                <input
                  type="text"
                  className="form-control border-0 rounded-start-pill px-4"
                  placeholder="Search for jobs, skills, or categories..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <Button
                  type="submit"
                  variant="secondary"
                  className="rounded-end-pill px-4"
                >
                  Search
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-start justify-content-between mb-4 gap-2">
            <div>
              <h2 className="mb-1">Latest Opportunities</h2>
              <p className="text-muted mb-0">
                Curated freelance projects from around the world.
              </p>
            </div>
            <Link
              to="/jobs"
              className="text-decoration-none small text-uppercase"
            >
              View all jobs →
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-lg-3 g-4">
              {jobs.length === 0 ? (
                <div className="col">
                  <div className="card shadow-sm border-0">
                    <div className="card-body text-center text-muted">
                      No jobs found. Try adjusting your search criteria.
                    </div>
                  </div>
                </div>
              ) : (
                jobs.map((job) => (
                  <div key={job._id} className="col">
                    <Link
                      to={`/jobs/${job._id}`}
                      className="card h-100 text-decoration-none text-reset shadow-sm border-0"
                    >
                      <div className="card-body d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-3 gap-2">
                          <h3 className="h5 mb-0">{job.title}</h3>
                          {renderStatusBadge(job.status)}
                        </div>
                        <p className="text-muted small mb-3">
                          {job.description}
                        </p>
                        <div className="mb-3">
                          <div className="d-flex flex-wrap gap-2">
                            {job.skillsRequired.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="badge rounded-pill bg-light text-dark border border-1"
                              >
                                {skill}
                              </span>
                            ))}
                            {job.skillsRequired.length > 3 && (
                              <span className="badge rounded-pill bg-white text-muted border">
                                +{job.skillsRequired.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="d-flex align-items-center justify-content-between mt-auto gap-3">
                          <div>
                            <p className="mb-0 fw-semibold text-primary">
                              ${job.budgetAmount}
                              <span className="small text-muted">
                                {job.budgetType === "hourly"
                                  ? " /hr"
                                  : " fixed"}
                              </span>
                            </p>
                          </div>
                          <Button variant="outline-secondary" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      <section className="py-5 bg-dark text-light">
        <div className="container">
          <div className="row g-4 align-items-center">
            <div className="col-lg-7">
              <h2 className="fw-bold">Ready to get started?</h2>
              <p className="text-white-50">
                Join thousands of freelancers and clients building the future
                together.
              </p>
            </div>
            <div className="col-lg-5">
              <div className="d-flex flex-wrap gap-2">
                <Link
                  to="/register"
                  className="btn btn-light btn-lg text-uppercase"
                >
                  Create Account
                </Link>
                <Link
                  to="/freelancers"
                  className="btn btn-outline-light btn-lg text-uppercase"
                >
                  Browse Talent
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
