"use client";

import Link from "next/link";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BookIcon, SearchIcon, PlusCircleIcon } from "lucide-react";

export default function DashboardPage() {
  // Mock PDF books data
  const pdfBooks = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: `PDF Book ${i + 1}`,
    source: `https://example${i}.com`,
    date: new Date(Date.now() - (i * 86400000)).toLocaleDateString(),
    pages: Math.floor(Math.random() * 200) + 20,
  }));

  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold">Your PDF Books</h1>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input className="pl-9 w-full sm:w-[250px]" placeholder="Search books..." />
            </div>
            <Button asChild>
              <Link href="/create">
                <PlusCircleIcon className="mr-2 h-4 w-4" />
                Create New Book
              </Link>
            </Button>
          </div>
        </div>
        
        {pdfBooks.length === 0 ? (
          <div className="text-center py-16">
            <BookIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-medium mb-2">No PDF books yet</h2>
            <p className="text-muted-foreground mb-4">
              Start by creating your first PDF book from a web page.
            </p>
            <Button asChild>
              <Link href="/create">Create Your First Book</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {pdfBooks.map((book) => (
              <Card key={book.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1">{book.title}</CardTitle>
                    <div className="flex">
                      <button className="text-muted-foreground hover:text-foreground">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="h-[160px] bg-muted rounded-md flex items-center justify-center">
                    <BookIcon className="h-16 w-16 text-muted-foreground" />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <div className="w-full text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Source:</span>
                      <span className="truncate max-w-[140px]">{book.source}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{book.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pages:</span>
                      <span>{book.pages}</span>
                    </div>
                  </div>
                  <div className="w-full flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="flex-1">View</Button>
                    <Button size="sm" className="flex-1">Download</Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}