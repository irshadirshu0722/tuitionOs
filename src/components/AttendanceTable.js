import React, { useEffect, useState } from "react";
import Loading from "./atomic/loading/Loading";
import Pagination from "@mui/material/Pagination";
import { useUserContext } from "@/context/GlobalContext";

export const AttendanceTable = ({
  attendanceData,
  onAttendance,
  loading,
  attendanceLoading,
}) => {
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { centerStudents } = useUserContext();
  const attendancePerPage = 20;

  useEffect(() => {
    if (attendanceData && attendanceData.length > 0) {
      const total = Math.ceil(attendanceData.length / attendancePerPage);
      setTotalPages(total);

      const startIndex = (currentPage - 1) * attendancePerPage;
      const endIndex = startIndex + attendancePerPage;
      setFilteredData(attendanceData.slice(startIndex, endIndex));
    } else {
      setFilteredData([]);
    }
  }, [attendanceData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [centerStudents]);

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="overflow-y-auto min-w-[500px] max-h-[700px]">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {!loading &&
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {item.$id.slice(item.$id.length - 8)}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      {item.name}
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                          ${
                            item.attendance
                              ? "bg-green-100 text-green-700 border border-green-400"
                              : "bg-red-100 text-red-700 border border-red-400"
                          }`}
                      >
                        {item.attendance ? "Present" : "Absent"}
                      </div>
                    </td>
                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                      <button
                        onClick={() =>
                          onAttendance(
                            item.attendance ? item.attendanceId : item.$id,
                            !item.attendance
                          )
                        }
                        disabled={
                          attendanceLoading.has(item.$id) ||
                          attendanceLoading.has(item.attendanceId)
                        }
                        className={`px-3 py-2 rounded-md text-white text-xs flex justify-center font-medium min-w-[111px] cursor-pointer
                          ${item.attendance ? "bg-red-500" : "bg-green-500 "}
                          ${
                            attendanceLoading.has(item.$id) ||
                            attendanceLoading.has(item.attendanceId)
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }
                        `}
                      >
                        {attendanceLoading.has(item.$id) ||
                        attendanceLoading.has(item.attendanceId) ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-black"></div>
                        ) : item.attendance ? (
                          "Mark as Absent"
                        ) : (
                          "Mark as Present"
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              {!loading && filteredData.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-gray-500">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {loading && <Loading />}
        </div>
      </div>

      {attendanceData?.length > attendancePerPage && (
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
};
