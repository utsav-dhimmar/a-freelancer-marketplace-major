import { type SyntheticEvent, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { jobApi, proposalApi } from "../../api";
import { Button, Input, TextArea } from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";
import type { IJob, IProposal } from "../../types";

const statusBadgeClasses: Record<string, string> = {
  open: "bg-primary",
  in_progress: "bg-secondary",
  completed: "bg-success",
  cancelled: "bg-danger",
};

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [job, setJob] = useState<IJob | null>(null);
  const [proposal, setProposal] = useState<IProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalData, setProposalData] = useState({
    coverLetter: "",
    bidAmount: 0,
    estimatedTime: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      void loadJob();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      const jobData = await jobApi.getById(id!);
      setJob(jobData);
    } catch (error) {
      console.error("Failed to load job:", error);
      navigate("/jobs");
      return;
    }

    try {
      if (isAuthenticated && user?.role === "freelancer") {
        const proposals = await proposalApi.getMyProposals();
        const existingProposal = proposals.find((p) => p.jobId === id);
        if (existingProposal) {
          setProposal(existingProposal);
        }
      }
    } catch (error) {
      console.error("Failed to load proposals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProposal = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!id) return;

    setSubmitting(true);
    try {
      await proposalApi.submit({
        job: id,
        ...proposalData,
      });
      navigate(`/jobs/${id}`);
      window.location.reload();
    } catch (error) {
      console.error("Failed to submit proposal:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatusBadge = (status: string) => (
    <span
      className={`badge ${statusBadgeClasses[status] ?? "bg-secondary"} text-uppercase`}
    >
      {status.replace("_", " ")}
    </span>
  );

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container py-5">
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center">
            <h3 className="mb-3">Job not found</h3>
            <Link to="/jobs" className="btn btn-primary">
              Browse Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isClient = user?.id === job.client;
  const isOpen = job.status === "open";
  console.log(job);
  console.log(isAuthenticated, isClient, isOpen, proposal, user)
  return (
    <div className="container py-5">
      <Link to="/jobs" className="btn btn-link mb-4 px-0">
        ← Back to Jobs
      </Link>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
                <div>
                  <h1 className="h3 mb-1">{job.title}</h1>
                  <div className="text-muted small">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                    <span className="text-muted mx-2">•</span>
                    Deadline{" "}
                    {new Date(job.deadline).toLocaleDateString() ||
                      job.deadline}
                  </div>
                </div>
                {renderStatusBadge(job.status)}
              </div>
              <div className="mt-4">
                <h5>Description</h5>
                <p className="text-muted">{job.description}</p>
              </div>
              <div className="mt-4">
                <h5>Skills Required</h5>
                <div className="d-flex flex-wrap gap-2">
                  {job.skillsRequired.map((skill) => (
                    <span
                      key={skill}
                      className="badge rounded-pill bg-light text-dark border border-1"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <h5>Project Details</h5>
                <div className="row gy-3">
                  <div className="col-6">
                    <div className="text-muted small mb-1">Budget</div>
                    <p className="fw-semibold mb-0">
                      ${job.budget}
                      <span className="text-muted small">
                        {job.budgetType === "hourly" ? " /hr" : " fixed price"}
                      </span>
                    </p>
                  </div>
                  <div className="col-6">
                    <div className="text-muted small mb-1">Deadline</div>
                    <p className="mb-0">
                      {new Date(job.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">What you can expect</h5>
              <p className="text-muted mb-0">
                Work closely with the client to deliver a high-quality
                experience. Provide regular updates and blur to the team.
              </p>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
              <p className="text-muted small text-uppercase mb-1">Budget</p>
              <div className="d-flex flex-column gap-1">
                <span className="fs-3 fw-bold text-primary">${job.budget}</span>
                <span className="text-muted">
                  {job.budgetType === "hourly" ? "Per hour" : "Fixed price"}
                </span>
              </div>
            </div>
          </div>

          {isAuthenticated && !isClient && isOpen && !proposal && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                {!showProposalForm ? (
                  <div className="d-grid gap-3">
                    <Button
                      onClick={() => setShowProposalForm(true)}
                      className="text-uppercase"
                    >
                      Apply Now
                    </Button>
                    <p className="text-muted small mb-0">
                      Submit your best proposal to stand out.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmitProposal}
                    className="d-flex flex-column gap-3"
                  >
                    <TextArea
                      label="Cover Letter"
                      placeholder="Introduce yourself and explain why you're the best fit..."
                      rows={4}
                      value={proposalData.coverLetter}
                      onChange={(event) =>
                        setProposalData((prev) => ({
                          ...prev,
                          coverLetter: event.target.value,
                        }))
                      }
                      required
                    />
                    <div className="row g-3">
                      <div className="col-6">
                        <Input
                          label="Your Bid ($)"
                          type="number"
                          value={proposalData.proposedAmount}
                          onChange={(event) =>
                            setProposalData((prev) => ({
                              ...prev,
                              proposedAmount: Number(event.target.value),
                            }))
                          }
                          min="1"
                          placeholder="0"
                          required
                        />
                      </div>
                      <div className="col-6">
                        <Input
                          label="Duration (days)"
                          type="number"
                          value={proposalData.estimatedDuration}
                          onChange={(event) =>
                            setProposalData((prev) => ({
                              ...prev,
                              estimatedDuration: Number(event.target.value),
                            }))
                          }
                          min="1"
                          placeholder="1"
                          required
                        />
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        type="submit"
                        isLoading={submitting}
                        className="flex-fill text-uppercase"
                      >
                        Submit Proposal
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowProposalForm(false)}
                        className="flex-fill"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {proposal && (
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Your Proposal</h5>
                  <span
                    className={`badge ${proposal.status === "accepted"
                      ? "bg-success"
                      : "bg-secondary"
                      } text-uppercase`}
                  >
                    {proposal.status}
                  </span>
                </div>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item px-0 border-0 d-flex justify-content-between">
                    <span className="text-muted">Bid Amount</span>
                    <span className="fw-semibold">
                      ${proposal.proposedAmount}
                    </span>
                  </li>
                  <li className="list-group-item px-0 border-0 d-flex justify-content-between">
                    <span className="text-muted">Duration</span>
                    <span className="fw-semibold">
                      {proposal.estimatedDuration} days
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
