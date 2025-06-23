import React from "react";
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const FeesSearch = ({ onSearch, date, onPrevDate, onNextDate, loading }) => {
  return (
    <div className="flex flex-wrap gap-4 justify-between items-center m-4 md:flex-row">
      <div className="flex items-center gap-2 ">
        <button
          className="p-2 rounded-full border hover:bg-gray-100"
          onClick={onPrevDate}
          disabled={loading}
        >
          <FaChevronLeft />
        </button>

        <div className="px-4 py-2 border rounded-lg text-gray-700 font-semibold">
          {date}
        </div>

        <button
          className="p-2 rounded-full border hover:bg-gray-100"
          onClick={onNextDate}
          disabled={loading}
        >
          <FaChevronRight />
        </button>
      </div>
      {/* Search + Add Student Button */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full sm:w-auto">
        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-full pl-10 py-2"
            placeholder="Search payments..."
            onChange={(e) => onSearch(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeesSearch;
