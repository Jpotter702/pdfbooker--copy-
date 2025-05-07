"use client";

import { Navigation } from "./components/navigation";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-blue-100 p-8">
      <Navigation />
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-6">NEW PDFBooker</h1>
        <p className="text-xl mb-8">
          This is the NEW page. If you're seeing this, it means the routing issue is fixed!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">PDF Generation</h2>
            <p className="mb-4">Create beautiful PDFs from any web content with just a few clicks.</p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Create PDF
            </button>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-green-800 mb-4">Features</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Custom styling and formatting</li>
              <li>Table of contents generation</li>
              <li>Multiple page sizes</li>
              <li>Content filtering</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 