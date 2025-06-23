import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import Button from "./atomic/button/Button";
import toast from "react-hot-toast";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const ClassFormModal = ({
  onClose,
  initialData,
  weekRange,
  onSave,
  timetableData, // pass timetableData as prop
}) => {
  const [formData, setFormData] = useState({
    subject: "",
    professor: "",
    day: "Monday",
    startTime: "",
    endTime: "",
  });

  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState("");
  const modalRef = useRef();
  console.log(initialData);
  useEffect(() => {
    if (initialData) {
      setFormData({
        subject: initialData.subject || "",
        professor: initialData.professor || "",
        day: initialData.day || "Monday",
        startTime: initialData.startTime || "",
        endTime: initialData.endTime || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setValidationError("");
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getDateFromDay = (day) => {
    const desiredDayIndex = daysOfWeek.indexOf(day); // 0 = Monday
    const weekStartDate = new Date(weekRange.startDate);
    const actualStartDayIndex = weekStartDate.getDay(); // 0 = Sunday, 1 = Monday, ...

    // Convert to Monday-based index (0 = Monday)
    const currentIndex = (actualStartDayIndex + 6) % 7;

    const diff = desiredDayIndex - currentIndex;
    const targetDate = new Date(weekStartDate);
    targetDate.setDate(weekStartDate.getDate() + diff);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate.toISOString();
  };

  const getTimeInMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    const newStart = getTimeInMinutes(formData.startTime);
    const newEnd = getTimeInMinutes(formData.endTime);

    if (newStart >= newEnd) {
      setValidationError("Start time must be earlier than end time.");
      return;
    }

    if (newEnd - newStart < 30) {
      setValidationError(
        "End time must be at least 30 minutes after start time."
      );
      return;
    }

    const clashes = timetableData?.[formData.day]?.some((entry) => {
      console.log(entry, initialData);
      if (initialData && initialData.$id === entry.$id) return false;

      const existingStart = getTimeInMinutes(entry.startTime);
      const existingEnd = getTimeInMinutes(entry.endTime);

      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });

    if (clashes) {
      setValidationError("Another class already exists at this time.");
      toast.error("Class time overlaps with an existing one.");
      return;
    }

    setLoading(true);

    const newEntry = {
      ...formData,
      date: getDateFromDay(formData.day),
    };

    await onSave(newEntry, initialData != null && initialData.subject);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.7)] backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative bg-white rounded-xl shadow-lg w-full max-w-md p-6"
      >
        <button
          onClick={() => onClose(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-6 text-center">
          {initialData ? "Edit Timetable Entry" : "Add Timetable Entry"}
        </h2>

        <form onSubmit={handleSubmit}>
          {["subject", "professor", "startTime", "endTime"].map((field) => (
            <div key={field} className="mb-4">
              <label
                htmlFor={field}
                className="block text-sm font-medium text-gray-700 capitalize"
              >
                {field === "startTime" || field === "endTime"
                  ? `${field} (HH:mm)`
                  : field}
              </label>
              <input
                type={field.includes("Time") ? "time" : "text"}
                id={field}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                required
                className={`mt-1 block w-full border ${
                  validationError &&
                  (field === "startTime" || field === "endTime")
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-lg p-2 shadow-sm focus:ring-purple-500 focus:border-purple-500`}
              />
              {validationError &&
                (field === "startTime" || field === "endTime") && (
                  <p className="text-red-500 text-sm mt-1">{validationError}</p>
                )}
            </div>
          ))}

          <div className="mb-4">
            <label
              htmlFor="day"
              className="block text-sm font-medium text-gray-700"
            >
              Day
            </label>
            <select
              id="day"
              name="day"
              value={formData.day}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-sm focus:ring-purple-500 focus:border-purple-500"
            >
              {daysOfWeek.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
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
              {initialData && initialData.$id ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassFormModal;
