// lib/appwrite.js
import { Client, Account, Databases, ID, Query } from "appwrite";

const client = new Client();
// Set the endpoint and project ID using environment variables
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT) // Replace with your Appwrite endpoint
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID); // Replace with your Appwrite Project ID

// Initialize Appwrite services
const account = new Account(client);
const databases = new Databases(client);

// Access collection IDs from environment variables
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const tuitionCentersCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_TUITION_CENTERS_COLLECTION_ID;
const classesCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_CLASSES_COLLECTION_ID;
const yearCollectionId = process.env.NEXT_PUBLIC_APPWRITE_YEAR_COLLECTION_ID;
const studentsCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_STUDENTS_COLLECTION_ID;
const feesPaymentCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_FEES_PAYMENT_COLLECTION_ID;
const timetableCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_TIMETABLE_COLLECTION_ID;
const attendanceCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_ATTENDANCE_COLLECTION_ID;
const staffCollectionId = process.env.NEXT_PUBLIC_APPWRITE_STAFF_COLLECTION_ID;
const branchCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_BRANCH_COLLECTION_ID;
const registerCodeCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_REGISTER_CODE_COLLECTION_ID;
const examCollectionId = process.env.NEXT_PUBLIC_APPWRITE_EXAM_COLLECTION_ID;
const examResultCollectionId =
  process.env.NEXT_PUBLIC_APPWRITE_EXAM_RESULT_COLLECTION_ID;

export const getStaffDetails = async (userId) => {
  const staffs = await databases.listDocuments(databaseId, staffCollectionId, [
    Query.equal("userId", userId),
    Query.limit(1),
  ]);
  if (staffs.documents.length == 0) {
    throw Error("staff not exist");
  }
  return staffs.documents[0];
};

export const getBranchDetails = async (id) => {
  const branch = await databases.listDocuments(databaseId, branchCollectionId, [
    Query.equal("$id", id),
    Query.limit(1),
  ]);
  if (branch.documents.length == 0) {
    throw Error("staff not exist");
  }
  return branch.documents[0];
};
async function getListOfTuitionCenters(centerId, queries) {
  const center = await databases.listDocuments(
    databaseId,
    tuitionCentersCollectionId
  );
  return center.documents;
}

export const createStaffAccount = async (data) => {
  const userInfo = await account.create(ID.unique(), data.email, data.password);
  return await databases.createDocument(
    databaseId,
    staffCollectionId,
    ID.unique(),
    {
      userId: userInfo.$id,
      tuitionCenter: data.tuitionCenter,
      branch: data.branch,
      email: data.email,
    }
  );
};
async function createTuitionCenter(data) {
  await databases.createDocument(
    databaseId,
    tuitionCentersCollectionId,
    ID.unique(),
    data
  );
}
export async function GetTuitionCenter(userId) {
  const tuitionCenters = await databases.listDocuments(
    databaseId,
    tuitionCentersCollectionId,
    [Query.equal("userId", userId), Query.limit(1)]
  );
  if (tuitionCenters.documents.length == 0) {
    throw Error();
  }
  return tuitionCenters.documents[0];
}
export async function createTuitionBranch(data) {
  const yearCollectionIds = await Promise.all(
    data.years.map(async (item) => (await createOrGetYear(item)).$id)
  );
  const classCollectionIds = await Promise.all(
    data.classes.map(async (item)=>(await createOrGetClass(item)).$id)
  )
  return await databases.createDocument(
    databaseId,
    branchCollectionId,
    ID.unique(),
    {
      name: data.name,
      classes: classCollectionIds,
      years: yearCollectionIds,
      tuitionCenter: data.tuitionCenter,
    }
  );
}
const getAllYears = async ()=>{
  const years = await databases.listDocuments(databaseId, yearCollectionId);
  return years.documents;
}
const getAllClasses = async()=>{
  const classes = await databases.listDocuments(databaseId, classesCollectionId);
  return classes.documents;
}

