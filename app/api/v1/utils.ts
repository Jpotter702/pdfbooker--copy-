import { NextResponse } from 'next/server';

export function errorResponse(code: string, message: string, details: any = {}, status: number = 500) {
  return NextResponse.json(
    { error: { code, message, details } },
    { status }
  );
} 