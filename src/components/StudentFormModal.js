import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react"; // Or any other icon lib
import Button from "./atomic/button/Button";
import { createStudent, updateStudent } from "@/lib/appwrite";
import { useUserContext } from "@/context/GlobalContext";
import toast from "react-hot-toast";

const StudentFormModal = ({ onClose, initialData }) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    phone: "",
    address: "",
  });

  const modalRef = useRef();
  const [loading, setLoading] = useState(false);
  const {
    centerDetails,
    selectedYear,
    selectedClass,
    branchDetails,
    setCenterStudents,
  } = useUserContext();
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.$id || "",
        name: initialData.name || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
      });
    } else {
      setFormData({ id: "", name: "", phone: "", address: "" });
    }
  }, [initialData]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  console.log(selectedClass,selectedYear);
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    if (initialData) {
      try {
        const newStudent = await updateStudent(initialData.$id, {
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
        });
        setCenterStudents((prev) =>
          prev.map((item) => (item.$id == initialData.$id ? newStudent : item))
        );
        toast.success("Student Updated successfully.");
        onClose();
      } catch (error) {
        console.log(error);
        toast.error("Failed to create new student, try again later.");
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const newStudent = await createStudent({
          branchId: branchDetails.$id,
          classId: selectedClass,
          yearId: selectedYear,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
        });
        setCenterStudents((prev) => [newStudent, ...prev]);
        toast.success("New student added successfully.");
        onClose();
      } catch (error) {
        console.log(error);
        toast.error("Failed to create new student, try again later.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.7)] bg-opacity-40 backdrop-blur-sm"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 id="modal-title" className="text-xl font-semibold mb-6 text-center">
          {initialData ? "Edit Student" : "Add New Student"}
        </h2>
        <form onSubmit={handleSubmit}>
          {["name", "phone", "address"].map((field) => (
            <div key={field} className="mb-4">
              <label
                className="block text-sm font-medium text-gray-700 capitalize"
                htmlFor={field}
              >
                {field}
              </label>
              <input
                id={field}
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          ))}

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

export default StudentFormModal;
