"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import AttendanceSearch from "../components/AttendanceSearch";
import Pagination from "../components/Pagination";
import { format, addDays, subDays } from "date-fns";
import {
  getListOfStudents,
  getAttendanceForDate,
  markAttendance,
  deleteAttendance,
} from "../lib/appwrite";
import { toast } from "react-hot-toast";
import { useUserContext } from "@/context/GlobalContext";
import Loading from "@/components/atomic/loading/Loading";
import { AttendanceTable } from "@/components/AttendanceTable";
import { useStudents } from "@/hooks/useStudents";
import { jsPDF } from "jspdf";
import ProtectedRoute from "@/components/middleware/ProtectedRouter";
 function AttendancePage() {
  const {
    studentLoading,
    selectedYear,
    selectedClass,
    centerStudents,
    branchDetails,
  } = useUserContext();
  const [filteredData, setFilteredData] = useState();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const formattedDateForAppWrite = format(selectedDate, "yyyy-MM-dd");
  const formattedDateDisplay = format(selectedDate, "dd-MM-yyyy, eee");
  const [attendanceLoading, setAttendanceLoading] = useState(new Set());
  useEffect(() => {
    if (centerStudents && centerStudents!=null) {
      console.log("enter to fetch attendance", centerStudents, selectedDate);
      setAttendanceRecords([]);
      setLoading(true);
      fetchAttendanceData();
    }
  }, [centerStudents, selectedDate]);
  const fetchAttendanceData = async () => {
    setSearchTerm("");
    try {
      const data = await getAttendanceForDate(
        branchDetails.$id,
        selectedClass,
        selectedYear,
        formattedDateForAppWrite
      );
      combineStudentAndAttendance(data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch attendance, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const combineStudentAndAttendance = (data) => {
    const attendanceStudentIds = {};
    data.forEach((item) => {
      attendanceStudentIds[item.studentId] = item.$id;
    });
    const AttendanceData = centerStudents.map((item) => {
      return item.$id in attendanceStudentIds
        ? {
            ...item,
            attendance: true,
            attendanceId: attendanceStudentIds[item.$id],
          }
        : { ...item, attendance: false };
    });
    setAttendanceRecords(AttendanceData);
  };
  const handlePrevDate = () => {
    setSelectedDate((prevDate) => subDays(prevDate, 1));
  };

  const handleNextDate = () => {
    setSelectedDate((prevDate) => addDays(prevDate, 1));
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
  const handleSharePDF = () => {
    const classAndYear = getYearAndClass();
    const doc = new jsPDF();

    const formattedDate = format(selectedDate, "dd-MM-yyyy, eee");

    // Add title
    doc.setFont("Helvetica", "bold");
    doc.text(`Attendance for ${formattedDate}`, 14, 20);

    const weekRangeText = `Class ${classAndYear.class}, ${classAndYear.year} Batch`;
    doc.setFont("Helvetica", "bold");
    doc.text(weekRangeText, 14, 30); // Adjust position as needed

    // Set the starting Y offset for the list of students
    let yOffset = 40;

    // Loop through the filtered attendance data
    if (filteredData && filteredData.length > 0) {
      filteredData.forEach((student) => {
        // Add each student's attendance status
        const status = student.attendance ? "Present" : "Absent";
        const attendanceEntry = `${student.name}: ${status}`;

        // Dynamic text positioning and alignment (left-aligned)
        doc.setFont("Helvetica", "normal");
        doc.text(attendanceEntry, 14, yOffset);

        // Adjust the yOffset for the next entry
        yOffset += 10;
      });
    } else {
      // If no data, show a message
      doc.setFont("Helvetica", "normal");
      doc.text("No attendance data available.", 14, yOffset);
    }

    // Save the PDF
    const formattedFileDate = format(selectedDate, "yyyy-MM-dd");
    doc.save(`Attendance_${formattedFileDate}.pdf`);
  };
  const handleAttendanceToggle = async (id, attendance) => {
    setAttendanceLoading((prev) => new Set(prev).add(id));
    if (attendance) {
      try {
        const data = await markAttendance(
          branchDetails.$id,
          selectedClass,
          selectedYear,
          id,
          formattedDateForAppWrite
        );
        setAttendanceRecords((prev) =>
          prev.map((item) =>
            item.$id == id
              ? { ...item, attendance: true, attendanceId: data.$id }
              : item
          )
        );
        toast.success("Marked attendance successfully");
      } catch (error) {
        toast.error("Failed to mark attendance, try again later");
      } finally {
        setAttendanceLoading((prev) => {
          const updated = new Set(prev);
          updated.delete(id);
          return updated;
        });
      }
    } else {
      try {
        await deleteAttendance(id);
        setAttendanceRecords((prev) =>
          prev.map((item) =>
            item.attendanceId == id
              ? { ...item, attendance: false, attendanceId: null }
              : item
          )
        );
        toast.success("Marked Absent successfully");
      } catch (error) {
        toast.error("Failed to mark absent, try again later");
      } finally {
        setAttendanceLoading((prev) => {
          const updated = new Set(prev);
          updated.delete(id);
          return updated;
        });
      }
    }
  };

  useEffect(() => {
    if (attendanceRecords) {
      setFilteredData(
        attendanceRecords.filter((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, attendanceRecords]);
  useEffect(() => {
    setSearchTerm("");
  }, [selectedClass, selectedYear, selectedDate]);

  return (
    <div>
      <AttendanceSearch
        date={formattedDateDisplay}
        onPrevDate={handlePrevDate}
        onNextDate={handleNextDate}
        onSharePDF={handleSharePDF}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
      <AttendanceTable
        onAttendance={handleAttendanceToggle}
        attendanceData={filteredData}
        loading={loading || studentLoading}
        attendanceLoading={attendanceLoading}
      />
    </div>
  );
}
export default function WrappedPage() {
  return <ProtectedRoute Component={AttendancePage} />;
}