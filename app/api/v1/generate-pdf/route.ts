import { errorResponse } from '../utils';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    if (!session) {
      return errorResponse('UNAUTHORIZED', 'Unauthorized', {}, 401);
    }
    // Get form data from request
    const formData = await request.formData();
    // Forward the request to the backend API
    const response = await axios.post(
      `${BACKEND_API_URL}/api/generate-pdf`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        responseType: 'stream',
      }
    );
    // Create a readable stream from the response
    const stream = response.data;
    // Return the stream as the response
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=generated.pdf',
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return errorResponse('PDF_GENERATE_FAILED', 'Failed to generate PDF', { originalError: error?.message }, 500);
  }
} 