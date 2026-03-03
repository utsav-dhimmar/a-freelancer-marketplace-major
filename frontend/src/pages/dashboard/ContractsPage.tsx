import { useState, useEffect } from 'react';
import { contractApi, jobApi } from '../../api';
import { Card, Button, TextArea } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import type { IContract, IJob } from '../../types';

export function ContractsPage() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<IContract[]>([]);
  const [jobs, setJobs] = useState<Record<string, IJob>>({});
  const [loading, setLoading] = useState(true);
  const [selectedContract, setSelectedContract] = useState<IContract | null>(
    null,
  );
  const [workDescription, setWorkDescription] = useState('');
  const [disputeReason, setDisputeReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const data = await contractApi.getMyContracts();
      setContracts(data);

      const jobIds = [...new Set(data.map((c) => c.jobId))];
      const jobData: Record<string, IJob> = {};
      for (const jobId of jobIds) {
        try {
          const job = await jobApi.getById(jobId);
          jobData[jobId] = job;
        } catch {}
      }
      setJobs(jobData);
    } catch (error) {
      console.error('Failed to load contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    setSubmitting(true);
    try {
      await contractApi.submitWork(selectedContract._id, workDescription);
      setSelectedContract(null);
      setWorkDescription('');
      loadContracts();
    } catch (error) {
      console.error('Failed to submit work:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (id: string) => {
    if (!confirm('Are you sure you want to mark this contract as completed?'))
      return;
    try {
      await contractApi.completeContract(id);
      loadContracts();
    } catch (error) {
      console.error('Failed to complete contract:', error);
    }
  };

  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContract) return;

    setSubmitting(true);
    try {
      await contractApi.raiseDispute(selectedContract._id, disputeReason);
      setSelectedContract(null);
      setDisputeReason('');
      loadContracts();
    } catch (error) {
      console.error('Failed to raise dispute:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this contract?')) return;
    try {
      await contractApi.cancelContract(id);
      loadContracts();
    } catch (error) {
      console.error('Failed to cancel contract:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const classes: Record<string, string> = {
      active: 'bg-primary',
      completed: 'bg-success',
      disputed: 'bg-danger',
      cancelled: 'bg-secondary',
    };
    return (
      <span className={`badge ${classes[status] || 'bg-secondary'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status" />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">My Contracts</h2>

      {contracts.length === 0 ? (
        <Card>
          <p className="text-muted mb-0 text-center">
            You don't have any contracts yet.
          </p>
        </Card>
      ) : (
        <div className="row">
          {contracts.map((contract) => (
            <div key={contract._id} className="col-md-6 mb-4">
              <Card>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 className="mb-0">
                    {jobs[contract.jobId]?.title || 'Job'}
                  </h5>
                  {getStatusBadge(contract.status)}
                </div>
                <div className="mb-3">
                  <small className="text-muted">Amount: </small>
                  <strong>${contract.amount}</strong>
                  <small className="text-muted">
                    {' '}
                    | Started:{' '}
                    {new Date(contract.startDate).toLocaleDateString()}
                  </small>
                </div>
                {contract.workSubmitted && (
                  <div className="mb-3">
                    <small className="text-muted">Work Submitted:</small>
                    <p className="mb-0 small">{contract.workSubmitted}</p>
                  </div>
                )}
                <div className="d-flex flex-wrap gap-2">
                  {contract.status === 'active' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => setSelectedContract(contract)}
                      >
                        Submit Work
                      </Button>
                      {user?.role === 'client' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleComplete(contract._id)}
                        >
                          Mark Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => handleCancel(contract._id)}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {contract.status === 'completed' && (
                    <span className="text-success">Contract completed</span>
                  )}
                  {contract.status === 'cancelled' && (
                    <span className="text-muted">Contract cancelled</span>
                  )}
                  {contract.status === 'disputed' && (
                    <span className="text-danger">Under dispute</span>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {selectedContract && (
        <div
          className="modal d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedContract.status === 'active'
                    ? 'Submit Work'
                    : 'Raise Dispute'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedContract(null)}
                />
              </div>
              <div className="modal-body">
                {selectedContract.status === 'active' ? (
                  <form onSubmit={handleSubmitWork}>
                    <TextArea
                      label="Work Description"
                      value={workDescription}
                      onChange={(e) => setWorkDescription(e.target.value)}
                      rows={4}
                      required
                    />
                    <div className="d-flex gap-2">
                      <Button type="submit" isLoading={submitting}>
                        Submit
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => setSelectedContract(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleDispute}>
                    <TextArea
                      label="Reason for Dispute"
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      rows={4}
                      required
                    />
                    <div className="d-flex gap-2">
                      <Button type="submit" isLoading={submitting}>
                        Submit Dispute
                      </Button>
                      <Button
                        variant="outline-secondary"
                        onClick={() => setSelectedContract(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
