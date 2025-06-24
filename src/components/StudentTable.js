import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import Loading from "./atomic/loading/Loading";
import { useStudents } from "@/hooks/useStudents";
import { useUserContext } from "@/context/GlobalContext";
import { useEffect, useState } from "react";
import { confirmDialog } from "primereact/confirmdialog";
import { deleteStudent } from "@/lib/appwrite";
import toast from "react-hot-toast";
import Pagination from "@mui/material/Pagination";

export default function StudentTable({ onEdit, centerStudents }) {
  const { setCenterStudents, studentLoading } = useUserContext();
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  console.log(centerStudents);
  const studentsPerPage = 20;

  const handleDelete = async (studentId) => {
    try {
      await deleteStudent(studentId);
      setCenterStudents((prev) =>
        prev.filter((item) => item.$id !== studentId)
      );
      toast.success("Student deleted successfully");
    } catch (error) {
      toast.error("Failed to delete student, try again later.");
      console.error(error);
    }
  };

  const onDeleteClick = (studentId) => {
    confirmDialog({
      message: "Are you sure you want to delete?",
      header: "Delete confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => handleDelete(studentId),
      reject: () => {},
    });
  };

  useEffect(() => {
    if (centerStudents && centerStudents.length > 0) {
      const total = Math.ceil(centerStudents.length / studentsPerPage);
      setTotalPages(total);

      const startIndex = (currentPage - 1) * studentsPerPage;
      const endIndex = startIndex + studentsPerPage;
      setFilteredData(centerStudents.slice(startIndex, endIndex));
    } else {
      console.log("No students found");
      setFilteredData([]);
    }
  }, [centerStudents, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [centerStudents]);

  return (
    <div className="">
      <div className=" flex-1 bg-white  rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div className="overflow-y-auto min-w-[600px] max-h-[650px]">
            {
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Address</th>
                    <th className="px-4 py-3">Parent Link</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!studentLoading &&
                    filteredData.map((student) => (
                      <tr
                        key={student.$id}
                        className="border-t border-gray-300"
                      >
                        <td className="px-4 py-4">{student.$id.slice(0, 5)}</td>
                        <td className="px-4 py-4">{student.name}</td>
                        <td className="px-4 py-4">{student.phone}</td>
                        <td className="px-4 py-4 max-w-32">
                          {student.address}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            className="bg-gray-200 px-2 py-1 rounded text-xs hover:bg-gray-300"
                            onClick={() => {
                              const url = `${window.location.origin}/parent/${student.$id}`;
                              navigator.clipboard.writeText(url);
                              toast.success("Parent link copied!");
                            }}
                          >
                            Copy Link
                          </button>
                        </td>
                        <td className="px-4 py-4 flex gap-2">
                          <button onClick={() => onEdit(student)}>
                            <PencilSquareIcon className="w-5 h-5 text-blue-500 cursor-pointer" />
                          </button>
                          <button onClick={() => onDeleteClick(student.$id)}>
                            <TrashIcon className="w-5 h-5 text-red-500 cursor-pointer" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  {!studentLoading && filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-4 text-gray-500"
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            }
          </div>
        </div>
      </div>

      {studentLoading && <Loading />}

      {centerStudents?.length > studentsPerPage && (
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
