import { NextRequest, NextResponse } from 'next/server'
import { API_BASE_URL } from '@/lib/api-config'

export const runtime = 'edge';

// Trusted domains that the proxy is allowed to redirect to
const TRUSTED_DOMAINS = [
  'bcdnxw.hakunaymatata.com',
  'hakunaymatata.com',
  'apii.freehandyflix.online',
  'freehandyflix.online',
]

function isUrlTrusted(url: string): boolean {
  try {
    const parsedUrl = new URL(url)
    return TRUSTED_DOMAINS.some(domain => 
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
    )
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the URL from query parameter
    const url = request.nextUrl.searchParams.get('url')
    
    if (!url) {
      return NextResponse.json(
        { status: 400, success: false, message: 'Missing url parameter' },
        { status: 400 }
      )
    }
    
    // Validate URL is from a trusted domain to prevent SSRF attacks
    if (!isUrlTrusted(url)) {
      return NextResponse.json(
        { status: 403, success: false, message: 'URL domain not allowed' },
        { status: 403 }
      )
    }
    
    // Redirect to external API's download proxy
    // The external API handles decoding, fetching from CDN, and streaming with appropriate headers
    const downloadUrl = `${API_BASE_URL}/download/${encodeURIComponent(url)}`
    
    return NextResponse.redirect(downloadUrl, {
      status: 302,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
      },
    })
  } catch (error) {
    console.error('Download redirect error:', error)
    return NextResponse.json(
      { status: 500, success: false, message: 'Failed to redirect download' },
      { status: 500 }
    )
  }
}
