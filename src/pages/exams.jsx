"use client";
import "primereact/resources/themes/lara-light-cyan/theme.css";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { useUserContext } from "@/context/GlobalContext";
import { useStudents } from "@/hooks/useStudents";
import ExamSearchBar from "@/components/ExamSearchBar";
import ExamFormModal from "@/components/ExamFormModal";
import ExamTable from "@/components/ExamTable";
import toast from "react-hot-toast";
import { getExams } from "@/lib/appwrite";
import ExamDetailDrawer from "@/components/ExamDetails";
export default function Admission() {
  const router = useRouter();
  const {
    centerStudents,
    selectedYear,
    selectedClass,
    branchDetails,
    studentLoading,
  } = useUserContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [initData, setInitData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredData, setFilteredData] = useState();
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const {} = useStudents();
  const [selectedExam, setSelectedExam] = useState(null);
  const openAddModal = () => {
    setInitData(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setInitData(null);
  };

  const onEditExam = (examData) => {
    setInitData(examData);
    setIsModalOpen(true);
  };

  useEffect(() => {
    console.log("fetching exams", centerStudents);
    if (centerStudents && centerStudents != null) {
      console.log("going to fetch");
      setSelectedExam(null);
      setExams([]);
      fetchExams();
    }
  }, [centerStudents]);
  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await getExams(
        branchDetails.$id,
        selectedYear,
        selectedClass
      );
      setExams(response.documents);
    } catch (error) {
      toast.error("Failed to fetch exams, try again later");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setFilteredData(
      exams.filter((item) =>
        item.subject.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, exams]);

  useEffect(() => {
    setSearchTerm("");
  }, [selectedClass, selectedYear]);

  const handleDelete = async (examId) => {
    try {
      await deleteExam(examId);
      setCenterExams((prev) => prev.filter((item) => item.$id !== examId));
      toast.success("Exam deleted successfully");
    } catch (error) {
      toast.error("Failed to delete exam, try again later.");
      console.error(error);
    }
  };

  const onDeleteClick = (examId) => {
    confirmDialog({
      message: "Are you sure you want to delete this exam?",
      header: "Delete confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => handleDelete(examId),
      reject: () => {},
    });
  };
  return (
    <div>
      <div className="flex flex-col min-h-[calc(100vh-200px)] relative overflow-x-hidden">
        <ExamSearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddStudent={openAddModal}
        />
        <div>
          <ExamTable
            onEdit={onEditExam}
            centerExams={filteredData}
            loading={loading || studentLoading}
            OnDelete={onDeleteClick}
            setSelectedExam={setSelectedExam}
          />
        </div>
        <ExamDetailDrawer
          exam={selectedExam}
          onClose={() => setSelectedExam(null)}
          setExams={setExams}
        />
      </div>

      {isModalOpen && (
        <ExamFormModal
          onClose={closeModal}
          initialData={initData}
          className="max-w-full sm:max-w-lg"
          onExamUpdate={setExams}
        />
      )}
    </div>
  );
}
