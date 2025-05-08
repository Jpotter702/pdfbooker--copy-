import { errorResponse } from '../utils';
import { getServerSession } from 'next-auth/next';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

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
    return errorResponse('PDF_LIST_FAILED', 'Failed to list PDFs', { originalError: error?.message }, 500);
  }
} 