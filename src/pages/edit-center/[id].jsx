"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  getBranchDetails,
  getCenterData,
  updateTuitionCenterBranch,
} from "@/lib/appwrite";
import toast from "react-hot-toast";
import Button from "@/components/atomic/button/Button";
import Loading from "@/components/atomic/loading/Loading";
import { useUserContext } from "@/context/GlobalContext";

export default function EditCenter() {
  const router = useRouter();
  const { id } = router.query;
  const { setBranchDetails, setCenterStudents } = useUserContext();
  const [centerName, setCenterName] = useState("");
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [classError, setClassError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 7 }, (_, i) => {
    const startYear = currentYear - 3 + i;
    return `${startYear}-${startYear + 1}`;
  });

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const data = await getBranchDetails(id);
        setCenterName(data.name || "");
        setSelectedClasses(data.classes || []);
        setSelectedYears(data.years || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load center data.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchData();
  }, [id]);

  const handleClassChange = (className) => {
    setSelectedClasses((prev) =>
      prev.map((item) => item.class).includes(className)
        ? prev.filter((y) => y.class !== className)
        : [...prev, { class: className }]
    );
    setClassError(false);
  };

  const toggleYearSelection = (year) => {
    setSelectedYears((prev) =>
      prev.map((item) => item.year).includes(year)
        ? prev.filter((y) => y.year !== year)
        : [...prev, { year: year }]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedClasses.length === 0) {
      setClassError(true);
      return;
    }

    const updatedData = {
      name: centerName,
      classes: selectedClasses,
      years: selectedYears,
    };

    try {
      setIsLoading(true);
      const responseData = await updateTuitionCenterBranch(id, updatedData);
      setBranchDetails(responseData);
      setCenterStudents(null);
      toast.success("Center updated successfully.");
      router.push("/admission");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update center.");
    } finally {
      setIsLoading(false);
    }
  };
  if (isFetching) return <Loading />;
  return (
    <div className="py-10 max-sm:py-0 flex items-center justify-center  px-4 text-gray-600">
      <div className="bg-white p-8 max-sm:px-0 rounded-xl shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Edit Center</h1>
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

          {/* Class Selection */}
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
                      selectedClasses
                        .map((item) => item.class)
                        .includes(className)
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

          {/* Year Selection */}
          <div>
            <label className="block mb-2 font-semibold">Select Years</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {yearOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleYearSelection(option)}
                  className={`px-4 py-2 rounded-lg border text-sm ${
                    selectedYears.map((item) => item.year).includes(option)
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
            Update Center
          </Button>
        </form>
      </div>
    </div>
  );
}
