interface AdminPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
  label?: string;
}

export function AdminPagination({
  page,
  totalPages,
  total,
  onPageChange,
  label = 'items',
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="admin-pagination">
      <span className="pagination-info">
        Page {page} of {totalPages} · {total} {label}
      </span>
      <div className="pagination-buttons">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
