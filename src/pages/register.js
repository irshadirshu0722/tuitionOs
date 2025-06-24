"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  account,
  checkRegisterCode,
  createTuitionCenter,
  deleteRegisterCode,
  ID,
} from "@/lib/appwrite";
import Button from "@/components/atomic/button/Button";
import { useUserContext } from "@/context/GlobalContext";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
const isTestProduction =
  process.env.NEXT_PUBLIC_APPWRITE_TEST_PRODUCTION == "true";

export default function SignUp() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser, setCenterDetails } = useUserContext();
  const [showRegisterInfo, setShowRegisterInfo] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    tuitionCenter: "",
    registerCode: isTestProduction ? "Test1213" : "", // 👈 new field
  });

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const {
      email,
      password,
      confirmPassword,
      tuitionCenter,
      fullName,
      registerCode,
    } = formData;
    if (
      !email ||
      !password ||
      !confirmPassword ||
      !tuitionCenter ||
      !fullName ||
      !registerCode
    ) {
      toast.error("Please fill out all fields.");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return false;
    }
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      let registerInstance;
      if (!isTestProduction) {
        registerInstance = await checkRegisterCode(formData.registerCode);
      }
      const userData = await account.create(
        ID.unique(),
        formData.email,
        formData.password,
        formData.fullName
      );
      await account.createEmailPasswordSession(
        formData.email,
        formData.password
      );
      if (formData.remember) {
        localStorage.setItem("session", JSON.stringify(session));
      }
      const userInfo = await account.get();
      setUser(userInfo);
      const centerDetails = await createTuitionCenter({
        name: formData.tuitionCenter,
        userId: userData.$id,
      });
      if (!isTestProduction) {
        await deleteRegisterCode(registerInstance.$id);
      }
      toast.success("Account created!");
      router.push("/login");
    } catch (error) {
      if (error.message == "code-not-exist") {
        toast.error("Register code is not exist, please contact support team");
      } else {
        toast.error("Failed to create account, please try again later");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <div className="w-full max-w-md sm:max-w-xl md:max-w-4xl flex bg-white rounded-2xl shadow-xl p-6 sm:p-10 space-y-6">
        <div className="hidden md:flex md:w-3/5 items-center justify-center rounded-l-xl p-4">
          <Image
            src="/signup.png"
            alt="Sign Up"
            width={600}
            height={200}
            className="rounded-xl"
          />
        </div>

        <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-center md:text-left">
            Sign up
          </h2>
          <p className="text-gray-600 mt-2 text-center md:text-left">
            Let’s get you all set up so you can access your personal account.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleInput}
                placeholder="Enter your full name"
                className="w-full p-3 border rounded-lg focus:ring focus:ring-indigo-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInput}
                placeholder="Enter your Email"
                className="w-full p-3 border rounded-lg focus:ring focus:ring-indigo-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tuition Center Name
              </label>
              <input
                name="tuitionCenter"
                type="text"
                value={formData.tuitionCenter}
                onChange={handleInput}
                placeholder="Enter your tuition center name"
                className="w-full p-3 border rounded-lg focus:ring focus:ring-indigo-300"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInput}
                placeholder="Enter password"
                className="w-full p-3 border rounded-lg focus:ring focus:ring-indigo-300"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleInput}
                placeholder="Confirm password"
                className="w-full p-3 border rounded-lg focus:ring focus:ring-indigo-300"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
            {!isTestProduction && (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Register Code
                </label>
                <div className="relative">
                  <input
                    name="registerCode"
                    type="text"
                    value={formData.registerCode}
                    onChange={handleInput}
                    placeholder="Enter your register code"
                    className="w-full p-3 border rounded-lg focus:ring focus:ring-indigo-300 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterInfo(!showRegisterInfo)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500"
                  >
                    <ExclamationCircleIcon className="w-5 h-5" />
                  </button>
                  {showRegisterInfo && (
                    <div className="absolute z-10 top-12 right-0 w-72 bg-white border shadow-lg rounded-lg p-4 text-sm text-gray-700">
                      <p>
                        You will receive your register code after completing the
                        one-time payment. Please contact our support or check
                        your email for the code.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-3 mt-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
              isLoading={loading}
            >
              Create account
            </Button>
          </form>

          <p className="text-center mt-4 text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-red-500 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
