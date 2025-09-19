import { NextResponse } from 'next/server'
import { mockVideos } from '../../../../data/mock-videos'
import type { VideoSearchResponse } from '../../../../types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase().trim() ?? ''
  const started = performance.now()

  const filtered = mockVideos
    .filter((video) => {
      if (!query) return true
      return (
        video.slug.toLowerCase().includes(query) ||
        video.title.toLowerCase().includes(query) ||
        video.tags.some((tag) => tag.toLowerCase().includes(query))
      )
    })
    .map((video) => ({
      slug: video.slug,
      title: video.title,
      poster: video.poster,
      duration: video.duration,
      aspectRatio: video.width / video.height,
      highlighted: Boolean(query && video.slug.toLowerCase().startsWith(query))
    }))

  const body: VideoSearchResponse = {
    success: true,
    items: filtered,
    query,
    took: Math.round(performance.now() - started)
  }

  return NextResponse.json(body)
}
