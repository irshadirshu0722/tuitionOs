import { useEffect, useState, memo } from "react";
import { useUserContext } from "@/context/GlobalContext";
import toast from "react-hot-toast";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
import { CheckIcon } from "@heroicons/react/24/outline";
import Loading from "./atomic/loading/Loading";
import clsx from "clsx";
import {
  createExamResult,
  deleteExamResult,
  updateExamResult,
} from "@/lib/appwrite";
import jsPDF from "jspdf";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";

export default function ExamDetailDrawer({ exam, onClose, setExams }) {
  const { centerStudents } = useUserContext();
  const [studentsWithScores, setStudentsWithScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!exam || !centerStudents) return;
    combineExamResultsAndStudent();
  }, [exam, centerStudents]);

  const handleSaveScore = async (result) => {
    try {
      if (result.$id) {
        const updatedResult = await updateExamResult(result.$id, {
          score: parseFloat(`${result.score}`),
        });
        setStudentsWithScores((prev) =>
          prev.map((item) =>
            item.studentId === updatedResult.studentId ? updatedResult : item
          )
        );
        setExams((prev) =>
          prev.map((item) =>
            item.$id == exam.$id
              ? {
                  ...exam,
                  examResults: exam.examResults.map((res) =>
                    res.$id == updatedResult.$id ? updatedResult : res
                  ),
                }
              : item
          )
        );
      } else {
        const newResult = await createExamResult({
          exam: exam.$id,
          student: result.studentId,
          score: result.score || 0,
          studentId: result.studentId,
        });
        setStudentsWithScores((prev) =>
          prev.map((item) =>
            item.studentId === newResult.studentId ? newResult : item
          )
        );
        setExams((prev) =>
          prev.map((item) =>
            item.$id == exam.$id
              ? { ...exam, examResults: [...exam.examResults, newResult] }
              : item
          )
        );
      }
      toast.success("Score saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save score");
    }
  };

  const handleDeleteScore = async (result) => {
    confirmDialog({
      message: "Are you sure you want to delete?",
      header: "Delete confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: async () => {
        try {
          await deleteExamResult(result.$id);
          toast.success("Score deleted");
          setExams((prev) =>
            prev.map((item) =>
              item.$id == exam.$id
                ? {
                    ...exam,
                    examResults: exam.examResults.map((res) => {
                      if (res.$id == result.$id) {
                        return {
                          student: res.student,
                          studentId: res.studentId,
                        };
                      }
                      return res;
                    }),
                  }
                : item
            )
          );
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete score");
        }
      },
      reject: () => {},
    });
  };

  const combineExamResultsAndStudent = () => {
    let newResults = [];
    const resultStudentIds = {};
    exam.examResults.forEach((item) => {
      resultStudentIds[item.studentId] = item;
    });
    centerStudents.forEach((item) => {
      if (!resultStudentIds[item.$id]) {
        newResults.push({
          student: item,
          studentId: item.$id,
          score: 0,
        });
      } else {
        newResults.push(resultStudentIds[item.$id]);
      }
    });
    setStudentsWithScores(newResults);
    setLoading(false);
  };

  const handleSharePDF = () => {
    const doc = new jsPDF();

    const formattedDate = new Date(exam.datetime).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      weekday: "short",
    });
    const formattedTime = new Date(exam.datetime).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Title
    doc.setFont("Helvetica", "bold");
    doc.text(`Exam Results`, 14, 20);
    doc.text(`Subject: ${exam.subject}`, 14, 30);
    doc.text(`Date: ${formattedDate} ${formattedTime}`, 14, 40);
    doc.text(`Total Score: ${exam.totalScore}`, 14, 50);

    let yOffset = 70;

    if (studentsWithScores.length > 0) {
      doc.setFont("Helvetica", "bold");
      doc.text("Student", 14, yOffset);
      doc.text("Score", 160, yOffset, { align: "right" });

      yOffset += 10;
      doc.setFont("Helvetica", "normal");

      studentsWithScores.forEach((student) => {
        if (yOffset >= 280) {
          doc.addPage();
          yOffset = 20;
        }
        doc.text(`${student.student?.name || "Unnamed"}`, 14, yOffset);
        doc.text(`${student.score ?? 0}`, 160, yOffset, { align: "right" });
        yOffset += 10;
      });
    } else {
      doc.text("No exam data available.", 14, yOffset);
    }

    doc.save(`ExamResult_${exam.subject.replace(/\s/g, "_")}.pdf`);
  };

  const ExamResultRow = memo(({ result }) => {
    const [saving, setSaving] = useState(false);
    const [score, setScore] = useState(result.score);
    const handleLocalSave = async () => {
      setSaving(true);
      await handleSaveScore({ ...result, score: parseFloat(`${score}`) });
      setSaving(false);
    };
    const minScore = exam.minScore !== undefined ? exam.minScore : 0;
    const hasScore =
      result.$id && score !== null && score !== undefined && score !== "";
    const passed = hasScore && parseFloat(score) >= minScore;
    let statusLabel, statusClass;
    if (!hasScore) {
      statusLabel = "Not Added";
      statusClass = "bg-gray-100 text-gray-600";
    } else if (passed) {
      statusLabel = "Passed";
      statusClass = "bg-green-100 text-green-700";
    } else {
      statusLabel = "Failed";
      statusClass = "bg-red-100 text-red-700";
    }
    return (
      <tr className="border-t border-gray-300">
        <td className="px-4 py-3">{result.student?.name}</td>
        <td className="px-4 py-3">
          <input
            type="number"
            className="w-20 border rounded px-2 py-1"
            value={score}
            onChange={(e) =>
              setScore(
                e.target.value > exam.totalScore
                  ? exam.totalScore
                  : e.target.value
              )
            }
            placeholder="Score"
          />
        </td>
        <td className="px-4 py-3 flex gap-2 items-center">
          {result.$id ? (
            <>
              <button onClick={handleLocalSave} title="Edit" disabled={saving}>
                {saving ? (
                  <CheckIcon className="w-5 h-5 text-blue-400 animate-spin" />
                ) : (
                  <PencilSquareIcon className="w-5 h-5 text-blue-600 cursor-pointer" />
                )}
              </button>
              <button
                onClick={() => handleDeleteScore(result)}
                title="Delete"
                disabled={saving}
              >
                <TrashIcon className="w-5 h-5 text-red-600 cursor-pointer" />
              </button>
            </>
          ) : (
            <button
              onClick={handleLocalSave}
              disabled={saving}
              className={clsx(
                "text-sm border px-3 py-1 rounded w-16 flex justify-center",
                saving
                  ? "bg-green-200 text-gray-500 cursor-not-allowed border-green-500"
                  : "bg-green-200 text-black border-green-400 hover:bg-green-300"
              )}
              title="Save"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-black "></div>
              ) : (
                "Save"
              )}
            </button>
          )}
        </td>
        <td className="px-4 py-3">
          <span
            className={`px-2 py-1 rounded-full text-xs font-bold ${statusClass}`}
          >
            {statusLabel}
          </span>
        </td>
      </tr>
    );
  });

  return (
    <div
      className={`absolute w-full h-full bg-white z-30 exam-slider transition-all overflow-y-hidden ${
        exam && "show-exam-slider"
      }`}
    >
      {exam && (
        <div className="p-4 ">
          <div className="flex flex-row-reverse justify-between ">
            <div className="flex flex-col justify-between items-end  mb-8">
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-black float-right cursor-pointer pr-4"
              >
                ✕
              </button>
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm cursor-pointer"
                onClick={() => handleSharePDF()} // Or call a prop to open the modal in the parent
              >
                Export as pdf
              </button>
            </div>

            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-1">
                Exam: {exam.subject}
              </h2>
              <h2 className="text-xl font-semibold mb-1">
                Total Score: {exam.totalScore}
              </h2>
              <h2 className="text-xl font-semibold mb-4">
                Exam Date: {new Date(exam.datetime).toLocaleString()}
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="overflow-y-auto min-w-[700px] max-h-[600px] bg-white rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-600 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Actions</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading ? (
                    studentsWithScores.map((result) => (
                      <ExamResultRow key={result.studentId} result={result} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>
                        <Loading />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog />
    </div>
  );
}
