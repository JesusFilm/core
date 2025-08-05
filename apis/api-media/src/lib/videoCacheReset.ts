import fetch from 'node-fetch'

import { prisma } from '@core/prisma/media/client'

import { cache } from '../yoga'

async function revalidateWatchApp(url: string): Promise<void> {
  try {
    const watchUrl = process.env.WATCH_URL
    const secret = process.env.WATCH_REVALIDATE_SECRET
    if (!watchUrl || !secret) return
    const endpoint = `${watchUrl}/api/revalidate?secret=${secret}`
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
  } catch {
    // Fail silently
  }
}

async function invalidateYogaCache(
  typename: string,
  id: string
): Promise<void> {
  try {
    await cache.invalidate([{ typename, id }])
  } catch {
    // Fail silently
  }
}

export async function videoCacheReset(videoId: string): Promise<void> {
  try {
    const slug = await prisma.video.findUnique({
      where: { id: videoId },
      select: { slug: true }
    })
    if (!slug?.slug) return
    // only english since crowdin handles others
    await revalidateWatchApp(
      `/watch/${encodeURIComponent(slug.slug)}.html/english.html`
    )
    await invalidateYogaCache('Video', videoId)
  } catch {
    // Fail silently
  }
}

export async function videoVariantCacheReset(
  videoVariantId: string
): Promise<void> {
  try {
    const variant = await prisma.videoVariant.findUnique({
      where: { id: videoVariantId },
      select: { slug: true }
    })
    if (!variant?.slug) return

    const slugs = variant.slug.split('/')

    await revalidateWatchApp(
      `/watch/${encodeURIComponent(slugs[0])}.html/${encodeURIComponent(slugs[1])}.html`
    )
    await invalidateYogaCache('VideoVariant', videoVariantId)
  } catch {
    // Fail silently
  }
}
