import { expect, test } from '@playwright/test'

test.describe('GET /api/videos/search', () => {
  test('returns full catalog when no query is provided', async ({ request }) => {
    const response = await request.get('/api/videos/search')
    expect(response.ok()).toBeTruthy()

    const body = (await response.json()) as {
      items: Array<{
        slug: string
        title: string
        poster: string
        duration: number
        aspectRatio: number
        highlighted?: boolean
      }>
      query: string
      took: number
    }

    expect(body.query).toBe('')
    expect(Array.isArray(body.items)).toBe(true)
    expect(body.items.length).toBeGreaterThan(0)

    for (const item of body.items) {
      expect.soft(item.slug).not.toEqual('')
      expect.soft(item.title).not.toEqual('')
      expect.soft(item.poster).toMatch(/^https?:\/\//)
      expect.soft(item.duration).toBeGreaterThan(0)
      expect.soft(item.aspectRatio).toBeGreaterThan(0)
    }
  })

  test('filters results by query and marks highlighted matches', async ({ request }) => {
    const response = await request.get('/api/videos/search?q=city')
    expect(response.ok()).toBeTruthy()

    const body = (await response.json()) as {
      items: Array<{ slug: string; highlighted?: boolean }>
      query: string
    }

    expect(body.query).toBe('city')
    expect(body.items).toHaveLength(1)
    expect(body.items[0]?.slug).toBe('city-runner')
    expect(body.items[0]?.highlighted).toBe(true)
  })
})
