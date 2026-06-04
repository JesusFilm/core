import { renderExplorer } from './explorer'
import type { InsightsDataset } from '../types'

const dataset: InsightsDataset = {
  summary: {
    windowFrom: '2026-05-01T00:00:00.000Z',
    windowTo: '2026-05-31T00:00:00.000Z',
    generatedAt: '2026-06-04T00:00:00.000Z',
    totalSessions: 1,
    totalMessages: 2,
    nullSessionCount: 0,
    singleTurnCount: 1,
    excludedLoadTestTurns: 0,
    suppressedKeywordCount: 2,
    themesAvailable: true
  },
  facets: [
    { key: 'keyword:resurrection', label: 'resurrection', kind: 'keyword', count: 1 }
  ],
  sessions: [
    {
      id: 's1',
      label: 'Session 001',
      synthetic: false,
      language: 'en',
      messageCount: 2,
      firstUserMessage: 'Hi',
      startTime: '2026-05-10T00:00:00.000Z',
      themes: ['Resurrection'],
      facetKeys: ['theme:Resurrection', 'keyword:resurrection'],
      messages: [
        // Hostile content: a literal </script> must not break the page.
        {
          role: 'user',
          text: 'Hi </script><img src=x onerror=alert(1)>',
          startTime: '2026-05-10T00:00:00.000Z',
          model: 'm'
        },
        {
          role: 'assistant',
          text: 'Hello',
          startTime: '2026-05-10T00:00:00.000Z',
          model: 'm'
        }
      ]
    }
  ]
}

function extractInlinedJson(html: string): string {
  const match = html.match(
    /<script type="application\/json" id="insights-data">\n([\s\S]*?)\n<\/script>/
  )
  if (match == null) throw new Error('inlined dataset script not found')
  return match[1]
}

describe('renderExplorer', () => {
  it('produces a standalone HTML document with the three panes and viewer', () => {
    const html = renderExplorer(dataset)
    expect(html.startsWith('<!doctype html>')).toBe(true)
    expect(html).toContain('id="facets"')
    expect(html).toContain('id="list"')
    expect(html).toContain('id="detail"')
    expect(html).toContain('id="insights-data"')
    // No external references — fully offline (file://-safe).
    expect(html).not.toContain('http://')
    expect(html).not.toContain('https://')
    expect(html).not.toContain('src="')
  })

  it('inlines the dataset so it round-trips through JSON.parse', () => {
    const html = renderExplorer(dataset)
    const parsed = JSON.parse(extractInlinedJson(html))
    expect(parsed).toEqual(dataset)
  })

  it('escapes < so corpus content cannot break out of the JSON script block', () => {
    const html = renderExplorer(dataset)
    // Exactly two real closing script tags (the JSON block + the viewer);
    // the hostile </script> in the corpus is escaped to \\u003c/script>.
    const closes = html.match(/<\/script>/g) ?? []
    expect(closes).toHaveLength(2)
    expect(html).toContain('\\u003c/script>')
    // And the hostile text still round-trips intact for the reader.
    const parsed = JSON.parse(extractInlinedJson(html)) as InsightsDataset
    expect(parsed.sessions[0].messages[0].text).toBe(
      'Hi </script><img src=x onerror=alert(1)>'
    )
  })
})
