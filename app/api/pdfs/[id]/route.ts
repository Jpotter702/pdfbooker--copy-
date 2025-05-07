import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import axios from 'axios';

// Environment variable for the backend API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

// Handler for GET requests - download a PDF
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
    return NextResponse.json(
      { error: 'Failed to download PDF' },
      { status: 500 }
    );
  }
}

// Handler for DELETE requests - delete a PDF
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
    return NextResponse.json(
      { error: 'Failed to delete PDF' },
      { status: 500 }
    );
  }
} 