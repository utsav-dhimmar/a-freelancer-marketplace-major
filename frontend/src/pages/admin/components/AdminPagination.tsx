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
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 py-3 border-top px-4 bg-light bg-opacity-50">
      <span className="small text-muted fw-medium">
        Showing Page {page} of {totalPages} <span className="mx-1">·</span>{' '}
        {total} {label}
      </span>
      <nav aria-label="Table pagination">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              Previous
            </button>
          </li>
          {/* Simple version with just Prev/Next for now, matching previous behavior */}
          <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
