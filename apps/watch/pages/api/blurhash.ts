import { encode } from 'blurhash'
import { NextApiRequest, NextApiResponse } from 'next'
import { unstable_cache } from 'next/cache'
import sharp from 'sharp'

import {
  BlurhashApiResponse,
  BlurhashResult
} from '../../src/libs/blurhash/types'

// Allowed domains for security - these should be configurable
const ALLOWED_DOMAINS = [
  'images.unsplash.com',
  'cdn.sanity.io',
  'img.youtube.com',
  'i.ytimg.com',
  'image.mux.com',
  'imagedelivery.net',
  'localhost',
  '127.0.0.1'
  // Add more domains as needed based on your image sources
]

function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    const domain = url.hostname

    // Check if domain is in allowed list
    return ALLOWED_DOMAINS.some(
      (allowedDomain) =>
        domain === allowedDomain || domain.endsWith('.' + allowedDomain)
    )
  } catch {
    return false
  }
}

async function fetchImageWithTimeout(
  url: string,
  timeoutMs: number = 10000
): Promise<ArrayBuffer> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Next.js Blurhash Generator/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && !contentType.startsWith('image/')) {
      throw new Error(`Invalid content type: ${contentType}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    clearTimeout(timeoutId)
    return arrayBuffer
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout')
      }
      throw error
    }
    throw new Error('Failed to fetch image')
  }
}

async function extractDominantColor(imageBuffer: Buffer): Promise<string> {
  // Resize to 100x100 for color extraction (larger than blurhash for better accuracy)
  const resizedBuffer = await sharp(imageBuffer)
    .resize(100, 100, { fit: 'inside' })
    .raw()
    .toBuffer()

  const pixelCount = resizedBuffer.length / 3 // RGB components
  const colorCounts: Map<
    string,
    { count: number; rgb: [number, number, number] }
  > = new Map()

  // Sample pixels and count frequencies
  for (let i = 0; i < pixelCount; i++) {
    const r = resizedBuffer[i * 3]
    const g = resizedBuffer[i * 3 + 1]
    const b = resizedBuffer[i * 3 + 2]

    // Skip very dark/light colors (optional filtering)
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b
    if (luminance < 20 || luminance > 240) {
      continue
    }

    // Simple quantization to reduce color space (group similar colors)
    const quantizedR = Math.floor(r / 8) * 8
    const quantizedG = Math.floor(g / 8) * 8
    const quantizedB = Math.floor(b / 8) * 8
    const key = `${quantizedR},${quantizedG},${quantizedB}`

    const existing = colorCounts.get(key)
    if (existing) {
      existing.count++
    } else {
      colorCounts.set(key, {
        count: 1,
        rgb: [quantizedR, quantizedG, quantizedB]
      })
    }
  }

  // Find the most frequent color
  let dominantColor = {
    count: 0,
    rgb: [128, 128, 128] as [number, number, number]
  }

  for (const [, data] of colorCounts) {
    if (data.count > dominantColor.count) {
      dominantColor = data
    }
  }

  // Convert RGB to hex
  const [r, g, b] = dominantColor.rgb
  const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`

  return hex
}

// Simple in-memory cache to limit concurrent blurhash generations
const processingCache = new Map<string, Promise<BlurhashResult>>()

async function generateBlurhash(imageBuffer: Buffer): Promise<BlurhashResult> {
  // Process image for blurhash (32x32)
  const blurhashImage = await sharp(imageBuffer)
    .resize(32, 32, { fit: 'inside', withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { data, info } = blurhashImage
  const { width, height } = info

  // Generate blurhash
  const blurhashString = encode(
    new Uint8ClampedArray(data),
    width,
    height,
    4,
    4
  )

  // Extract dominant color
  const dominantColor = await extractDominantColor(imageBuffer)

  return {
    blurhash: blurhashString,
    dominantColor
  }
}

// Cached version with deduplication for concurrent requests
const generateBlurhashCached = unstable_cache(
  async (imageUrl: string): Promise<BlurhashResult> => {
    // Check if we're already processing this image
    const cacheKey = `blurhash:${imageUrl}`
    const existingPromise = processingCache.get(cacheKey)

    if (existingPromise) {
      console.log(`Reusing existing blurhash generation for: ${imageUrl}`)
      return existingPromise
    }

    // Start processing and cache the promise
    const processingPromise = (async () => {
      try {
        // Fetch image with timeout
        const imageBuffer = await fetchImageWithTimeout(imageUrl, 10000)
        const buffer = Buffer.from(imageBuffer)

        // Generate blurhash and dominant color
        const result = await generateBlurhash(buffer)

        return result
      } finally {
        // Clean up cache after processing completes (success or failure)
        processingCache.delete(cacheKey)
      }
    })()

    processingCache.set(cacheKey, processingPromise)
    return processingPromise
  },
  ['blurhash-generation'],
  {
    revalidate: 86400, // Revalidate every 24 hours
    tags: ['blurhash']
  }
)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BlurhashApiResponse>
): Promise<void> {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { imageUrl } = req.query

  // Validate imageUrl parameter
  if (!imageUrl || typeof imageUrl !== 'string') {
    res.status(400).json({ error: 'Missing or invalid imageUrl parameter' })
    return
  }

  // Validate URL format and allowed domains
  if (!isValidUrl(imageUrl)) {
    res.status(400).json({ error: 'Invalid or disallowed image URL' })
    return
  }

  try {
    // Use cached blurhash generation with deduplication
    const result = await generateBlurhashCached(imageUrl)

    // Set cache headers for performance (client-side caching)
    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, stale-while-revalidate=86400'
    ) // 24 hours
    res.status(200).json(result)
  } catch (error) {
    console.error('Blurhash generation error:', error)

    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('timeout')) {
        res
          .status(408)
          .json({ error: 'Request timeout - image took too long to fetch' })
        return
      }
      if (error.message.includes('HTTP')) {
        res
          .status(400)
          .json({ error: `Failed to fetch image: ${error.message}` })
        return
      }
      if (error.message.includes('Invalid content type')) {
        res.status(400).json({ error: 'URL does not point to a valid image' })
        return
      }
      if (
        error.message.includes('Input buffer contains unsupported image format')
      ) {
        res.status(400).json({ error: 'Unsupported image format' })
        return
      }
    }

    // Generic error
    res
      .status(500)
      .json({ error: 'Failed to generate blurhash and dominant color' })
  }
}
