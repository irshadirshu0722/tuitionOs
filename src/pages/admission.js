"use client";
import "primereact/resources/themes/lara-light-cyan/theme.css";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import SearchBar from "../components/SearchBar";
import StudentTable from "../components/StudentTable";
import StudentFormModal from "../components/StudentFormModal";

import { useUserContext } from "@/context/GlobalContext";

export default function Admission() {
  const router = useRouter();
  const { centerStudents, selectedYear, selectedClass } = useUserContext();

  const [searchTerm, setSearchTerm] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [editedStudent, setEditedStudent] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredData, setFilteredData] = useState();
  const openAddModal = () => {
    setEditedStudent(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const onEditStudent = (studentData) => {
    console.log("enter");
    setEditingStudent(studentData);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (centerStudents) {
      setFilteredData(
        centerStudents.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, centerStudents]);

  useEffect(() => {
    setSearchTerm("");
  }, [selectedClass, selectedYear]);
  return (
    <div>
      <div className="flex flex-col min-h-[calc(100vh-200px)]">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onAddStudent={openAddModal}
        />
        <div>
          <StudentTable onEdit={onEditStudent} centerStudents={filteredData} />
        </div>
      </div>

      {isModalOpen && (
        <StudentFormModal
          onClose={closeModal}
          initialData={editingStudent}
          className="max-w-full sm:max-w-lg"
        />
      )}
    </div>
  );
}
