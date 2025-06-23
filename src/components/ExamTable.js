import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import Loading from "./atomic/loading/Loading";
import { useEffect, useState } from "react";
import Pagination from "@mui/material/Pagination";
import clsx from "clsx";

export default function ExamTable({
  onEdit,
  setSelectedExam,
  centerExams,
  OnDelete,
  loading,
}) {
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [examLoading, setExamLoading] = useState(false);

  const examsPerPage = 20;

  useEffect(() => {
    if (centerExams && centerExams.length > 0) {
      const total = Math.ceil(centerExams.length / examsPerPage);
      setTotalPages(total);

      const startIndex = (currentPage - 1) * examsPerPage;
      const endIndex = startIndex + examsPerPage;
      setFilteredData(centerExams.slice(startIndex, endIndex));
    } else {
      setFilteredData([]);
    }
  }, [centerExams, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [centerExams]);

  const getStatus = (datetime) => {
    const now = new Date();
    const start = new Date(datetime);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour

    if (now < start) return "Upcoming";
    if (now >= start && now <= end) return "Ongoing";
    return "Completed";
  };

  const getStatusClass = (status) => {
    return clsx("text-xs font-semibold px-2 py-1 rounded", {
      "bg-green-100 text-green-800": status === "Upcoming",
      "bg-yellow-100 text-yellow-800": status === "Ongoing",
      "bg-gray-200 text-gray-700": status === "Completed",
    });
  };

  const onDeleteClick = (id) => {
    if (confirm("Are you sure you want to delete this exam?")) {
      OnDelete(id);
    }
  };

  return (
    <div className="">
      <div className="flex-1 bg-white rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="overflow-y-auto min-w-[700px] max-h-[650px]">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-600 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total Score</th>
                  <th className="px-4 py-3">Min Score</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading &&
                  filteredData.map((exam) => {
                    const status = getStatus(exam.datetime);
                    return (
                      <tr key={exam.$id} className="border-t border-gray-300">
                        <td className="px-4 py-4">{exam.$id.slice(0, 5)}</td>
                        <td className="px-4 py-4">{exam.subject}</td>
                        <td className="px-4 py-4">
                          {new Date(exam.datetime).toLocaleDateString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                          ,{" "}
                          {new Date(exam.datetime).toLocaleTimeString("en-IN", {
                            timeZone: "Asia/Kolkata",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-4">
                          <span className={getStatusClass(status)}>
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-4">{exam.totalScore}</td>
                        <td className="px-4 py-4">
                          {exam.minScore !== undefined ? exam.minScore : 0}
                        </td>
                        <td className="px-4 py-4 flex gap-2 items-center">
                          <button onClick={() => onEdit(exam)}>
                            <PencilSquareIcon className="w-5 h-5 text-blue-500 cursor-pointer" />
                          </button>
                          <button onClick={() => onDeleteClick(exam.$id)}>
                            <TrashIcon className="w-5 h-5 text-red-500 cursor-pointer" />
                          </button>
                          <button
                            onClick={() => setSelectedExam(exam)}
                            className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition"
                          >
                            View Mark
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                {!loading && filteredData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {loading && <Loading />}

      {centerExams?.length > examsPerPage && (
        <div className="flex justify-center py-5">
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => setCurrentPage(page)}
            variant="outlined"
            shape="rounded"
            color="primary"
          />
        </div>
      )}
    </div>
  );
}
