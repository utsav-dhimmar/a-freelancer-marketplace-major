import { useEffect, useState } from 'react';
import { AdminLayout } from './components/AdminLayout';
import { adminApi } from '../../api/admin';
import type { DashboardStats } from '../../types/admin';

const STAT_CARDS = [
  {
    key: 'users' as const,
    label: 'Total Users',
    icon: '👥',
    color: 'purple',
    breakdownKeys: ['clients', 'freelancers', 'admins'] as const,
  },
  {
    key: 'jobs' as const,
    label: 'Total Jobs',
    icon: '💼',
    color: 'blue',
    breakdownKeys: ['open', 'inProgress', 'completed', 'cancelled'] as const,
  },
  {
    key: 'contracts' as const,
    label: 'Total Contracts',
    icon: '📄',
    color: 'green',
    breakdownKeys: ['active', 'submitted', 'completed', 'disputed'] as const,
  },
  {
    key: 'proposals' as const,
    label: 'Total Proposals',
    icon: '📝',
    color: 'orange',
    breakdownKeys: ['pending', 'accepted', 'rejected'] as const,
  },
  {
    key: 'reviews' as const,
    label: 'Total Reviews',
    icon: '⭐',
    color: 'pink',
    breakdownKeys: [] as const,
  },
];

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminApi.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Loading dashboard...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout title="Dashboard">
        <div className="admin-empty">
          <div className="empty-icon">📊</div>
          <p>Unable to load dashboard statistics</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="stat-cards-grid">
        {STAT_CARDS.map((card) => {
          const section = stats[card.key];
          return (
            <div className={`stat-card ${card.color}`} key={card.key}>
              <div className="stat-icon">{card.icon}</div>
              <div className="stat-value">{section.total}</div>
              <div className="stat-label">{card.label}</div>
              {card.breakdownKeys.length > 0 && (
                <div className="stat-breakdown">
                  {card.breakdownKeys.map((bk) => (
                    <span key={bk}>
                      {bk}:{' '}
                      <strong>{(section as Record<string, number>)[bk]}</strong>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