export async function deleteTuitionBranch(id) {
  await databases.deleteDocument(databaseId, branchCollectionId, id);
}
const createOrGetYear = async (year) => {
  const yearDoc = await databases.listDocuments(databaseId, yearCollectionId, [
    Query.equal("year", year),
  ]);
  if (yearDoc.documents.length == 0) {
    return await databases.createDocument(
      databaseId,
      yearCollectionId,
      ID.unique(),
      { year: year }
    );
  }
  return yearDoc.documents[0];
};
const createOrGetClass = async (className) => {
  const classDoc = await databases.listDocuments(databaseId, classesCollectionId, [
    Query.equal("class", className),
  ]);
  if (classDoc.documents.length == 0) {
    return await databases.createDocument(
      databaseId,
      classesCollectionId,
      ID.unique(),
      { class: className }
    );
  }
  return classDoc.documents[0];
};
export const updateTuitionCenterBranch = async (itemId, data) => {
  const classIds = data.classes.map((cls) => (cls.$id ? cls.$id : null));
  const newClassNames = data.classes
    .filter((cls) => !cls.$id)
    .map((cls) => cls.class);

  const newClassDocs = newClassNames.length
    ? await databases.listDocuments(databaseId, classesCollectionId, [
        Query.equal("class", newClassNames),
      ])
    : { documents: [] };

  const newClassIds = newClassDocs.documents.map((doc) => doc.$id);
  const allClassIds = [...classIds.filter(Boolean), ...newClassIds];

  const yearStrings = data.years.map((y) => (y.year ? y.year : y));
  const yearDocs = await databases.listDocuments(databaseId, yearCollectionId, [
    Query.equal("year", yearStrings),
  ]);
  const existingYearsMap = new Map(
    yearDocs.documents.map((doc) => [doc.year, doc.$id])
  );

  const missingYears = yearStrings.filter(
    (year) => !existingYearsMap.has(year)
  );
  const newYearDocs = await Promise.all(
    missingYears.map((year) =>
      databases
        .createDocument(databaseId, yearCollectionId, ID.unique(), { year })
        .then((doc) => ({ year, $id: doc.$id }))
    )
  );

  newYearDocs.forEach((doc) => existingYearsMap.set(doc.year, doc.$id));
  const allYearIds = yearStrings.map((year) => existingYearsMap.get(year));

  return await databases.updateDocument(
    databaseId,
    branchCollectionId,
    itemId,
    {
      name: data.name,
      classes: allClassIds,
      years: allYearIds,
    }
  );
};

async function deleteTuitionCenter(centerId) {
  const center = await databases.deleteDocument(
    databaseId,
    tuitionCentersCollectionId,
    centerId
  );
  return center.documents;
}

export const getCenterData = async (centerId) => {
  const data = await databases.getDocument(
    databaseId,
    tuitionCentersCollectionId,
    centerId
  );
  return data;
};

async function getListOfClasses(centerId, classId, queries) {
  try {
    if (!centerId) throw new Error("Center ID is required to fetch classes.");

    const queryList = queries
      ? [...queries, Query.equal("centerId", centerId)]
      : [Query.equal("centerId", centerId)];

    if (classId) {
      const cls = await databases.getDocument(
        databaseId,
        classesCollectionId,
        classId
      );
      return cls;
    } else {
      const response = await databases.listDocuments(
        databaseId,
        classesCollectionId,
        queryList
      );
      return response.documents;
    }
  } catch (error) {
    console.error("Appwrite service :: getListOfClasses() :: ", error);
    throw error;
  }
}

async function createClass(centerId, className, rest = {}) {
  try {
    const data = { name: className, centerId: centerId, ...rest };
    const newClass = await databases.createDocument(
      databaseId,
      classesCollectionId,
      ID.unique(),
      data
    );
    return newClass;
  } catch (error) {
    console.error("Appwrite service :: createClass() :: ", error);
    throw error;
  }
}

async function deleteClass(classId) {
  try {
    await databases.deleteDocument(databaseId, classesCollectionId, classId);
  } catch (error) {
    console.error("Appwrite service :: deleteClass() :: ", error);
    throw error;
  }
}

export async function getCenterStudents(centerId, classId, yearId) {
  const response = await databases.listDocuments(
    databaseId,
    studentsCollectionId,
    [
      Query.orderDesc("$createdAt"),
      Query.equal("branchId", centerId),
      Query.equal("classId", classId),
      Query.equal("yearId", yearId),
    ]
  );
  return response.documents || [];
}

async function createStudent(data) {
  const response = await databases.createDocument(
    databaseId,
    studentsCollectionId,
    ID.unique(),
    data
  );
  return response;
}

async function updateStudent(studentId, studentData) {
  const updatedStudent = await databases.updateDocument(
    databaseId,
    studentsCollectionId,
    studentId,
    studentData
  );
  return updatedStudent;
}

async function deleteStudent(studentId) {
  await databases.deleteDocument(databaseId, studentsCollectionId, studentId);
}

