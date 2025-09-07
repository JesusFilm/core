import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Read common edge headers set by Cloudflare/Vercel
  const country =
    request.headers.get('cf-ipcountry') ||
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('x-country-code') ||
    ''

  return NextResponse.json({ country })
}

