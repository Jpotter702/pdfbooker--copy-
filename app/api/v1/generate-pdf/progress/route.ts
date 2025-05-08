import { errorResponse } from '../../utils';
import { getServerSession } from 'next-auth/next';
import { NextRequest } from 'next/navigation';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    if (!session) {
      return errorResponse('UNAUTHORIZED', 'Unauthorized', {}, 401);
    }
    // Get URL parameter
    const url = request.nextUrl.searchParams.get('url');
    if (!url) {
      return errorResponse('URL_REQUIRED', 'URL parameter is required', {}, 400);
    }
    // ... existing code ...
  } catch (error) {
    console.error('Error setting up SSE:', error);
    return errorResponse('SSE_FAILED', 'Failed to establish SSE connection', { originalError: error?.message }, 500);
  }
} 