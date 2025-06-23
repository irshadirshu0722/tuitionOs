// Pagination.js
import { useState, useEffect } from "react";

export default function Pagination({
  totalEntries = 0,
  entriesPerPage = 10,
  onPageChange,
  currentPage: propCurrentPage,
}) {
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  // Use propCurrentPage if provided, otherwise use internal state
  const currentPage =
    propCurrentPage !== undefined ? propCurrentPage : internalCurrentPage;

  // Update internal state when propCurrentPage changes
  useEffect(() => {
    if (propCurrentPage !== undefined) {
      setInternalCurrentPage(propCurrentPage);
    }
  }, [propCurrentPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setInternalCurrentPage(page);
      onPageChange(page);
    }
  };

  const renderPages = () => {
    const pages = [];

    const getPagesToShow = () => {
      const pagesToShow = [];
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) {
          pagesToShow.push(i);
        }
      } else {
        pagesToShow.push(1);
        if (currentPage <= 3) {
          pagesToShow.push(2, 3, "...", totalPages);
        } else if (currentPage >= totalPages - 2) {
          pagesToShow.push("...", totalPages - 2, totalPages - 1, totalPages);
        } else {
          pagesToShow.push(
            "...",
            currentPage - 1,
            currentPage,
            currentPage + 1,
            "...",
            totalPages
          );
        }
      }
      return pagesToShow;
    };

    const pagesToShow = getPagesToShow();

    pagesToShow.forEach((page, index) => {
      if (page === "...") {
        pages.push(
          <span key={`dots-${index}`} className="px-3 py-1 text-gray-400">
            ...
          </span>
        );
      } else {
        pages.push(
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-1 rounded border text-sm ${
              currentPage === page
                ? "bg-blue-500 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        );
      }
    });

    return pages;
  };

  return (
    <div className="mt-4 text-sm text-gray-600 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <span>
        Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
        {Math.min(currentPage * entriesPerPage, totalEntries)} of {totalEntries}{" "}
        entries
      </span>

      <div className="flex flex-wrap gap-1 items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50 text-sm"
        >
          Prev
        </button>

        {renderPages()}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50 text-sm"
        >
          Next
        </button>
      </div>
    </div>
  );
}
