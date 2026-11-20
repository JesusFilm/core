import { expect, test } from '@playwright/test'

import { getKeywordPageText } from './watch-keyword-content'

test('Watch pages serve expected keywords over HTTP', async ({ request }) => {
  const pages = [
    {
      url: 'https://www.jesusfilm.org/watch/lumo-the-gospel-of-john.html/english.html',
      keyword: 'John 14'
    },
    {
      url: 'https://www.jesusfilm.org/watch/discipleship.html/english.html',
      keyword: '7 Days With Jesus'
    },
    { url: 'https://www.jesusfilm.org/watch', keyword: 'LUMO' },
    {
      url: 'https://www.jesusfilm.org/watch/jesus.html/english.html',
      keyword: 'Gospel of Luke'
    }
  ]

  for (const { url, keyword } of pages) {
    await test.step(`Check ${keyword} on ${url}`, async () => {
      const response = await request.get(url)
      expect(response.status()).toBe(200)
      expect(response.headers()['content-type']).toContain('text/html')
      expect(getKeywordPageText(await response.text())).toContain(
        keyword.toLowerCase()
      )
    })
  }
})
