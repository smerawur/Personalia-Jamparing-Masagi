function Pagination({ meta, onPageChange }) {
  if (!meta) return null;

  const { current_page, last_page, per_page, total } = meta;

  // generate page numbers (with limit)
  const getPages = () => {
    const pages = [];

    const start = Math.max(current_page - 2, 1);
    const end = Math.min(current_page + 2, last_page);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
    if (total === 0) {
      return (
        <div className="text-sm text-gray-600 mt-4">No data available</div>
      );
    }
  };

  const pages = getPages();

  return (
    <div className="flex items-center justify-between mt-4">
      {/* Info */}
      <div className="text-sm text-gray-600">
        Showing{" "}
        <span className="font-medium">{(current_page - 1) * per_page + 1}</span>{" "}
        to{" "}
        <span className="font-medium">
          {Math.min(current_page * per_page, total)}
        </span>{" "}
        of <span className="font-medium">{total}</span> results
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => {
            if (current_page > 1) onPageChange(current_page - 1);
          }}
          disabled={current_page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        {/* First page */}
        {current_page > 3 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-3 py-1 border rounded"
            >
              1
            </button>
            <span className="px-2">...</span>
          </>
        )}

        {/* Page numbers */}
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 border rounded ${
              p === current_page ? "bg-slate-900 text-white" : ""
            }`}
          >
            {p}
          </button>
        ))}

        {/* Last page */}
        {current_page < last_page - 2 && (
          <>
            <span className="px-2">...</span>
            <button
              onClick={() => onPageChange(last_page)}
              className="px-3 py-1 border rounded"
            >
              {last_page}
            </button>
          </>
        )}

        {/* Next */}
        <button
          onClick={() => {
            if (current_page < last_page) onPageChange(current_page + 1);
          }}
          disabled={current_page === last_page}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;
