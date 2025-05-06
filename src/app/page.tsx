"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white">
      <div className="container max-w-6xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8 flex flex-col items-center text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          <span className="block">Transform Web Content</span>
          <span className="block text-blue-400">Into Beautiful PDF Books</span>
        </h1>
        
        <p className="mt-6 text-xl max-w-prose mx-auto">
          PDFBooker converts any website into a professionally formatted PDF with just a few clicks. Preserve articles, documentation, and web content in a clean, readable format.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signin">
            <Button size="lg" className="px-8 py-6 text-lg">
              Get Started
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
              Learn More
            </Button>
          </Link>
        </div>
        
        <div className="mt-16 border border-gray-700 rounded-xl overflow-hidden shadow-2xl max-w-4xl">
          <img 
            src="/images/hero-image.png" 
            alt="PDFBooker app screenshot" 
            className="w-full h-auto"
            onError={(e) => {
              // Fallback if image doesn't exist
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>
    </main>
  );
}