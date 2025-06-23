// SearchBar.js
import { FaSearch, FaFilter } from "react-icons/fa";
import { useState } from "react";

export default function ExamSearchBar({
  searchTerm,
  setSearchTerm,
  onAddStudent,
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between py-6">
      <h2 className="text-xl font-semibold">Tuition Exams</h2>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative w-full sm:w-auto">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <FaSearch />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search subject"
            className="pl-10 pr-4 py-2 border rounded-full text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm"
            onClick={() => onAddStudent(true)} // Or call a prop to open the modal in the parent
          >
            + Create Exam
          </button>
        </div>
      </div>
    </div>
  );
}
