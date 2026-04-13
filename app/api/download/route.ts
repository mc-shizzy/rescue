import { NextRequest, NextResponse } from 'next/server'

// Trusted CDN domains that the proxy is allowed to redirect to
// V3 API returns direct bcdn URLs for streaming/downloads
const TRUSTED_DOMAINS = [
  'bcdn.hakunaymatata.com',
  'hakunaymatata.com',
  'apiv3.freehandyflix.online',
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
    
    // V3 API returns direct bcdn CDN URLs — redirect straight to them
    // Ensure HTTPS to avoid mixed content
    const downloadUrl = url.startsWith('http://')
      ? url.replace(/^http:\/\//i, 'https://')
      : url
    
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
