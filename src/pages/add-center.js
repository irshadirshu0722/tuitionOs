"use client";
import { useState } from "react";
import { useRouter } from "next/router";
import { createTuitionBranch, createTuitionCenter } from "@/lib/appwrite";
import toast, { Toaster } from "react-hot-toast";
import Button from "@/components/atomic/button/Button";
import { useUserContext } from "@/context/GlobalContext";

export default function AddCenter() {
  const router = useRouter();
  const { centerDetails,setCenterDetails } = useUserContext();
  const [centerName, setCenterName] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [classError, setClassError] = useState(false); // for validation
  const [isLoading, setIsLoading] = useState(false);
  const handleClassChange = (className) => {
    setSelectedClasses((prevSelected) =>
      prevSelected.includes(className)
        ? prevSelected.filter((c) => c !== className)
        : [...prevSelected, className]
    );
    setClassError(false); // reset error if user selects a class
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, i) => {
    const startYear = currentYear - 3 + i;
    return `${startYear}-${startYear + 1}`;
  });
  const [selectedYears, setSelectedYears] = useState([
    `${currentYear}-${currentYear + 1}`,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if at least one class is selected
    if (selectedClasses.length === 0) {
      setClassError(true);
      return;
    }

    const data = {
      name: centerName,
      classes: selectedClasses,
      years: selectedYears,
      tuitionCenter: centerDetails.$id,
    };

    try {
      setIsLoading(true);
      const newBranch = await createTuitionBranch(data);
      setCenterDetails((prev) => ({
        ...prev,
        branches: [newBranch, ...prev.branches],
      }));
      toast.success("Center created successfully.");
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create center, try again later!.");
    } finally {
      setIsLoading(false);
    }
  };
  const toggleYearSelection = (year) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  return (
    <div className=" flex items-center justify-center bg-gray-100 px-4 text-gray-600">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Add New Branches
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Center Name */}
          <div>
            <label className="block mb-1 font-semibold">Center Name</label>
            <input
              type="text"
              value={centerName}
              onChange={(e) => setCenterName(e.target.value)}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="Enter center name"
              required
            />
          </div>

          {/* Classes Selection */}
          <div>
            <label className="block mb-2 font-semibold">
              Select Classes <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {Array.from({ length: 12 }, (_, i) => `${i + 1}`).map(
                (className) => (
                  <button
                    key={className}
                    type="button"
                    onClick={() => handleClassChange(className)}
                    className={`px-4 py-2 rounded-lg border text-sm ${
                      selectedClasses.includes(className)
                        ? "bg-purple-600 text-white border-purple-600"
                        : "bg-white text-gray-700 border-gray-300"
                    }`}
                  >
                    Class {className}
                  </button>
                )
              )}
            </div>
            {classError && (
              <p className="text-red-500 text-sm mt-1">
                Please select at least one class.
              </p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-semibold">Select Years</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {yearOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleYearSelection(option)}
                  className={`px-4 py-2 rounded-lg border text-sm ${
                    selectedYears.includes(option)
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <Button isLoading={isLoading} type="submit">
            Save Center
          </Button>
        </form>
      </div>
    </div>
  );
}
