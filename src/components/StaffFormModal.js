import React from "react";
import Button from "./atomic/button/Button";
import { useUserContext } from "@/context/GlobalContext";
import { createStaffAccount } from "@/lib/appwrite";
import toast from "react-hot-toast";
import { X } from "lucide-react";

const StaffFormModal = ({ open, onClose, branch }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { centerDetails, setCenterDetails } = useUserContext();
  const handleCreateStaff = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const staffData = await createStaffAccount({
        email: email,
        password: password,
        tuitionCenter: centerDetails.$id,
        branch: branch.$id,
      });
      setCenterDetails((prev) => ({
        ...prev,
        branches: prev.branches.map((item) => {
          if (item.$id == branch.$id) {
            return { ...item, staffs: [staffData, ...(item.staffs || [])] };
          }
          return item;
        }),
      }));
      setEmail("");
      setPassword("");
      toast.success("Successfully created staff account.");
      onClose();
    } catch (error) {
      if(error.code == 409){
        toast.error("Failed to create staff account, this user already exist");
      }else{

        toast.error("Failed to create staff account");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.7)] bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 text-xl"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-4">
          Add Staff for {branch.name}
        </h2>

        {/* Email Input */}
        <div className="mb-4">
          <input
            type="email"
            placeholder="Staff email"
            className="w-full px-3 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <input
            type="password"
            placeholder="Password"
            className="w-full px-3 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Add Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleCreateStaff}
            isLoading={loading}
            disabled={loading}
          >
            Add
          </Button>
        </div>

        {/* Existing Staff List */}
        <h3 className="font-semibold text-sm mt-6 mb-2">Existing Staff</h3>
        <ul className="space-y-2 max-h-[170px] overflow-y-auto">
          {branch.staffs?.length > 0 ? (
            branch.staffs.map((staff) => (
              <li
                key={staff.id}                className="flex items-center gap-3 bg-gray-100 rounded-lg px-3 py-2"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold uppercase">
                  {staff.email[0]}
                </div>
                <span className="text-sm text-gray-800">{staff.email}</span>
              </li>
            ))
          ) : (
            <li className="text-sm text-gray-500 italic">No staff yet</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default StaffFormModal;
