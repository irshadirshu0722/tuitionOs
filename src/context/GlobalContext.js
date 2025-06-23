import { getCenterStudents } from "@/lib/appwrite";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import toast from "react-hot-toast";

const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
  const [centerDetails, setCenterDetails] = useState(null);
  const [branchDetails, setBranchDetails] = useState(null);
  const [centerStudents, setCenterStudents] = useState(undefined);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [studentLoading, setStudentLoading] = useState(true);

  useEffect(() => {
    setYearClassStudent();
  }, [branchDetails]);
  const setYearClassStudent = () => {
    if (branchDetails) {
      setSelectedClass(branchDetails.classes[0].$id);
      setSelectedYear(branchDetails.years[0].$id);
      console.log(branchDetails.students);
    }
  };
  useEffect(() => {
    if (selectedClass && selectedYear && branchDetails) {
      fetchStudents(branchDetails.$id, selectedClass, selectedYear);
    }
  }, [selectedClass, selectedYear, branchDetails]);
  const fetchStudents = async (centerId, classId, yearId) => {
    setCenterStudents(null);
    setStudentLoading(true);
    try {
      console.log("fetching students");
      const data = await getCenterStudents(centerId, classId, yearId);
      setCenterStudents(data);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch students, try again later");
      return new Error();
    } finally {
      setStudentLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        centerDetails,
        setCenterDetails,
        centerStudents,
        setCenterStudents,
        selectedYear,
        setSelectedYear,
        selectedClass,
        setSelectedClass,
        setUser,
        user,
        branchDetails,
        setBranchDetails,
        role,
        setRole,
        studentLoading,
        setStudentLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