async function getAttendanceForDate(centerId, classId, yearId, date) {
  const queries = [
    Query.equal("branchId", centerId),
    Query.equal("classId", classId),
    Query.equal("date", date),
    Query.equal("yearId", yearId),
  ];
  const response = await databases.listDocuments(
    databaseId,
    attendanceCollectionId,
    queries
  );
  return response.documents;
}

async function markAttendance(centerId, classId, yearId, studentId, date) {
  const response = await databases.createDocument(
    databaseId,
    attendanceCollectionId,
    ID.unique(),
    {
      branchId: centerId,
      yearId: yearId,
      classId: classId,
      studentId: studentId,
      date: date,
    }
  );
  return response;
}

async function deleteAttendance(attendanceId) {
  await databases.deleteDocument(
    databaseId,
    attendanceCollectionId,
    attendanceId
  );
}

async function getPaymentForDay(centerId, classId, yearId, date) {
  const response = await databases.listDocuments(
    databaseId,
    feesPaymentCollectionId,
    [
      Query.equal("branchId", centerId),
      Query.equal("classId", classId),
      Query.equal("yearId", yearId),
      Query.equal("feesMonth", date),
    ]
  );
  return response.documents;
}

async function createFeesPayment(centerId, classId, yearId, studentId, data) {
  const response = await databases.createDocument(
    databaseId,
    feesPaymentCollectionId,
    ID.unique(),
    {
      branchId: centerId,
      yearId: yearId,
      classId: classId,
      studentId,
      student: studentId,
      ...data,
    }
  );
  return response;
}

async function updateFeesPayment(paymentId, data) {
  const response = await databases.updateDocument(
    databaseId,
    feesPaymentCollectionId,
    paymentId,
    data
  );
  return response;
}

async function deleteFeesPayment(paymentId) {
  await databases.deleteDocument(
    databaseId,
    feesPaymentCollectionId,
    paymentId
  );
}

async function getTimetableForDate(
  centerId,
  classId,
  yearId,
  startDate,
  endDate
) {
  const response = await databases.listDocuments(
    databaseId,
    timetableCollectionId,
    [
      Query.equal("branchId", centerId),
      Query.equal("classId", classId),
      Query.equal("yearId", yearId),
      Query.greaterThanEqual("date", startDate),
      Query.lessThanEqual("date", endDate),
    ]
  );
  return response.documents;
}

async function createTimetableEntry(data) {
  const response = await databases.createDocument(
    databaseId,
    timetableCollectionId,
    ID.unique(),
    data
  );
  return response;
}

async function updateTimetableEntry(entryId, data) {
  const response = await databases.updateDocument(
    databaseId,
    timetableCollectionId,
    entryId,
    data
  );
  return response;
}

async function deleteTimetableEntry(entryId) {
  await databases.deleteDocument(databaseId, timetableCollectionId, entryId);
}

async function checkRegisterCode(code) {
  const registerCode = await databases.listDocuments(
    databaseId,
    registerCodeCollectionId,
    [Query.equal("code", code)]
  );
  if (registerCode.documents.length == 0) {
    throw Error("code-not-exist");
  }
  return registerCode.documents[0];
}
async function deleteRegisterCode(id) {
  try {
    const registerCode = await databases.deleteDocument(
      databaseId,
      registerCodeCollectionId,
      id
    );
  } catch {}
}

async function getExams(branchId, yearId, classId) {
  console.log(branchId, yearId, classId);
  return await databases.listDocuments(databaseId, examCollectionId, [
    Query.equal("branchId", branchId),
    Query.equal("yearId", yearId),
    Query.equal("classId", classId),
  ]);
}
async function createExam(data) {
  return await databases.createDocument(
    databaseId,
    examCollectionId,
    ID.unique(),
    data
  );
}
async function updateExam(id, data) {
  return await databases.updateDocument(databaseId, examCollectionId, id, data);
}
async function deleteExam(id) {
  return await databases.deleteDocument(databaseId, examCollectionId, id);
}

async function createExamResult(data) {
  return await databases.createDocument(
    databaseId,
    examResultCollectionId,
    ID.unique(),
    data
  );
}
async function updateExamResult(id, data) {
  return await databases.updateDocument(
    databaseId,
    examResultCollectionId,
    id,
    data
  );
}
async function deleteExamResult(id) {
  return await databases.deleteDocument(databaseId, examResultCollectionId, id);
}

export async function getStudentTimetableByWeek(
  classId,
  yearId,
  branchId,
  startDate,
  endDate
) {
  const response = await databases.listDocuments(
    databaseId,
    timetableCollectionId,
    [
      Query.equal("classId", classId),
      Query.equal("yearId", yearId),
      Query.equal("branchId", branchId),
      Query.greaterThanEqual("date", startDate),
      Query.lessThanEqual("date", endDate),
    ]
  );
  return response.documents;
}

