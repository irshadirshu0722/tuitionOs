import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import {
  databases,
  getStudentTimetableByWeek,
  checkHaveClass,
  getAttendanceForDate,
  getStudentAttendanceSummary,
  getStudentById,
  getAttendanceByStudentId,
  getFeesByStudentId,
  getExamResultsByStudentId,
  getExamsForStudent,
  getTimetableForStudent,
  getClassById,
  getYearById,
} from "@/lib/appwrite";
import Loading from "@/components/atomic/loading/Loading";
import toast from "react-hot-toast";
import {
  UserIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { format, parseISO } from "date-fns";
import { Query } from "appwrite";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { useUserContext } from "@/context/GlobalContext";
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const studentsCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_STUDENTS_COLLECTION_ID;
const attendanceCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_ATTENDANCE_COLLECTION_ID;
const feesPaymentCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_FEES_PAYMENT_COLLECTION_ID;
const examResultCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_EXAM_RESULT_COLLECTION_ID;
const examCollectionId = process.env.NEXT_PUBLIC_APPWRITE_EXAM_COLLECTION_ID;
const timetableCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_TIMETABLE_COLLECTION_ID;

const sectionList = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "attendance", label: "Attendance", icon: CalendarDaysIcon },
  { id: "fees", label: "Fees", icon: BanknotesIcon },
  { id: "exams", label: "Exams", icon: AcademicCapIcon },
  { id: "timetable", label: "Timetable", icon: ClockIcon },
];

