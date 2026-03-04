import { useEffect, useState } from "react";
import { AdminLayout } from "./components/AdminLayout";
import { adminApi } from "../../api/admin";
import type { DashboardStats } from "../../types/admin";

const STAT_CARDS = [
  {
    key: "users" as const,
    label: "Total Users",
    color: "primary",
    breakdownKeys: ["clients", "freelancers", "admins"] as const,
  },
  {
    key: "jobs" as const,
    label: "Total Jobs",
    color: "info",
    breakdownKeys: ["open", "inProgress", "completed", "cancelled"] as const,
  },
  {
    key: "contracts" as const,
    label: "Total Contracts",
    color: "success",
    breakdownKeys: ["active", "submitted", "completed", "disputed"] as const,
  },
  {
    key: "proposals" as const,
    label: "Total Proposals",
    color: "warning",
    breakdownKeys: ["pending", "accepted", "rejected"] as const,
  },
  {
    key: "reviews" as const,
    label: "Total Reviews",
    color: "danger",
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
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="text-muted">Loading dashboard...</span>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) {
    return (
      <AdminLayout title="Dashboard">
        <div className="text-center py-5">
          <p className="text-muted">Unable to load dashboard statistics</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="row g-4">
        {STAT_CARDS.map((card) => {
          const section = stats[card.key];
          return (
            <div className="col-12 col-sm-6 col-lg-4" key={card.key}>
              <div
                className={`card h-100 border-0 shadow-sm border-start border-4 border-${card.color}`}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 className="text-muted small text-uppercase fw-bold mb-1">
                        {card.label}
                      </h6>
                      <h2 className="fw-bold mb-0">{section.total}</h2>
                    </div>
                    <div
                      className={`bg-${card.color} bg-opacity-10 p-2 rounded text-${card.color}`}
                    ></div>
                  </div>

                  {card.breakdownKeys.length > 0 && (
                    <div className="pt-3 border-top d-flex flex-wrap gap-3">
                      {card.breakdownKeys.map((bk) => (
                        <div key={bk} className="small text-muted">
                          <span className="text-capitalize">{bk}:</span>{" "}
                          <span className="fw-bold text-dark">
                            {(section as Record<string, number>)[bk]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
