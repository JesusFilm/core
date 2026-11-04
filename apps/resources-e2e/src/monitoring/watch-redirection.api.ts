import { expect, test } from '@playwright/test'

test('Arclight HTTP redirects reach the expected Watch page', async ({ request }) => {
  let url = new URL('https://arc.gt/s/1_jf-0-0/529')
  const destination = 'https://www.jesusfilm.org/watch/jesus.html/english.html'
  const visited = new Set<string>()

  // Inspect Location explicitly, including relative headers, with a bounded chain.
  for (let hop = 0; hop <= 5; hop++) {
    expect(visited.has(url.href), 'Redirect chain must not loop').toBe(false)
    visited.add(url.href)
    const response = await request.get(url.href, { maxRedirects: 0 })

    if ([301, 302, 303, 307, 308].includes(response.status())) {
      const location = response.headers()['location']
      expect(location, 'Redirect response must provide Location').toBeTruthy()
      url = new URL(location, url)
      expect(url.protocol, 'Redirects must stay on HTTPS').toBe('https:')
      continue
    }

    expect(url.href).toBe(destination)
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toContain('text/html')
    return
  }

  throw new Error('Redirect chain exceeded five redirects')
})
