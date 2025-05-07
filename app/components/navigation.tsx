"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="flex flex-col items-center justify-center p-4 bg-white shadow-md rounded-lg mb-8 mt-4 mx-auto max-w-4xl">
      <div className="text-2xl font-bold mb-4">PDFBooker Navigation</div>
      <div className="flex space-x-4">
        <Link 
          href="/" 
          className={`px-4 py-2 rounded-md ${pathname === "/" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          Home
        </Link>
        <Link 
          href="/dashboard" 
          className={`px-4 py-2 rounded-md ${pathname === "/dashboard" ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          Dashboard
        </Link>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Current path: {pathname}
      </div>
    </nav>
  );
} 