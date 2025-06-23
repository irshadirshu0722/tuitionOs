"use client";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { UserProvider, useUserContext } from "@/context/GlobalContext";
import {
  account,
  getCenterData,
  getCenterStudents,
  getStaffDetails,
  GetTuitionCenter,
} from "@/lib/appwrite";
import Loading from "@/components/atomic/loading/Loading";
import "@/styles/globals.css";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { PrimeReactProvider } from "primereact/api";
import { Footer } from "@/components/Footer";
function SessionLoader({ children }) {
  const router = useRouter();
  const {
    setSelectedClass,
    selectedClass,
    selectedYear,
    setSelectedYear,
    setCenterDetails,
    branchDetails,
    setBranchDetails,
    setRole,
    studentLoading,
    centerStudents,
  } = useUserContext();
  const [loading, setLoading] = useState(true);
  const isFetchedUser = useRef(false);
  useEffect(() => {
    if (centerStudents != null) {
      isFetchedUser.current = true;
    }
  }, []);
  const isParentView = router.pathname.startsWith("/parent");
  useEffect(() => {
    const checkSessionAndFetchCenterDetails = async () => {
      try {
        setLoading(true);
        const userInfo = await account.get();
        const staffDetails = await checkIsStaff(userInfo);
        if (staffDetails) {
          setRole("staff");
          setCenterDetails(staffDetails.tuitionCenter);
          setBranchDetails(staffDetails.branch);
          if (router.pathname == "/") {
            router.push("/admission");
          }
        } else {
          setRole("admin");
          await fetchCenterData(userInfo);
        }
        if (router.pathname == "/login") {
          router.push("/");
        }
      } catch (error) {
        setRole(null);
        router.pathname == "/register"
          ? router.push("/register")
          : router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    if (!isParentView){

      checkSessionAndFetchCenterDetails();
    } 
  }, []);
  const checkIsStaff = async (userInfo) => {
    try {
      return await getStaffDetails(userInfo.$id);
    } catch (error) {
      console.log("Staff error", error);
      return null;
    }
  };
  const fetchCenterData = async (userInfo) => {
    try {
      const data = await GetTuitionCenter(userInfo.$id);
      console.log(data);
      setCenterDetails(data);
    } catch (error) {
      throw Error(error);
    }
  };
  
  if (isParentView) {
    return (
      <div className="flex flex-col min-h-screen bg-white">{children}</div>
    );
  }
  if (loading || (studentLoading && !isFetchedUser)) {
    return <Loading />;
  }
  const hideNavbarPaths = ["/login", "/register", "/", "/add-center"];
  const shouldHideNavbar = hideNavbarPaths.includes(router.pathname);
  if (shouldHideNavbar) {


    return (
      <div className="flex flex-col min-h-screen bg-white">{children}</div>
    );
  }
  return (
    <>
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <div className="flex-1 w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-auto">
          {!router.pathname.includes("edit-center") && (
            <>
              {branchDetails?.classes && branchDetails?.years && (
                <div className="flex justify-between mb-6 gap-4 flex-col sm:flex-row">
                  <div className="flex gap-4 mb-4 sm:mb-0">
                    <select
                      className="border border-gray-300 rounded-md px-4 py-2"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                    >
                      {branchDetails.classes.map((item, index) => (
                        <option key={index} value={item.$id}>
                          Class {item.class}
                        </option>
                      ))}
                    </select>
                    <select
                      className="border border-gray-300 rounded-md px-4 py-2"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      {branchDetails.years.map((item, index) => (
                        <option key={index} value={item.$id}>
                          {item.year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}

          {children}
        </div>
        <Footer />
      </div>
    </>
  );
}

export default function App({ Component, pageProps }) {
  return (
    <UserProvider>
      <SessionLoader>
        <PrimeReactProvider>
          <Component {...pageProps} />
          <Toaster position="top-center" />
        </PrimeReactProvider>
      </SessionLoader>
    </UserProvider>
  );
}
