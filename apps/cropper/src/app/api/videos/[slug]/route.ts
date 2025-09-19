import { NextResponse } from 'next/server'
import { findVideo } from '../../../../data/mock-videos'
import type { VideoDetailsResponse } from '../../../../types'

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params
  const video = findVideo(slug)

  if (!video) {
    return NextResponse.json({ error: 'Video not found.' }, { status: 404 })
  }

  const body: VideoDetailsResponse = {
    video
  }

  return NextResponse.json(body)
}
