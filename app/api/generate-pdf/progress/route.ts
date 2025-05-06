import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import axios from 'axios';

// Environment variable for the backend API URL
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get URL parameter
    const url = request.nextUrl.searchParams.get('url');
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Create a new TransformStream for the SSE
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Connect to the backend SSE endpoint
    const eventSource = new EventSource(
      `${BACKEND_API_URL}/api/generate-pdf/progress?url=${encodeURIComponent(url)}`
    );

    // Forward SSE events from the backend to the client
    eventSource.onmessage = async (event) => {
      try {
        await writer.write(
          new TextEncoder().encode(`data: ${event.data}\n\n`)
        );
        
        // Close the connection if we're done
        const data = JSON.parse(event.data);
        if (data.progress === 100) {
          eventSource.close();
          await writer.close();
        }
      } catch (error) {
        console.error('Error writing to stream:', error);
        eventSource.close();
        await writer.close();
      }
    };

    eventSource.onerror = async () => {
      console.error('Error from backend SSE connection');
      eventSource.close();
      await writer.close();
    };

    // Return the stream as SSE
    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error setting up SSE:', error);
    return NextResponse.json(
      { error: 'Failed to establish SSE connection' },
      { status: 500 }
    );
  }
} 