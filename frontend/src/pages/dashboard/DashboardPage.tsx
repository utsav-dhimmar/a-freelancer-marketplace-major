import { useEffect, useState } from 'react';
import { contractApi, jobApi, proposalApi } from '../../api';
import { Card, Spinner } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeJobs: 0,
    myProposals: 0,
    activeContracts: 0,
    completedContracts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      if (user?.role === 'client') {
        const jobs = await jobApi.myJobs();
        const contracts = await contractApi.getMyContracts();
        setStats({
          activeJobs: jobs.filter((j) => j.status === 'open').length,
          myProposals: 0,
          activeContracts: contracts.filter((c) => c.status === 'active')
            .length,
          completedContracts: contracts.filter((c) => c.status === 'completed')
            .length,
        });
      } else {
        const proposals = await proposalApi.getMyProposals();
        const contracts = await contractApi.getMyContracts();
        setStats({
          activeJobs: 0,
          myProposals: proposals.filter((p) => p.status === 'pending').length,
          activeContracts: contracts.filter((c) => c.status === 'active')
            .length,
          completedContracts: contracts.filter((c) => c.status === 'completed')
            .length,
        });
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">Dashboard</h2>
      <p className="text-muted mb-4">Welcome back, {user?.username}!</p>

      <div className="row">
        {user?.role === 'client' && (
          <div className="col-md-4 mb-4">
            <Card>
              <div className="text-center">
                <h3 className="text-primary">{stats.activeJobs}</h3>
                <p className="mb-0">Active Jobs</p>
              </div>
            </Card>
          </div>
        )}

        {user?.role === 'freelancer' && (
          <div className="col-md-4 mb-4">
            <Card>
              <div className="text-center">
                <h3 className="text-primary">{stats.myProposals}</h3>
                <p className="mb-0">Pending Proposals</p>
              </div>
            </Card>
          </div>
        )}

        <div className="col-md-4 mb-4">
          <Card>
            <div className="text-center">
              <h3 className="text-warning">{stats.activeContracts}</h3>
              <p className="mb-0">Active Contracts</p>
            </div>
          </Card>
        </div>

        <div className="col-md-4 mb-4">
          <Card>
            <div className="text-center">
              <h3 className="text-success">{stats.completedContracts}</h3>
              <p className="mb-0">Completed Contracts</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
