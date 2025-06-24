// pages/timetable.js
"use client";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import TableSearch from "../components/TableSearch";
import TimeTable from "../components/TableContent";
import Pagination from "../components/Pagination";
import {
  getTimetableForDate,
  updateTimetableEntry,
  createTimetableEntry,
  deleteTimetableEntry,
} from "../lib/appwrite";
import { jsPDF } from "jspdf";
import { toast } from "react-hot-toast";
import { useUserContext } from "@/context/GlobalContext";
import ClassFormModal from "@/components/ClassFormModal";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import ProtectedRoute from "@/components/middleware/ProtectedRouter";
function TimetablePage() {
  const { branchDetails, selectedClass, selectedYear } = useUserContext();
  const [timetableData, setTimetableData] = useState({});
  const [loading, setLoading] = useState(true);
  const [weekRange, setWeekRange] = useState(() => getWeekRange(0));
  const [weekOffset, setWeekOffset] = useState(0);
  const [openForm, setOpenForm] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [editingId, setEditingId] = useState(null);
  useEffect(() => {
    if (selectedClass && selectedYear && branchDetails) {
      console.log("going to fetch time table");
      fetchTimetable();
    }
  }, [weekRange, selectedClass, selectedYear, branchDetails]);

  useEffect(() => {
    if (initialData) {
      setOpenForm(true);
    } else {
      setOpenForm(false);
    }
  }, [initialData]);

  useEffect(() => {
    if (!openForm) {
      setEditingId(null);
      setInitialData(null);
    }
  }, [openForm]);

  function getWeekRange(offset = 0) {
    const today = new Date();
    today.setDate(today.getDate() + offset * 7);

    const day = today.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;

    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return {
      startDate: monday.toISOString(),
      endDate: sunday.toISOString(),
    };
  }
  const handleDateChange = (isRight) => {
    setTimetableData({});
    const newOffset = isRight ? weekOffset + 1 : weekOffset - 1;
    setWeekOffset(newOffset);
    setWeekRange(getWeekRange(newOffset));
  };
  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const timetable = await getTimetableForDate(
        branchDetails.$id,
        selectedClass,
        selectedYear,
        weekRange.startDate,
        weekRange.endDate
      );
      const groupedData = groupTimeTableData(timetable);
      setTimetableData(groupedData);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch timetable, try again later.");
    } finally {
      setLoading(false);
    }
  };
  const groupTimeTableData = (weekData) => {
    const grouped = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    function getDayOfWeek(dateStr) {
      const date = new Date(dateStr);
      const dayIndex = date.getDay(); // 0 = Sunday
      console.log(date, dayIndex, days[dayIndex]);
      return days[dayIndex];
    }

    weekData.forEach((doc) => {
      const dayOfWeek = getDayOfWeek(doc.date);
      if (grouped[dayOfWeek]) {
        grouped[dayOfWeek].push(doc);
      }
    });

    Object.keys(grouped).forEach((day) => {
      grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return grouped;
  };
  const getYearAndClass = () => {
    let className;
    branchDetails.classes.forEach((item) => {
      if (item.$id == selectedClass) {
        className = item.class;
        return;
      }
    });

    let yearName;
    branchDetails.years.forEach((item) => {
      if (item.$id == selectedYear) {
        yearName = item.year;
        return;
      }
    });
    return { class: className, year: yearName };
  };
  const handleShare = async () => {
    const classAndYear = getYearAndClass();
    const doc = new jsPDF();
    const formattedDate = new Date().toLocaleDateString();

    // Add title
    addTitle(doc, "Timetable");

    const weekRangeText = `Class ${classAndYear.class}, ${classAndYear.year} Batch`;
    doc.setFont("Helvetica", "normal");
    doc.text(weekRangeText, 14, 30); // Adjust position as needed

    let yOffset = 40; // Set the starting yOffset for timetable content

    // Add content (Timetable)
    for (const day of Object.keys(timetableData)) {
      yOffset = addDaySection(doc, day, timetableData[day], yOffset);
    }

    // Save PDF
    doc.save(`Timetable_${formattedDate}.pdf`);
  };

  const addTitle = (doc, title) => {
    doc.setFont("Helvetica", "bold");
    doc.text(title, 14, 20);
  };

  const addDaySection = (doc, day, entries, startY) => {
    let yOffset = startY;
    doc.setFont("Helvetica", "normal");
    doc.text(day, 14, yOffset);
    yOffset += 10;

    if (!entries.length) {
      doc.text("No classes scheduled for today.", 20, yOffset);
      yOffset += 10;
    } else {
      for (const entry of entries) {
        const text = `${entry.startTime} - ${entry.endTime}: ${entry.subject} (Teacher: ${entry.professor})`;
        doc.text(text, 20, yOffset);
        yOffset += 10;
      }
    }

    return yOffset + 10; // space after the day's section
  };

  const handleCreateTimetableEntry = async (day, startTime, endTime) => {
    setInitialData({ startTime: startTime, endTime: endTime, day });
    setOpenForm(true);
  };
  const handleSave = async (data, isEdit) => {
    if (isEdit) {
      const day = data.day;
      delete data.day;
      try {
        const responseData = await updateTimetableEntry(editingId, data);

        setTimetableData((prev) => ({
          ...prev,
          [day]: prev[day].map((item) =>
            item.$id == editingId ? responseData : item
          ),
        }));
        toast.success("Class schedule Edited successfully.");
      } catch (error) {
        console.log(error);
        toast.error("Failed to Edit class schedule, try again later.");
      }
    } else {
      const day = data.day;
      delete data.day;
      const newData = {
        branchId: branchDetails.$id,
        classId: selectedClass,
        yearId: selectedYear,
        ...data,
      };
      try {
        const responseData = await createTimetableEntry(newData);
        setTimetableData((prev) => ({
          ...prev,
          [day]: [...(prev[day] || []), responseData],
        }));
        toast.success("Class added successfully.");
      } catch (error) {
        console.log(error);
        toast.error("Failed to add class, try again later.");
      }
    }
    setEditingId(null);
    setInitialData(null);
  };
  const onEdit = async (itemId, day) => {
    setEditingId(itemId);

    for (const key in timetableData) {
      const found = timetableData[key].find(
        (item) => item.id === itemId || item.$id === itemId
      );
      if (found) {
        const newData = {
          ...found,
          day: new Date(found.date).toLocaleDateString("en-US", {
            weekday: "long",
          }),
        };
        setInitialData(newData);
        break;
      }
    }
  };
  const onDelete = (itemId) => {
    confirmDialog({
      message: "Are you sure you want to delete this class schedule?",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Yes",
      rejectLabel: "No",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteTimetableEntry(itemId);
          toast.success("Class schedule deleted successfully.");
          fetchTimetable();
        } catch (error) {
          console.log(error);
          toast.error("Failed to delete class schedule, try again later");
        }
      },
      reject: () => {
        toast("Delete action cancelled");
      },
    });
  };
  return (
    <div className="">
      <div className="">
        <TableSearch
          onDateChange={handleDateChange}
          onShare={handleShare}
          weekRange={weekRange}
          onAddClass={setOpenForm}
        />
        <TimeTable
          timetableData={timetableData}
          onCreateTimetableEntry={handleCreateTimetableEntry}
          loading={loading}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        {openForm && (
          <ClassFormModal
            weekRange={weekRange}
            onSave={handleSave}
            initialData={initialData}
            onClose={setOpenForm}
            timetableData={timetableData}
          />
        )}
        <ConfirmDialog />
      </div>
    </div>
  );
}
export default function WrappedPage() {
  return <ProtectedRoute Component={TimetablePage} />;
}
