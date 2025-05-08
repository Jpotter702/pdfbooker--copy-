import { errorResponse } from '../utils';
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await axios.post(`${BACKEND_API_URL}/api/crawl`, body);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error crawling site:', error);
    return errorResponse('CRAWL_FAILED', 'Failed to crawl site', { originalError: error?.message }, 500);
  }
} 