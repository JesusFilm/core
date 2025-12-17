import { existsSync, statSync } from 'fs'
import { join } from 'path'

import { NextApiRequest, NextApiResponse } from 'next'

interface ThumbnailApiResponse {
  url: string
}

// Supported image extensions to check for local thumbnails
const SUPPORTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']

/**
 * Get cache version based on file modification time for cache busting
 * Falls back to current timestamp if file access fails
 */
function getCacheVersion(filePath: string): string {
  try {
    // Convert public URL path to filesystem path using absolute path
    const fullPath = join(
      process.cwd(),
      filePath.replace('/assets/thumbnails/', 'public/assets/thumbnails/')
    )
    const stats = statSync(fullPath)
    return stats.mtime.getTime().toString()
  } catch (error) {
    // Fallback to timestamp if file access fails (new deployments, etc.)
    console.warn(
      `Could not read file stats for cache versioning (${filePath}):`,
      error
    )
    return Date.now().toString()
  }
}

function findLocalThumbnail(
  contentId: string,
  orientation?: string,
  containerSlug?: string,
  variantSlug?: string,
  languageId?: string
): string | null {
  const publicDir = join(process.cwd(), 'public', 'assets', 'thumbnails')

  // Build filename patterns in priority order (most specific first)
  const filenamePatterns: string[] = []

  if (orientation && containerSlug && variantSlug && languageId) {
    filenamePatterns.push(
      `${contentId}-${orientation}-${containerSlug}-${variantSlug}-${languageId}`
    )
  }
  if (orientation && containerSlug && variantSlug) {
    filenamePatterns.push(
      `${contentId}-${orientation}-${containerSlug}-${variantSlug}`
    )
  }
  if (orientation && containerSlug) {
    filenamePatterns.push(`${contentId}-${orientation}-${containerSlug}`)
  }
  if (orientation) {
    filenamePatterns.push(`${contentId}-${orientation}`)
  }
  // Always include the basic contentId pattern
  filenamePatterns.push(contentId)

  // Try each pattern with all supported extensions
  for (const pattern of filenamePatterns) {
    for (const ext of SUPPORTED_EXTENSIONS) {
      const filePath = join(publicDir, `${pattern}.${ext}`)
      if (existsSync(filePath)) {
        return `/assets/thumbnails/${pattern}.${ext}`
      }
    }
  }

  return null
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ThumbnailApiResponse | { error: string }>
): Promise<void> {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const {
    contentId,
    originalUrl,
    orientation,
    containerSlug,
    variantSlug,
    languageId
  } = req.query

  // Validate contentId parameter (required)
  if (!contentId || typeof contentId !== 'string') {
    res.status(400).json({ error: 'Missing or invalid contentId parameter' })
    return
  }

  // Validate contentId format (basic sanitization)
  if (!/^[a-zA-Z0-9_-]+$/.test(contentId)) {
    res.status(400).json({ error: 'Invalid contentId format' })
    return
  }

  // Validate optional parameters (basic sanitization if provided)
  const validateOptionalParam = (
    param: string | string[] | undefined,
    paramName: string
  ): string | undefined => {
    if (!param) return undefined
    const value = Array.isArray(param) ? param[0] : param
    if (typeof value !== 'string') return undefined
    // Allow alphanumeric, hyphens, underscores, and dots for slugs
    if (!/^[a-zA-Z0-9_.-]+$/.test(value)) return undefined
    return value
  }

  const validatedOrientation = validateOptionalParam(orientation, 'orientation')
  const validatedContainerSlug = validateOptionalParam(
    containerSlug,
    'containerSlug'
  )
  const validatedVariantSlug = validateOptionalParam(variantSlug, 'variantSlug')
  const validatedLanguageId = validateOptionalParam(languageId, 'languageId')

  try {
    // Check for local thumbnail file with fallback hierarchy
    const localThumbnail = findLocalThumbnail(
      contentId,
      validatedOrientation,
      validatedContainerSlug,
      validatedVariantSlug,
      validatedLanguageId
    )

    if (localThumbnail) {
      // Set cache headers for performance (client-side caching)
      res.setHeader(
        'Cache-Control',
        'public, max-age=3600, stale-while-revalidate=3600'
      ) // 1 hour

      // Add file modification time-based cache busting
      const version = getCacheVersion(localThumbnail)
      const cacheBustedUrl = `${localThumbnail}?v=${version}`

      res.status(200).json({ url: cacheBustedUrl })
      return
    }

    // No local thumbnail found, fallback to original URL
    const fallbackUrl = typeof originalUrl === 'string' ? originalUrl : ''

    if (!fallbackUrl) {
      res
        .status(400)
        .json({ error: 'No local thumbnail found and no originalUrl provided' })
      return
    }

    // Set shorter cache for fallback URLs (they might change)
    res.setHeader(
      'Cache-Control',
      'public, max-age=300, stale-while-revalidate=300'
    ) // 5 minutes

    res.status(200).json({ url: fallbackUrl })
  } catch (error) {
    console.error('Thumbnail API error:', error)

    // Generic error fallback
    if (typeof originalUrl === 'string') {
      res.status(200).json({ url: originalUrl })
    } else {
      res.status(500).json({ error: 'Failed to process thumbnail request' })
    }
  }
}
