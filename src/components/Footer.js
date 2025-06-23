import Image from "next/image";
import React from "react";

export const Footer = () => {
  return (
    <footer className="  border-t pt-6 pb-4 px-4 text-center text-sm text-gray-600 bg-white">
      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:justify-between sm:px-10">
        {/* Logo and App Name */}
        <div className="flex items-center gap-2">
          <Image
            src="/equations.png"
            alt="TuitionOS Logo"
            className="h-8 w-8 rounded-full"
            width={20}
            height={20}
          />
          <span className="font-semibold text-gray-800">TuitionOS</span>
        </div>

        {/* Copyright */}
        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} TuitionOS. All rights reserved.
        </p>

        {/* Developer Info */}
        <p className="text-xs">
          Developed by{" "}
          <a
            href="https://linkedin.com/in/muhammed-irshad-81985b287/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline font-medium"
          >
            Muhammed Irshad
          </a>
        </p>
      </div>
    </footer>
  );
};
