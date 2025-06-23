// components/AttendanceSearch.js
import React from "react";
import {
  UserPlusIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import { BiLeftArrowAlt, BiRightArrowAlt } from "react-icons/bi"; // Import new arrow icons

const AttendanceSearch = ({
  date,
  onPrevDate,
  onNextDate,
  searchTerm,
  setSearchTerm,
  onSharePDF,
}) => {
  return (
    <div className="flex flex-row gap-4 max-sm:flex-col justify-between  mb-4 p-2 rounded">
      <div className="flex items-center gap-2 max-md:mb-3">
        <button
          className="p-2 rounded-full border hover:bg-gray-100"
          onClick={onPrevDate}
        >
          <FaChevronLeft />
        </button>

        <div className="px-4 py-2 border rounded-lg text-gray-700 font-semibold">
          {date}
        </div>

        <button
          className="p-2 rounded-full border hover:bg-gray-100"
          onClick={onNextDate}
        >
          <FaChevronRight />
        </button>
      </div>
      <div className="flex items-center gap-2 max-sm:gap-3 max-sm:!flex-col max-sm:w-full">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <FaSearch />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search students..."
            className="pl-10 pr-4 py-2 border rounded-full text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={onSharePDF}
          className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full w-full  text-xs justify-center"
        >
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" /> Share as PDF
        </button>
      </div>
    </div>
  );
};

export default AttendanceSearch;
