import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUserContext } from "@/context/GlobalContext";
import { account } from "@/lib/appwrite";
import Image from "next/image";

export default function Navbar() {
  const router = useRouter();
  const { centerDetails, user, role, branchDetails } = useUserContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to toggle menu on mobile

  useEffect(() => {
    setIsMenuOpen(false);
  }, [router.pathname]);
  const isActive = (path) => router.pathname === path;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen); // Toggle menu visibility
  const handleLogout = async () => {
    localStorage.removeItem("centerDetails");
    await account.deleteSession("current");
    router.push("/login");
    return;
  };

  return (
    <nav className="relative w-full bg-white/95 shadow-xl rounded-b-2xl px-6 py-4 flex items-center justify-between border-b-4 border-indigo-200 z-50">
      {/* Logo/Brand */}
      <div className="flex items-center gap-3">
        <Link href="/">
          <span className="text-3xl max-sm:text-2xl font-extrabold text-indigo-700 tracking-tight drop-shadow-sm cursor-pointer">
            TuitionCenter
          </span>
        </Link>
        {centerDetails && (
          <span className="ml-3 text-lg font-semibold text-indigo-400 bg-indigo-50 px-3 py-1 rounded-full shadow-sm">
            {centerDetails.name}
          </span>
        )}
      </div>

      {/* Mobile Menu Toggle Button */}
      <button
        onClick={toggleMenu}
        className="xl:hidden text-3xl text-indigo-700 focus:outline-none"
      >
        <span>☰</span>
      </button>

      {/* Desktop Menu */}
      <div className="hidden xl:flex  items-center gap-10 text-lg font-semibold">
        <Link
          href="/admission"
          className={`${
            isActive("/admission") ? "text-indigo-700" : "text-gray-700"
          } hover:text-indigo-600 transition-colors px-3 py-2 rounded-lg`}
        >
          Admission
        </Link>
        <Link
          href="/attendance"
          className={`${
            isActive("/attendance") ? "text-indigo-700" : "text-gray-700"
          } hover:text-indigo-600 transition-colors px-3 py-2 rounded-lg`}
        >
          Attendance
        </Link>
        <Link
          href="/fees-payment"
          className={`${
            isActive("/fees-payment") ? "text-indigo-700" : "text-gray-700"
          } hover:text-indigo-600 transition-colors px-3 py-2 rounded-lg`}
        >
          Fees
        </Link>
        <Link
          href="/exams"
          className={`${
            isActive("/exams") ? "text-indigo-700" : "text-gray-700"
          } hover:text-indigo-600 transition-colors px-3 py-2 rounded-lg`}
        >
          Exams
        </Link>
        <Link
          href="/timetable"
          className={`${
            isActive("/timetable") ? "text-indigo-700" : "text-gray-700"
          } hover:text-indigo-600 transition-colors px-3 py-2 rounded-lg`}
        >
          Timetable
        </Link>
        {role == "admin" && (
          <Link
            href="/"
            className={`${
              isActive("/") ? "text-indigo-700" : "text-gray-700"
            } hover:text-indigo-600 transition-colors px-3 py-2 rounded-lg`}
          >
            Centers
          </Link>
        )}
        <button
          onClick={() =>
            router.push(`/edit-center/${branchDetails && branchDetails.$id}`)
          }
          className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 shadow transition"
        >
          Edit Center
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-600 shadow transition"
        >
          Logout
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`xl:hidden fixed top-0 left-0 w-full h-full bg-white/95 z-50 transition-all duration-300 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ backdropFilter: isMenuOpen ? "blur(2px)" : "none" }}
      >
        <div className="flex flex-col items-center pt-24 gap-6 text-xl font-semibold">
          <button
            onClick={toggleMenu}
            className="absolute top-6 right-6 text-3xl text-indigo-700"
          >
            ×
          </button>
          <Link
            href="/admission"
            className={`${
              isActive("/admission") ? "text-indigo-700" : "text-gray-700"
            } hover:text-indigo-600 transition-colors px-4 py-2 rounded-lg w-3/4 text-center`}
          >
            Admission
          </Link>
          <Link
            href="/attendance"
            className={`${
              isActive("/attendance") ? "text-indigo-700" : "text-gray-700"
            } hover:text-indigo-600 transition-colors px-4 py-2 rounded-lg w-3/4 text-center`}
          >
            Attendance
          </Link>
          <Link
            href="/fees-payment"
            className={`${
              isActive("/fees-payment") ? "text-indigo-700" : "text-gray-700"
            } hover:text-indigo-600 transition-colors px-4 py-2 rounded-lg w-3/4 text-center`}
          >
            Fees
          </Link>
          <Link
            href="/exams"
            className={`${
              isActive("/exams") ? "text-indigo-700" : "text-gray-700"
            } hover:text-indigo-600 transition-colors px-4 py-2 rounded-lg w-3/4 text-center`}
          >
            Exams
          </Link>
          <Link
            href="/timetable"
            className={`${
              isActive("/timetable") ? "text-indigo-700" : "text-gray-700"
            } hover:text-indigo-600 transition-colors px-4 py-2 rounded-lg w-3/4 text-center`}
          >
            Timetable
          </Link>
          {role == "admin" && (
            <Link
              href="/"
              className={`${
                isActive("/") ? "text-indigo-700" : "text-gray-700"
              } hover:text-indigo-600 transition-colors px-4 py-2 rounded-lg w-3/4 text-center`}
            >
              Centers
            </Link>
          )}
          <button
            onClick={() =>
              router.push(`/edit-center/${branchDetails && branchDetails.$id}`)
            }
            className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 shadow w-3/4 text-center"
          >
            Edit Center
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-5 py-2 rounded-full hover:bg-red-600 shadow w-3/4 text-center"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
