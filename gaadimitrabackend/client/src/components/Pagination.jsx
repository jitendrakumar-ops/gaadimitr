import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

/**
 * Modern, Premium Pagination Component
 *
 * @param {number} currentPage - Currently active page (1-based)
 * @param {number} totalPages - Total number of pages
 * @param {number} totalItems - Total count of records (optional)
 * @param {number} limit - Items per page (optional)
 * @param {function} onPageChange - Callback when user selects a page
 * @param {function} onLimitChange - Optional callback when user changes items-per-page
 * @param {boolean} showInfo - Whether to display "Showing X to Y of Z" text
 * @param {Array<number>} limitOptions - Options for limit selector
 */
const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  limit = 10,
  onPageChange,
  onLimitChange,
  showInfo = true,
  limitOptions = [5, 10, 20, 50],
  className = "",
}) => {
  // If no pages or invalid, don't show pagination
  if (!totalPages || totalPages < 1) {
    return null;
  }

  // Calculate showing X to Y
  const startItem = totalItems > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem =
    totalItems > 0 ? Math.min(currentPage * limit, totalItems) : 0;

  // Generate page numbers with intelligent ellipsis
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1; // Number of pages to show around current page

    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);

    pages.push(1);

    if (left > 2) {
      pages.push("ellipsis-left");
    }

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) {
      pages.push("ellipsis-right");
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  const handlePageClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange?.(page);
    }
  };

  return (
    <div
      className={`
        flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-sm
        transition-all sm:flex-row sm:items-center sm:justify-between
        ${className}
      `}
    >
      {/* ===================================================
          LEFT: SHOWING INFO & ITEMS PER PAGE
      ==================================================== */}
      <div className="flex flex-wrap items-center gap-3">
        {showInfo && totalItems > 0 && (
          <p className="text-xs font-medium text-slate-500">
            Showing{" "}
            <span className="font-bold text-slate-800">{startItem}</span> to{" "}
            <span className="font-bold text-slate-800">{endItem}</span> of{" "}
            <span className="font-bold text-slate-800">{totalItems}</span>{" "}
            results
          </p>
        )}

        {showInfo && (!totalItems || totalItems === 0) && (
          <p className="text-xs font-medium text-slate-500">
            Page <span className="font-bold text-slate-800">{currentPage}</span>{" "}
            of <span className="font-bold text-slate-800">{totalPages}</span>
          </p>
        )}

        {/* Optional Limit Selector */}
        {onLimitChange && (
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Per Page:
            </span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-700 outline-none transition focus:border-[#0757D9] focus:bg-white"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ===================================================
          RIGHT: PAGE NAVIGATION BUTTONS
      ==================================================== */}
      <div className="flex items-center gap-1 self-center sm:self-auto">
        {/* First Page Button */}
        <button
          type="button"
          onClick={() => handlePageClick(1)}
          disabled={currentPage === 1}
          title="First Page"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0757D9] disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300"
        >
          <ChevronsLeft size={15} />
        </button>

        {/* Previous Page Button */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous Page"
          className="flex h-8 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0757D9] disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300"
        >
          <ChevronLeft size={15} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Numeric Page Buttons */}
        <div className="flex items-center gap-1 px-1">
          {pages.map((p, index) => {
            if (p === "ellipsis-left" || p === "ellipsis-right") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-8 w-6 select-none items-center justify-center text-xs font-bold text-slate-400"
                >
                  •••
                </span>
              );
            }

            const isCurrent = p === currentPage;

            return (
              <button
                key={p}
                type="button"
                onClick={() => handlePageClick(p)}
                className={`
                  flex h-8 min-w-[32px] items-center justify-center rounded-xl px-2 text-xs font-extrabold transition-all duration-200
                  ${
                    isCurrent
                      ? "bg-[#0757D9] text-white shadow-[0_4px_12px_rgba(7,87,217,0.28)] ring-1 ring-blue-500/20"
                      : "border border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100/80 hover:text-slate-900"
                  }
                `}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          title="Next Page"
          className="flex h-8 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0757D9] disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={15} />
        </button>

        {/* Last Page Button */}
        <button
          type="button"
          onClick={() => handlePageClick(totalPages)}
          disabled={currentPage === totalPages}
          title="Last Page"
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0757D9] disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300"
        >
          <ChevronsRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
