import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import axios from 'axios';

// Environment variable for the backend API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

// Handler for GET requests - list all PDFs
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    
    // Get the userId from the session or use anonymous
    const userId = session?.user?.email || 'anonymous';
    
    // Forward the request to the backend API
    const response = await axios.get(`${BACKEND_API_URL}/api/pdfs`, {
      params: { userId },
    });
    
    // Return the response data
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error listing PDFs:', error);
    return NextResponse.json(
      { error: 'Failed to list PDFs' },
      { status: 500 }
    );
  }
} 