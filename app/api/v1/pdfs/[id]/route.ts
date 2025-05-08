import { errorResponse } from '../../utils';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { getServerSession } from 'next-auth/next';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    // Get the userId from the session or use anonymous
    const userId = session?.user?.email || 'anonymous';
    // Get the PDF ID from the URL params
    const { id } = params;
    // Forward the request to the backend API
    const response = await axios.get(`${BACKEND_API_URL}/api/pdfs/${id}`, {
      params: { userId },
      responseType: 'stream',
    });
    // Create a readable stream from the response
    const stream = response.data;
    // Return the stream as the response
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=${id}.pdf`,
      },
    });
  } catch (error) {
    console.error('Error downloading PDF:', error);
    return errorResponse('PDF_DOWNLOAD_FAILED', 'Failed to download PDF', { originalError: error?.message }, 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    // Get the userId from the session or use anonymous
    const userId = session?.user?.email || 'anonymous';
    // Get the PDF ID from the URL params
    const { id } = params;
    // Forward the request to the backend API
    const response = await axios.delete(`${BACKEND_API_URL}/api/pdfs/${id}`, {
      params: { userId },
    });
    // Return the response data
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error deleting PDF:', error);
    return errorResponse('PDF_DELETE_FAILED', 'Failed to delete PDF', { originalError: error?.message }, 500);
  }
} 