export default function ParentStudentView() {
  const router = useRouter();
  const { id } = router.query;
  const { branchDetails } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [allAttendanceRecords, setAllAttendanceRecords] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({
    totalAttendance: 0,
    totalPresent: 0,
    totalAbsent: 0,
  });
  const [attendanceDate, setAttendanceDate] = useState("");
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [fees, setFees] = useState([]);
  const [exams, setExams] = useState([]);
  const [examResults, setExamResults] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const sectionRefs = useRef({});
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekRange, setWeekRange] = useState(() => getWeekRange(0));
  const [timetableData, setTimetableData] = useState({});
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [attendanceStatusForDate, setAttendanceStatusForDate] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [classObj, setClassObj] = useState(null);
  const [yearObj, setYearObj] = useState(null);

  // Helper: get week range (Monday-Sunday)
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
      startDate: monday,
      endDate: sunday,
    };
  }

  // Group timetable data by weekday
  function groupTimeTableData(weekData) {
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
      const dayIndex = date.getDay();
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
  }

  // Fetch timetable for the week
  useEffect(() => {
    if (!student) return;
    setTimetableLoading(true);
    const fetchTimetable = async () => {
      try {
        const timetableDocs = await getStudentTimetableByWeek(
          student.classId,
          student.yearId,
          student.branchId,
          weekRange.startDate.toISOString(),
          weekRange.endDate.toISOString()
        );
        setTimetableData(groupTimeTableData(timetableDocs));
      } catch (err) {
        toast.error("Failed to fetch timetable");
        setTimetableData({});
      } finally {
        setTimetableLoading(false);
      }
    };
    fetchTimetable();
  }, [student, weekRange]);

  // Week navigation handlers
  const handleWeekChange = (isNext) => {
    const newOffset = isNext ? weekOffset + 1 : weekOffset - 1;
    setWeekOffset(newOffset);
    setWeekRange(getWeekRange(newOffset));
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const fetchAll = async () => {
      try {
        const studentDoc = await getStudentById(id);
        setStudent(studentDoc);

        const filteredAttendance = await getAttendanceByStudentId(id);
        setAttendance(filteredAttendance);

        const filteredFees = await getFeesByStudentId(id);
        setFees(filteredFees);

        const filteredExamResults = await getExamResultsByStudentId(id);
        console.log(filteredExamResults);
        setExamResults(filteredExamResults);

        const filteredExams = await getExamsForStudent(studentDoc);
        console.log(filteredExams);
        setExams(filteredExams);

        const filteredTimetable = await getTimetableForStudent(studentDoc);
        setTimetable(filteredTimetable);
      } catch (err) {
        toast.error("Failed to fetch student data");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  // Fetch attendance summary using appwrite.js function
  useEffect(() => {
    if (!student) return;
    getStudentAttendanceSummary(
      student.branchId,
      student.classId,
      student.yearId,
      student.$id
    )
      .then(setAttendanceSummary)
      .catch(() =>
        setAttendanceSummary({
          totalAttendance: 0,
          totalPresent: 0,
          totalAbsent: 0,
        })
      );
  }, [student]);

  // Attendance filter by date
  useEffect(() => {
    if (!attendanceDate) {
      setAttendanceStatusForDate(null);
      setFilteredAttendance(attendance);
      return;
    }
    if (!student) return;
    setAttendanceLoading(true);
    checkHaveClass(
      student.branchId,
      student.classId,
      student.yearId,
      attendanceDate,
      student.$id
    )
      .then(({ hadClass, present }) => {
        if (!hadClass) setAttendanceStatusForDate("noclass");
        else setAttendanceStatusForDate(present ? "present" : "absent");
      })
      .catch(() => setAttendanceStatusForDate("noclass"))
      .finally(() => setAttendanceLoading(false));
  }, [attendanceDate, student]);

  useEffect(() => {
    if (student && student.classId) {
      getClassById(student.classId)
        .then(setClassObj)
        .catch(() => setClassObj(null));
    }
    if (student && student.yearId) {
      getYearById(student.yearId)
        .then(setYearObj)
        .catch(() => setYearObj(null));
    }
  }, [student]);

  const scrollToSection = (sectionId) => {
    sectionRefs.current[sectionId]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (loading) return <Loading />;
  if (!student)
    return <div className="text-center py-10">Student not found.</div>;

  // Helper for empty state
  const EmptyState = ({ icon: Icon, text }) => (
    <div className="flex flex-col items-center justify-center py-8 text-gray-400">
      <Icon className="w-12 h-12 mb-2" />
      <span>{text}</span>
    </div>
  );

  // Helper for avatar
  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
      : "S";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 pb-16 font-sans">
      {/* Hero Banner */}
      <div className="relative w-full h-40 sm:h-56 bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center mb-[-10px] sm:mb-[-72\px] rounded-b-3xl shadow-lg">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg tracking-wide">
          Student Dashboard
        </h1>
      </div>
      {/* Sticky Section Nav */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b-2 border-indigo-100 shadow-lg flex gap-2 sm:gap-3 px-2 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-10 mt-0 rounded-b-2xl overflow-x-auto whitespace-nowrap">
        {sectionList.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full hover:bg-indigo-50 text-base font-bold text-indigo-700 transition-all shadow-sm hover:scale-105 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-indigo-200 whitespace-nowrap"
          >
            <Icon className="w-6 h-6 mr-1 text-indigo-500" /> {label}
          </button>
        ))}
      </nav>

      <div className="max-w-3xl mx-auto px-2 sm:px-6 max-sm:pt-10">
        {/* Profile Card with Banner */}
        <section
          ref={(el) => (sectionRefs.current["profile"] = el)}
          id="profile"
        >
          <div className="relative bg-white rounded-3xl shadow-2xl p-4 sm:p-8 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mb-8 sm:mb-12 mt-0 border border-purple-100">
            {/* Avatar with border and shadow */}
            <div className="flex-shrink-0 relative mb-4 sm:mb-0">
              <div className="bg-gradient-to-br from-purple-400 to-blue-400 rounded-full w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center text-white text-3xl sm:text-4xl font-extrabold shadow-lg border-4 border-white -mt-16 sm:mt-0">
                {getInitials(student.name)}
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 flex items-center gap-2 text-gray-800 justify-center sm:justify-start">
                <UserIcon className="w-6 h-6 sm:w-7 sm:h-7 text-purple-500" />{" "}
                {student.name}
              </h2>
              <div className="mb-2 text-gray-700 text-base sm:text-lg">
                <b>Phone:</b> {student.phone}
              </div>
              <div className="mb-2 text-gray-700 text-base sm:text-lg">
                <b>Address:</b> {student.address}
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 justify-center sm:justify-start">
                <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold text-sm shadow">
                  Class:{" "}
                  {classObj ? classObj.class || classObj.name : student.classId}
                </span>
                <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold text-sm shadow">
                  Year:{" "}
                  {yearObj ? yearObj.year || yearObj.name : student.yearId}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Cards & Graphs */}
        <section className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {/* Attendance Card */}
            <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl shadow-lg p-6 flex flex-col items-center">
              <span className="text-3xl font-bold text-blue-700 mb-1">
                {attendanceSummary.totalAttendance}
              </span>
              <span className="text-lg font-semibold text-blue-800">
                Total Classes
              </span>
            </div>
            {/* Fees Card */}
            <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl shadow-lg p-6 flex flex-col items-center">
              <span className="text-3xl font-bold text-green-700 mb-1">
                ₹{fees.reduce((sum, fee) => sum + fee.amount, 0).toFixed(2)}
              </span>
              <span className="text-lg font-semibold text-green-800">
                Total Fees Paid
              </span>
            </div>
            {/* Present Card */}
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl shadow-lg p-6 flex flex-col items-center">
              <span className="text-3xl font-bold text-purple-700 mb-1">
                {attendanceSummary.totalPresent}
              </span>
              <span className="text-lg font-semibold text-purple-800">
                Total Present
              </span>
            </div>
            {/* Absent Card */}
            <div className="bg-gradient-to-br from-red-100 to-red-50 rounded-2xl shadow-lg p-6 flex flex-col items-center">
              <span className="text-3xl font-bold text-red-700 mb-1">
                {attendanceSummary.totalAbsent}
              </span>
              <span className="text-lg font-semibold text-red-800">
                Total Absent
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Attendance Pie Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col items-center justify-center w-full">
              <h3 className="text-lg font-bold mb-4 text-blue-700">
                Attendance Overview
              </h3>
              <div className="w-40 sm:w-60 mx-auto">
                <Pie
                  data={{
                    labels: ["Present", "Absent"],
                    datasets: [
                      {
                        data: [
                          attendanceSummary.totalPresent,
                          attendanceSummary.totalAbsent,
                        ],
                        backgroundColor: ["#6366f1", "#f87171"],
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      legend: { display: true, position: "bottom" },
                    },
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>
            {/* Exam Scores Bar Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col items-center justify-center w-full">
              <h3 className="text-lg font-bold mb-4 text-purple-700">
                Exam Scores
              </h3>
              <Bar
                data={{
                  labels: exams.map((exam) => exam.subject || "-"),
                  datasets: [
                    {
                      label: "Score",
                      data: exams.map((exam) => {
                        const result = examResults.find(
                          (er) => er.exam.$id === exam.$id
                        );
                        return result &&
                          result.score !== undefined &&
                          result.score !== null
                          ? result.score
                          : 0;
                      }),
                      backgroundColor: "#a78bfa",
                    },
                    {
                      label: "Total",
                      data: exams.map((exam) => exam.totalScore || 100),
                      backgroundColor: "#e0e7ff",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: true, position: "bottom" },
                    title: { display: false },
                  },
                  scales: {
                    y: { beginAtZero: true },
                  },
                }}
              />
            </div>
          </div>
        </section>

        {/* Attendance Section */}
        <section
          ref={(el) => (sectionRefs.current["attendance"] = el)}
          id="attendance"
        >
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <CalendarDaysIcon className="w-6 h-6 text-blue-500" /> Attendance
            </h2>
            {/* Attendance summary */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg px-4 py-2 text-blue-700 font-semibold">
                Total Classes: {attendanceSummary.totalAttendance}
              </div>
              <div className="bg-green-50 rounded-lg px-4 py-2 text-green-700 font-semibold">
                Total Present: {attendanceSummary.totalPresent}
              </div>
              <div className="bg-red-50 rounded-lg px-4 py-2 text-red-700 font-semibold">
                Total Absent: {attendanceSummary.totalAbsent}
              </div>
            </div>
            {/* Date picker for specific day */}
            <div className="mb-4 flex items-center gap-2">
              <label
                htmlFor="attendance-date"
                className="text-sm font-medium text-gray-700"
              >
                Check by date:
              </label>
              <input
                id="attendance-date"
                type="date"
                className="border rounded px-2 py-1 text-sm"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                max={
                  attendance.length > 0
                    ? attendance.reduce(
                        (max, a) => (a.date > max ? a.date : max),
                        attendance[0].date
                      )
                    : ""
                }
              />
              {attendanceDate && (
                <button
                  className="ml-2 text-xs text-gray-500 hover:text-gray-700 underline"
                  onClick={() => setAttendanceDate("")}
                >
                  Clear
                </button>
              )}
            </div>
            {/* Only show result if a date is selected */}
            {attendanceDate &&
              (attendanceLoading ? (
                <div className="py-4">
                  <Loading />
                </div>
              ) : attendanceStatusForDate === "noclass" ? (
                <div className="py-4 text-center flex flex-col items-center">
                  <ExclamationCircleIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-gray-500 font-medium">
                    No class was held on this date.
                  </span>
                </div>
              ) : attendanceStatusForDate === "present" ? (
                <div className="py-4 text-center flex flex-col items-center">
                  <CheckCircleIcon className="w-10 h-10 text-green-500 mb-2" />
                  <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold text-lg shadow">
                    Present
                  </span>
                </div>
              ) : attendanceStatusForDate === "absent" ? (
                <div className="py-4 text-center flex flex-col items-center">
                  <XCircleIcon className="w-10 h-10 text-red-500 mb-2" />
                  <span className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold text-lg shadow">
                    Absent
                  </span>
                </div>
              ) : null)}
          </div>
        </section>

        {/* Fees Section */}
        <section ref={(el) => (sectionRefs.current["fees"] = el)} id="fees">
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BanknotesIcon className="w-6 h-6 text-green-500" /> Fees Payment
            </h2>
            {fees.length === 0 ? (
              <EmptyState
                icon={BanknotesIcon}
                text="No fee payment records found."
              />
            ) : (
              <div>
                <div className="mb-4 p-4 bg-green-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800">
                    Total Amount Paid
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{fees.reduce((sum, fee) => sum + fee.amount, 0).toFixed(2)}
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Payment History
                  </h3>
                  <table className="min-w-full text-sm border">
                    <thead className="bg-gray-50">
                      <tr className="bg-green-50">
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          Payment ID
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          Date
                        </th>
                        <th className="px-4 py-2 text-left font-medium text-gray-600">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {fees.map((f) => (
                        <tr key={f.$id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-700">{f.$id}</td>
                          <td className="px-4 py-2 text-gray-700">
                            {new Date(f.paidAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2 font-semibold text-gray-800">
                            ₹{f.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Exams Section */}
        <section ref={(el) => (sectionRefs.current["exams"] = el)} id="exams">
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <AcademicCapIcon className="w-6 h-6 text-purple-500" /> Exam
              Results
            </h2>
            {/* Overall Progress Bar */}
            {(() => {
              // Only count exams where the student has a result
              const examsWithResult = exams.filter((exam) =>
                examResults.find((er) => er.exam.$id === exam.$id)
              );
              const totalPossible = examsWithResult.reduce(
                (sum, exam) => sum + (exam.totalScore || 0),
                0
              );
              const totalScored = examsWithResult.reduce((sum, exam) => {
                const result = examResults.find(
                  (er) => er.exam.$id === exam.$id
                );
                return sum + (result ? result.score || 0 : 0);
              }, 0);
              const percent =
                totalPossible > 0
                  ? Math.round((totalScored / totalPossible) * 100)
                  : 0;
              return (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Overall Progress
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {totalScored} / {totalPossible}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-purple-500 h-4 rounded-full"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{percent}%</div>
                </div>
              );
            })()}
            {exams.length === 0 ? (
              <EmptyState icon={AcademicCapIcon} text="No exams found." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[400px] text-sm border">
                  <thead>
                    <tr className="bg-purple-50">
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Subject</th>
                      <th className="px-4 py-2 text-left">Score</th>
                      <th className="px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map((exam) => {
                      const result = examResults.find(
                        (er) => er.exam.$id === exam.$id
                      );
                      const hasScore =
                        result &&
                        result.score !== null &&
                        result.score !== undefined &&
                        result.score !== "";
                      const score = hasScore ? result.score : null;
                      const total = exam.totalScore || 100;
                      const minScore =
                        exam.minScore !== undefined ? exam.minScore : 0;
                      let statusLabel, statusClass;
                      if (!hasScore) {
                        statusLabel = "Not Added";
                        statusClass = "bg-gray-100 text-gray-600";
                      } else if (score >= minScore) {
                        statusLabel = "Passed";
                        statusClass = "bg-green-100 text-green-700";
                      } else {
                        statusLabel = "Failed";
                        statusClass = "bg-red-100 text-red-700";
                      }
                      return (
                        <tr key={exam.$id} className="even:bg-purple-50">
                          <td className="px-4 py-2">
                            {exam.date
                              ? new Date(exam.date).toLocaleDateString()
                              : exam.datetime
                              ? new Date(exam.datetime).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-4 py-2">{exam.subject || "-"}</td>
                          <td className="px-4 py-2 font-semibold">
                            {hasScore ? `${score} / ${total}` : "-"}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-bold ${statusClass}`}
                            >
                              {statusLabel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Timetable Section */}
        <section
          ref={(el) => (sectionRefs.current["timetable"] = el)}
          id="timetable"
        >
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ClockIcon className="w-6 h-6 text-blue-400" /> Timetable
            </h2>
            {/* Week navigation */}
            <div className="flex items-center gap-2 mb-4">
              <button
                className="p-2 rounded-full border hover:bg-gray-100"
                onClick={() => handleWeekChange(false)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="px-4 py-2 border rounded-lg text-gray-700 font-semibold">
                {`${format(weekRange.startDate, "EEE MMM dd")} - ${format(
                  weekRange.endDate,
                  "EEE MMM dd"
                )}`}
              </div>
              <button
                className="p-2 rounded-full border hover:bg-gray-100"
                onClick={() => handleWeekChange(true)}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
            {timetableLoading ? (
              <Loading />
            ) : Object.values(timetableData).every(
                (arr) => arr.length === 0
              ) ? (
              <EmptyState
                icon={ClockIcon}
                text="No timetable found for this week."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm border">
                  <thead>
                    <tr className="bg-blue-50">
                      <th className="px-4 py-2 text-left">Day</th>
                      <th className="px-4 py-2 text-left">Subject</th>
                      <th className="px-4 py-2 text-left">Time</th>
                      <th className="px-4 py-2 text-left">Teacher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(timetableData).map(([day, entries]) =>
                      entries.map((tt, idx) => (
                        <tr key={tt.$id} className="even:bg-blue-50">
                          <td className="px-4 py-2">{idx === 0 ? day : ""}</td>
                          <td className="px-4 py-2">{tt.subject}</td>
                          <td className="px-4 py-2">
                            {tt.startTime} - {tt.endTime}
                          </td>
                          <td className="px-4 py-2">{tt.professor}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
