//components/TableSearch

import { format } from "date-fns";
import { useState, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaShareAlt } from "react-icons/fa";

const TableSearch = ({ onDateChange, onShare, weekRange, onAddClass }) => {
  const formattedDate = `${format(
    weekRange.startDate,
    "EEE MMM dd"
  )} - ${format(weekRange.endDate, "EEE MMM dd")}`;

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 mt-6">
      <div className="flex items-center gap-2 ">
        <button
          className="p-2 rounded-full border hover:bg-gray-100"
          onClick={() => onDateChange(false)}
        >
          <FaChevronLeft />
        </button>

        <div className="px-4 py-2 border rounded-lg text-gray-700 font-semibold max-sm:text-sm">
          {formattedDate}
        </div>

        <button
          className="p-2 rounded-full border hover:bg-gray-100"
          onClick={() => onDateChange(true)}
        >
          <FaChevronRight />
        </button>
      </div>

      <div className="flex gap-2 ">
        <button
          onClick={onShare}
          className="flex items-center px-4 py-2 rounded-full border bg-purple-600 hover:bg-purple-700 text-white max-sm:text-sm flex-1"
        >
          <FaShareAlt className="mr-2" />
          Share as Document
        </button>
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm max-sm:text-sm"
          onClick={() => onAddClass(true)}
        >
          + Add Class
        </button>
      </div>
    </div>
  );
};

export default TableSearch;
