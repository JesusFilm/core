import { NextResponse } from 'next/server'
import { findVideo } from '../../../../../data/mock-videos'
import { exportRequestSchema } from '../../../../../lib/validation'

interface RouteContext {
  params: Promise<{ slug: string }>
}

export async function POST(request: Request, { params }: RouteContext) {
  const { slug } = await params
  const video = findVideo(slug)

  if (!video) {
    return NextResponse.json({ error: 'Video not found.' }, { status: 404 })
  }

  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const parsed = exportRequestSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid export payload.', issues: parsed.error.flatten() }, { status: 400 })
  }

  const now = new Date().toISOString()
  const jobId = `job_${slug}_${Date.now()}`

  return NextResponse.json({
    job: {
      id: jobId,
      videoSlug: video.slug,
      presetId: parsed.data.presetId,
      status: 'queued',
      progress: 0,
      createdAt: now,
      updatedAt: now
    },
    message: 'Export job queued.'
  })
}
