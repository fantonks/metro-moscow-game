import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const imageUrl = searchParams.get('url')

  if (!imageUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 })
  }

  try {
    // Validate that URL is from Wikimedia (allow both upload.wikimedia.org and commons.wikimedia.org)
    const decodedUrl = decodeURIComponent(imageUrl)
    if (!decodedUrl.includes('wikimedia.org') && !decodedUrl.includes('upload.wikimedia.org')) {
      return new NextResponse('Invalid image source', { status: 403 })
    }
    
    // Convert commons.wikimedia.org URLs to upload.wikimedia.org format if needed
    let finalUrl = decodedUrl
    
    // If URL already has correct format with hash, use it as is
    if (decodedUrl.includes('upload.wikimedia.org/wikipedia/commons/thumb/')) {
      finalUrl = decodedUrl
    } else if (decodedUrl.includes('commons.wikimedia.org/wiki/Special:FilePath')) {
      // Extract filename from Special:FilePath URL
      const match = decodedUrl.match(/Special:FilePath\/([^?]+)/)
      if (match) {
        const filename = match[1]
        // Try to get the file info from Wikimedia API to find correct hash
        // For now, use direct URL format - Wikimedia will redirect to correct hash
        finalUrl = `https://upload.wikimedia.org/wikipedia/commons/${filename}`
      }
    } else if (decodedUrl.includes('upload.wikimedia.org/wikipedia/commons/')) {
      // URL might be missing hash, try to fetch and get redirect
      finalUrl = decodedUrl
    }

    // Fetch the image
    const response = await fetch(finalUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.wikipedia.org/',
      },
    })

    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status })
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Error proxying image:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
