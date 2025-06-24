import { Pagination } from "@mui/material";
import React, { useEffect, useState } from "react";
import Loading from "./atomic/loading/Loading";
import { useUserContext } from "@/context/GlobalContext";
import { format } from "date-fns";

const FeesTable = ({ paymentsData, onHandlePaid, loading, paymentLoading }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { centerStudents } = useUserContext();
  const attendancePerPage = 20;

  useEffect(() => {
    if (paymentsData && paymentsData.length > 0) {
      const total = Math.ceil(paymentsData.length / attendancePerPage);
      setTotalPages(total);

      const startIndex = (currentPage - 1) * attendancePerPage;
      const endIndex = startIndex + attendancePerPage;
      setFilteredData(paymentsData.slice(startIndex, endIndex));
    } else {
      setFilteredData([]);
    }
  }, [paymentsData, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [centerStudents]);

  return (
    <div>
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="min-w-full table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Student ID",
                    "Student Name",
                    "Date",
                    "Amount",
                    "TotalPaid",
                    "Status",
                    "Action",
                  ].map((text) => (
                    <th
                      key={text}
                      className="sticky top-0 bg-gray-50 z-10 px-5 py-3 border-b-2 border-gray-200 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                    >
                      {text}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!loading &&
                  filteredData.map((item) => (
                    <tr key={item.$id}>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                        {item.$id.slice(item.$id.length - 8)}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                        {item.name}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                        {item.paid
                          ? format(item.paidAt, "dd MMMM yyyy")
                          : "____"}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                        {item.paid ? item.amount : "____"}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                        {item.totalPaid}
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                          ${
                            item.paid
                              ? "bg-green-100 text-green-700 border border-green-400"
                              : "bg-red-100 text-red-700 border-red-400"
                          }`}
                        >
                          {item.paid ? "Paid" : "Unpaid"}
                        </div>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center">
                        <button
                          onClick={() =>
                            onHandlePaid(
                              item.paid ? item.paymentId : item.$id,
                              item.paid ? false : true
                            )
                          }
                          disabled={
                            paymentLoading.has(item.$id) ||
                            paymentLoading.has(item.paymentId)
                          }
                          className={`px-3 py-2 rounded-md text-white text-xs flex justify-center font-medium min-w-[111px] cursor-pointer
                        ${item.paid ? "bg-blue-500" : "bg-green-500"}
                        ${
                          paymentLoading.has(item.$id) ||
                          paymentLoading.has(item.paymentId)
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }
                      `}
                        >
                          {paymentLoading.has(item.$id) ||
                          paymentLoading.has(item.paymentId) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-black"></div>
                          ) : item.paid ? (
                            "Edit Payment"
                          ) : (
                            "Mark as paid"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                {!loading && filteredData.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {loading && <Loading />}
          </div>
        </div>

        {/* Pagination */}
      </div>
      {paymentsData?.length > attendancePerPage && (
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

export default FeesTable;
