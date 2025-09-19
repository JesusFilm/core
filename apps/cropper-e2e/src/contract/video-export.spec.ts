import { expect, test } from '@playwright/test'

test.describe('POST /api/videos/:slug/export', () => {
  test('queues an export job with a valid payload', async ({ request }) => {
    const now = new Date().toISOString()
    const payload = {
      presetId: 'social-1080x1920',
      path: {
        id: 'path-contract-test',
        videoSlug: 'city-runner',
        aspectRatio: 9 / 16,
        padding: 0.05,
        smoothing: 0.2,
        keyframes: [
          {
            id: 'kf-start',
            time: 0,
            window: { focusX: 0.5, focusY: 0.5, scale: 1 },
            easing: 'linear' as const,
            createdAt: now,
            updatedAt: now
          },
          {
            id: 'kf-mid',
            time: 1,
            window: { focusX: 0.48, focusY: 0.56, scale: 0.9 },
            easing: 'linear' as const,
            createdAt: now,
            updatedAt: now
          }
        ],
        createdAt: now,
        updatedAt: now
      }
    }

    const response = await request.post('/api/videos/city-runner/export', { data: payload })
    expect(response.status()).toBe(200)

    const body = (await response.json()) as {
      job: {
        id: string
        videoSlug: string
        presetId: string
        status: string
        progress: number
      }
      message: string
    }

    expect(body.message).toContain('Export job queued')
    expect(body.job.videoSlug).toBe('city-runner')
    expect(body.job.presetId).toBe(payload.presetId)
    expect(body.job.status).toBe('queued')
    expect(body.job.progress).toBe(0)
  })

  test('rejects invalid export payloads', async ({ request }) => {
    const response = await request.post('/api/videos/city-runner/export', {
      data: { presetId: '', path: { id: '', keyframes: [] } }
    })

    expect(response.status()).toBe(400)
    const body = (await response.json()) as { error?: string }
    expect(body.error).toBeDefined()
  })
})
