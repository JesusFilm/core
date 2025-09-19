import { expect, test } from '@playwright/test'

test.describe('GET /api/videos/:slug', () => {
  test('returns video details for a known slug', async ({ request }) => {
    const response = await request.get('/api/videos/city-runner')
    expect(response.status()).toBe(200)

    const body = (await response.json()) as {
      video: {
        slug: string
        title: string
        duration: number
        width: number
        height: number
        src: string
        poster: string
      }
    }

    expect(body.video.slug).toBe('city-runner')
    expect(body.video.title).not.toEqual('')
    expect(body.video.duration).toBeGreaterThan(0)
    expect(body.video.width).toBeGreaterThan(0)
    expect(body.video.height).toBeGreaterThan(0)
    expect(body.video.src).toMatch(/^https?:\/\//)
    expect(body.video.poster).toMatch(/^https?:\/\//)
  })

  test('returns 404 for an unknown slug', async ({ request }) => {
    const response = await request.get('/api/videos/unknown-slug')
    expect(response.status()).toBe(404)

    const body = (await response.json()) as { error?: string }
    expect(body.error).toBeDefined()
  })
})
