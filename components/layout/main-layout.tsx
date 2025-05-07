import Link from "next/link";
import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div>
              <Link 
                href="/" 
                className="text-2xl font-bold text-white"
              >
                PDFBooker
              </Link>
            </div>
            <div className="flex space-x-6">
              <Link 
                href="/" 
                className="text-white hover:text-gray-200"
              >
                Home
              </Link>
              <Link 
                href="/about" 
                className="text-white hover:text-gray-200"
              >
                About
              </Link>
              <Link 
                href="/dashboard" 
                className="text-white hover:text-gray-200"
              >
                Dashboard
              </Link>
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-grow">{children}</main>
      <footer className="bg-gray-100">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-gray-600">
            &copy; {new Date().getFullYear()} PDFBooker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 