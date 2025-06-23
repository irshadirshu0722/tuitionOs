import { useUserContext } from "@/context/GlobalContext";
import { getCenterStudents } from "@/lib/appwrite";
import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

export const useStudents = (setEmptyFunction = ([]) => {}) => {
  const {
    centerStudents,
    setCenterStudents,
    selectedClass,
    selectedYear,
    branchDetails,
  } = useUserContext();
  const [studentLoading, setStudentLoading] = useState(false);
  const [isFetched, setIsFetched] = useState(false);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (centerStudents) {
      setIsFetched(true);
    }
  }, [centerStudents]);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (selectedClass && selectedYear && branchDetails) {
      setCenterStudents([]);
      fetchOrGetStudents(branchDetails.$id, selectedClass, selectedYear);
    }
  }, [selectedClass, selectedYear]);
  const fetchOrGetStudents = async (centerId, classId, yearId) => {
    console.log();
    setEmptyFunction([]);
    if (centerStudents) centerStudents;
    setStudentLoading(true);
    try {
      console.log("going to fetch user data");
      const data = await getCenterStudents(centerId, classId, yearId);
      setCenterStudents(data);
    } catch (error) {
      toast.error("Failed to fetch students, try again later");
    } finally {
      setStudentLoading(false);
    }
  };
  return {
    studentLoading,
    fetchOrGetStudents,
    setStudentLoading,
    isFetched,
  };
};