/**
 * Checks if there was a class on a given date for a class/year/branch, and if the student was present.
 * @param {string} centerId
 * @param {string} classId
 * @param {string} yearId
 * @param {string} date (yyyy-MM-dd)
 * @param {string} studentId
 * @returns {Promise<{ hadClass: boolean, present: boolean }>}
 */
export async function checkHaveClass(
  centerId,
  classId,
  yearId,
  date,
  studentId
) {
  const records = await getAttendanceForDate(centerId, classId, yearId, date);
  if (!records || records.length === 0) {
    return { hadClass: false, present: false };
  }
  const present = records.some((r) => r.studentId === studentId);
  return { hadClass: true, present };
}

/**
 * Fetches attendance summary for a student: total classes, total present, total absent.
 * @param {string} centerId
 * @param {string} classId
 * @param {string} yearId
 * @param {string} studentId
 * @returns {Promise<{ totalAttendance: number, totalPresent: number, totalAbsent: number }>}
 */
export async function getStudentAttendanceSummary(
  centerId,
  classId,
  yearId,
  studentId
) {
  const res = await databases.listDocuments(
    databaseId,
    attendanceCollectionId,
    [
      Query.equal("branchId", centerId),
      Query.equal("classId", classId),
      Query.equal("yearId", yearId),
      Query.orderAsc("date"),
      Query.limit(500),
    ]
  );
  const uniqueDates = Array.from(new Set(res.documents.map((r) => r.date)));
  const studentRecords = res.documents.filter((r) => r.studentId === studentId);
  return {
    totalAttendance: uniqueDates.length,
    totalPresent: studentRecords.length,
    totalAbsent: uniqueDates.length - studentRecords.length,
  };
}

// Get a student by ID
export async function getStudentById(studentId) {
  return await databases.getDocument(
    databaseId,
    studentsCollectionId,
    studentId
  );
}

// Get attendance records for a student
export async function getAttendanceByStudentId(studentId) {
  const res = await databases.listDocuments(
    databaseId,
    attendanceCollectionId,
    []
  );
  return res.documents.filter((a) => a.studentId === studentId);
}

// Get fees records for a student
export async function getFeesByStudentId(studentId) {
  const res = await databases.listDocuments(
    databaseId,
    feesPaymentCollectionId,
    []
  );
  return res.documents.filter((f) => f.studentId === studentId);
}

// Get exam results for a student
export async function getExamResultsByStudentId(studentId) {
  const res = await databases.listDocuments(
    databaseId,
    examResultCollectionId,
    []
  );
  return res.documents.filter((er) => er.studentId === studentId);
}

// Get all exams for a student's class/year/branch
export async function getExamsForStudent(studentDoc) {
  const res = await databases.listDocuments(databaseId, examCollectionId, []);
  return res.documents.filter(
    (exam) =>
      exam.classId === studentDoc.classId &&
      exam.yearId === studentDoc.yearId &&
      exam.branchId === studentDoc.branchId
  );
}

// Get timetable for a student's class/year/branch
export async function getTimetableForStudent(studentDoc) {
  const res = await databases.listDocuments(
    databaseId,
    timetableCollectionId,
    []
  );
  return res.documents.filter(
    (tt) =>
      tt.classId === studentDoc.classId &&
      tt.yearId === studentDoc.yearId &&
      tt.branchId === studentDoc.branchId
  );
}

// Get class by ID
export async function getClassById(classId) {
  return await databases.getDocument(databaseId, classesCollectionId, classId);
}

// Get year by ID
export async function getYearById(yearId) {
  return await databases.getDocument(databaseId, yearCollectionId, yearId);
}

export {
  deleteExamResult,
  updateExamResult,
  getExams,
  createExam,
  updateExam,
  deleteExam,
  account,
  databases,
  getListOfTuitionCenters,
  createTuitionCenter,
  deleteTuitionCenter,
  getListOfClasses,
  createClass,
  deleteClass,
  createFeesPayment,
  updateFeesPayment,
  deleteFeesPayment,
  getAttendanceForDate,
  markAttendance,
  createStudent,
  updateStudent,
  deleteStudent,
  getTimetableForDate,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  createExamResult,
  ID,
  Query,
  deleteAttendance,
  getPaymentForDay,
  checkRegisterCode,
  deleteRegisterCode,
  getAllYears,
  getAllClasses,
};
