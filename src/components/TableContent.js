import React, { useMemo } from "react";
import Loading from "./atomic/loading/Loading";
import { FaEdit, FaTrash } from "react-icons/fa";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Converts HH:mm to minutes
const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
};

// Converts minutes to HH:mm
const minutesToTime = (min) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const TimeTable = ({
  timetableData,
  onCreateTimetableEntry,
  loading,
  onEdit,
  onDelete,
}) => {
  const { timeSlots, minTime, maxTime } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    for (const day of days) {
      const entries = timetableData[day] || [];
      for (const entry of entries) {
        min = Math.min(min, timeToMinutes(entry.startTime));
        max = Math.max(max, timeToMinutes(entry.endTime));
      }
    }

    const slots = [];
    for (let t = min; t < max; t += 30) {
      slots.push([t, t + 30]);
    }

    return { timeSlots: slots, minTime: min, maxTime: max };
  }, [timetableData]);

  const renderCell = (day, slotStart) => {
    const classes = timetableData[day] || [];
    const entry = classes.find(
      (item) =>
        timeToMinutes(item.startTime) <= slotStart &&
        timeToMinutes(item.endTime) > slotStart
    );

    if (entry && timeToMinutes(entry.startTime) === slotStart) {
      const duration =
        (timeToMinutes(entry.endTime) - timeToMinutes(entry.startTime)) / 30;

      const handleEdit = () => onEdit(entry.$id, day);
      const handleDelete = () => onDelete(entry.$id);

      return (
        <td
          rowSpan={duration}
          className="border border-gray-300 bg-purple-100 px-2 py-1 align-top text-sm relative timetable-container"
          key={`${day}-${slotStart}`}
        >
          <div className="font-semibold text-purple-800">
            {entry.startTime} - {entry.endTime}
          </div>
          <div className="text-black">{entry.subject}</div>
          <div className="text-gray-600 text-xs">{entry.professor}</div>
          <div className="absolute top-1 right-1 flex gap-2">
            <FaEdit
              className="text-blue-600 cursor-pointer"
              onClick={handleEdit}
              title="Edit"
            />
            <FaTrash
              className="text-red-500 cursor-pointer"
              onClick={handleDelete}
              title="Delete"
            />
          </div>
        </td>
      );
    }

    const isCovered = classes.some(
      (item) =>
        timeToMinutes(item.startTime) < slotStart &&
        timeToMinutes(item.endTime) > slotStart
    );
    if (isCovered) return null;

    return (
      <td
        key={`${day}-${slotStart}`}
        className="border border-gray-300 hover:bg-gray-100 cursor-pointer text-center text-gray-400"
        onClick={() =>
          onCreateTimetableEntry(
            day,
            minutesToTime(slotStart),
            minutesToTime(slotStart + 30)
          )
        }
      >
        +
      </td>
    );
  };

  return (
    <div className="overflow-x-auto mt-4 rounded-lg border border-gray-300">
      <table className="w-full min-w-[1050px] text-sm text-left table-fixed">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-[100px] px-2 py-2 border border-gray-300">Time</th>
            {days.map((day) => (
              <th key={day} className="px-2 py-2 border border-gray-300">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map(([start, end]) => (
            <tr key={start}>
              <td className="border border-gray-300 px-2 py-1 text-gray-600">
                {minutesToTime(start)} - {minutesToTime(end)}
              </td>
              {days.map((day) => renderCell(day, start))}
            </tr>
          ))}
        </tbody>
      </table>
      {!loading &&
        Object.values(timetableData).every((arr) => arr.length === 0) && (
          <div className="text-center py-4 text-gray-500">
            No data available
          </div>
        )}
      {loading && <Loading />}
    </div>
  );
};

export default TimeTable;
