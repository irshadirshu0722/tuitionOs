import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import Button from "./atomic/button/Button";
import { createExam, updateExam } from "@/lib/appwrite";
import toast from "react-hot-toast";
import { useUserContext } from "@/context/GlobalContext";

const ExamFormModal = ({ onClose, initialData, onExamUpdate }) => {
  const [formData, setFormData] = useState({
    id: "",
    subject: "",
    datetime: "",
    totalScore: "",
    minScore: "0",
  });
  const { branchDetails, selectedYear, selectedClass } = useUserContext();
  const modalRef = useRef();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.$id || "",
        subject: initialData.subject || "",
        datetime: initialData.datetime || "",
        totalScore: initialData.totalScore || "",
        minScore:
          initialData.minScore !== undefined ? initialData.minScore : "0",
      });
    } else {
      setFormData({
        id: "",
        subject: "",
        datetime: "",
        totalScore: "",
        minScore: "0",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (initialData) {
      try {
        const updatedExam = await updateExam(initialData.$id, {
          subject: formData.subject,
          datetime: formData.datetime,
          totalScore: formData.totalScore,
          minScore: parseFloat(`${formData.minScore}`),
        });
        onExamUpdate((prev) =>
          prev.map((item) =>
            item.$id === updatedExam.$id ? updatedExam : item
          )
        );
        toast.success("Exam updated successfully.");
        onClose();
      } catch (err) {
        console.log(err);
        toast.error("Failed to update exam.");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const newExam = await createExam({
          subject: formData.subject,
          datetime: formData.datetime,
          totalScore: parseFloat(`${formData.totalScore}`),
          minScore: parseFloat(`${formData.minScore}`),
          branchId: branchDetails.$id,
          classId: selectedClass,
          yearId: selectedYear,
        });
        onExamUpdate((prev) => [newExam, ...prev]);
        toast.success("New exam created.");
        onClose();
      } catch (err) {
        console.log(err);
        toast.error("Failed to create exam.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.7)] backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-6 text-center">
          {initialData ? "Edit Exam" : "Add New Exam"}
        </h2>
        <form onSubmit={handleSubmit}>
          {/* Subject */}
          <div className="mb-4">
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700"
            >
              Subject
            </label>
            <input
              type="text"
              name="subject"
              id="subject"
              value={formData.subject}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-sm"
            />
          </div>

          {/* DateTime */}
          <div className="mb-4">
            <label
              htmlFor="datetime"
              className="block text-sm font-medium text-gray-700"
            >
              Date & Time
            </label>
            <input
              type="datetime-local"
              name="datetime"
              id="datetime"
              value={formData.datetime}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-sm"
            />
          </div>

          {/* Total Score */}
          <div className="mb-4">
            <label
              htmlFor="totalScore"
              className="block text-sm font-medium text-gray-700"
            >
              Total Score
            </label>
            <input
              type="number"
              name="totalScore"
              id="totalScore"
              value={formData.totalScore}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-sm"
            />
          </div>

          {/* Minimum Score to Pass */}
          <div className="mb-4">
            <label
              htmlFor="minScore"
              className="block text-sm font-medium text-gray-700"
            >
              Minimum Score to Pass
            </label>
            <input
              type="number"
              name="minScore"
              id="minScore"
              min="0"
              value={formData.minScore}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-sm"
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </button>
            <Button
              isLoading={loading}
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {initialData ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamFormModal;
