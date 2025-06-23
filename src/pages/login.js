// pages/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { Toaster, toast } from "react-hot-toast";
import {
  account,
  createOrGetTuitionCenter,
  getStaffDetails,
  GetTuitionCenter,
} from "../lib/appwrite";
import Link from "next/link";
import { useUserContext } from "@/context/GlobalContext";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
    role: "admin",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser, setCenterDetails, setBranchDetails, setRole } =
    useUserContext();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const session = await account.createEmailPasswordSession(
        formData.email,
        formData.password
      );
      if (formData.remember) {
        localStorage.setItem("session", JSON.stringify(session));
      }
      const userInfo = await account.get();
      setUser(userInfo);
      if (formData.role == "staff") {
        setRole("staff");
        const staffInfo = await getStaffDetails(userInfo.$id);
        setCenterDetails(staffInfo.tuitionCenter);
        setBranchDetails(staffInfo.branch);
        router.push("/admission");
      } else {
        setRole("admin");
        setCenterDetails(await GetTuitionCenter(userInfo.$id));
        router.push("/");
      }
      toast.success("Login successful");
    } catch (err) {
      if (err.code == 401) {
        await account.deleteSession("current");
        handleLogin(e);
        return;
      }
      console.log(err);
      toast.error("Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className=" flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md sm:max-w-xl md:max-w-2xl bg-white rounded-2xl shadow-xl p-6 sm:p-10 space-y-6">
        <div className="flex items-center justify-center sm:justify-start space-x-4">
          <Image
            src="/equations.png"
            alt="Logo"
            width={50}
            height={50}
            className="rounded-full"
          />
          <h1 className="text-2xl sm:text-3xl font-bold">Equations</h1>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-semibold mb-1">Login</h2>
          <p className="text-gray-500 text-sm">
            Login to access your Equations account
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              className="mt-1 w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="mt-1 w-full border rounded-lg p-3 pr-10 outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Role Radio Buttons */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Role
            </label>
            <div className="flex gap-6">
              {["admin", "staff"].map((role) => (
                <label
                  key={role}
                  className={`flex flex-1 items-center gap-2 p-2 border rounded-lg cursor-pointer transition ${
                    formData.role === role
                      ? "bg-blue-50 border-blue-500"
                      : "bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={formData.role === role}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="accent-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {role}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remember"
              checked={formData.remember}
              onChange={() =>
                setFormData({ ...formData, remember: !formData.remember })
              }
              className="accent-blue-600"
            />
            <label htmlFor="remember" className="text-sm text-gray-600">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700 transition duration-200"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <Link href="/register" className="text-blue-500 font-semibold">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
