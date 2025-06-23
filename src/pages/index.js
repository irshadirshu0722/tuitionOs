// pages/Tuition_Dashboard.js
import "primereact/resources/themes/lara-light-cyan/theme.css";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  account,
  deleteTuitionBranch,
  getBranchDetails,
  getCenterData,
} from "../lib/appwrite";
import { FiSearch, FiTrash2 } from "react-icons/fi";
import { LuSchool } from "react-icons/lu";
import Loading from "@/components/atomic/loading/Loading";
import toast, { Toaster } from "react-hot-toast";
import { useUserContext } from "@/context/GlobalContext";
import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
import { FaUserFriends } from "react-icons/fa";
import StaffFormModal from "@/components/StaffFormModal";
import Image from "next/image";

export default function Dashboard() {
  const router = useRouter();
  const {
    setCenterDetails,
    setCenterStudents,
    centerDetails,
    role,
    setBranchDetails,
  } = useUserContext();
  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [errorLoadingCenters, setErrorLoadingCenters] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    setBranches((centerDetails && centerDetails.branches) || []);
  }, [centerDetails]);

  const openStaffModal = (branch) => {
    if (role !== "admin") return;
    setSelectedBranch(branch);
    setModalVisible(true);
  };
  const handleDelete = (itemId) => {
    if (role !== "admin") return;
    confirmDialog({
      message:
        "Are you sure you want to delete this center? \n you will lose every data associated with this center",
      header: "Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Yes",
      rejectLabel: "No",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteTuitionBranch(itemId);
          toast.success("Tuition center deleted successfully.");
          setCenterDetails((prev) => ({
            ...prev,
            branches: prev.branches.filter((item) => item.$id != itemId),
          }));
        } catch (error) {
          console.log(error);
          toast.error("Failed to delete tuition center, try again later");
        }
      },
      reject: () => {},
    });
  };

  const handleLogout = async () => {
    localStorage.removeItem("centerDetails");
    await account.deleteSession("current");
    router.push("/login");
  };

  const filteredCenters = branches.filter((center) =>
    center.name.toLowerCase().includes(search.toLowerCase())
  );

  if (errorLoadingCenters) {
    return (
      <div className=" flex items-center justify-center text-red-500">
        {errorLoadingCenters}
      </div>
    );
  }
  const handleClick = async (branch) => {
    setBranchDetails(branch);
    router.push("/admission");
  };
  if (role == "staff") {
    router.push("/admission");
    return;
  }

  return (
    <div className=" bg-white text-black pt-24 px-4 sm:px-6 md:px-20">
      {/* Navbar */}
      <ConfirmDialog />
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 md:px-20 py-4 w-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] fixed top-0 left-0 z-50">
        <div className="flex items-center space-x-4">
          <Image
            src="/equations.png"
            alt="Logo"
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-full"
            width={20}
            height={20}
          />
          <span className="text-lg sm:text-xl font-semibold">
            {centerDetails && centerDetails.name}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-auto">
            <div className="flex items-center border border-gray-300 rounded-full px-3 py-1.5 w-full md:w-72">
              <FiSearch className="text-gray-500 mr-2 h-4 w-4" />
              <input
                type="text"
                placeholder="Search ..."
                className="outline-none bg-transparent w-full text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold my-6 py-6 sm:py-10 md:py-4">
        Tuition Branches
      </h1>

      {/* branches List */}
      {loadingCenters ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredCenters.map((branch, index) => (
            <div onClick={() => handleClick(branch)} key={index}>
              <div className="relative rounded-xl px-6 py-6 sm:py-8 bg-gradient-to-br from-[#eee9ff] to-[#cfd4ff] shadow hover:scale-[1.02] transition-transform duration-200 cursor-pointer">
                <LuSchool className="text-4xl mb-6 sm:mb-12 text-gray-700" />
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-8 break-words">
                  {branch.name}
                </h2>

                {/* View Staffs Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openStaffModal(branch);
                  }}
                  className="absolute bottom-2 right-2 text-sm text-indigo-700 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <FaUserFriends className="text-xl" />
                  <span>View Staffs</span>
                </button>

                {/* Delete */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(branch.$id);
                  }}
                  className="absolute cursor-pointer top-2 right-2 text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <FiTrash2 size={30} />
                </button>
              </div>
            </div>
          ))}
          {filteredCenters.length === 0 && (
            <p className="text-gray-500 col-span-full text-center">
              No branches found.
            </p>
          )}
        </div>
      )}
      {/* Add Center Button */}
      <div className="flex justify-center">
        <Link href="/add-center">
          <button className=" cursor-pointer bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700">
            Add More Branches...
          </button>
        </Link>
      </div>
      <StaffFormModal
        open={modalVisible}
        onClose={() => setModalVisible(false)}
        branch={selectedBranch}
      />
    </div>
  );
}
