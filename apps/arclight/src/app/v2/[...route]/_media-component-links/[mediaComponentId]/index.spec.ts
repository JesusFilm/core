import { OpenAPIHono } from '@hono/zod-openapi'
import { print } from 'graphql'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getApolloClient } from '../../../../../lib/apolloClient'

import { mediaComponentLinksWithId } from './index'

vi.mock('../../../../../lib/apolloClient', () => ({
  getApolloClient: vi.fn()
}))

const queryMock = vi.fn()
vi.mocked(getApolloClient).mockReturnValue({ query: queryMock } as never)

const app = new OpenAPIHono()
app.route('/media-component-links/:mediaComponentId', mediaComponentLinksWithId)

interface FakeVariant {
  hls: string | null
  dash?: string | null
  lengthInMilliseconds: number
  language: { id: string; bcp47: string }
  downloadable: boolean
  downloads: Array<{ quality: string; size: number }>
}

function relatedVideo(id: string, variant: FakeVariant | null) {
  return {
    id,
    label: 'episode',
    primaryLanguageId: '529',
    images: [],
    title: [{ value: id, language: { bcp47: 'en' } }],
    description: [],
    snippet: [],
    studyQuestions: [],
    bibleCitations: [],
    childrenCount: 0,
    availableLanguages: ['529'],
    variants: variant == null ? [] : [variant]
  }
}

const english = { id: '529', bcp47: 'en' }
const withDownloads: FakeVariant = {
  hls: 'https://example.com/v.m3u8',
  dash: null,
  lengthInMilliseconds: 1000,
  language: english,
  downloadable: true,
  downloads: [{ quality: 'low', size: 100 }]
}

// One variant per case, each used as a child (contains) and as a parent
// (containedBy) so both embedded lists apply the same rule.
const cases: Array<[string, FakeVariant | null, boolean]> = [
  ['flag, HLS and a download row', withDownloads, true],
  [
    'a DASH-only stream with a download row',
    { ...withDownloads, hls: '', dash: 'https://example.com/v.mpd' },
    true
  ],
  ['the flag and HLS but no download rows', { ...withDownloads, downloads: [] }, false],
  [
    'the flag and download rows but no HLS or DASH (generated parent variant)',
    { ...withDownloads, hls: '', dash: '' },
    false
  ],
  ['a false flag', { ...withDownloads, downloadable: false }, false],
  ['no variant', null, false]
]

describe('GET /media-component-links/:mediaComponentId', () => {
  beforeEach(() => {
    queryMock.mockReset()
  })

  it.each(cases)(
    'reports isDownloadable consistently for contains and containedBy with %s',
    async (_name, variant, expected) => {
      queryMock.mockResolvedValue({
        data: {
          video: {
            id: 'series-1',
            availableLanguages: ['529'],
            children: [relatedVideo('child-1', variant)],
            parents: [relatedVideo('parent-1', variant)]
          }
        }
      })

      const res = await app.request(
        '/media-component-links/series-1?expand=mediaComponents'
      )

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body._embedded.contains[0]).toMatchObject({
        mediaComponentId: 'child-1',
        isDownloadable: expected
      })
      expect(body._embedded.containedBy[0]).toMatchObject({
        mediaComponentId: 'parent-1',
        isDownloadable: expected
      })
    }
  )

  it('asks for the DASH url so the rule can see a DASH-only variant', async () => {
    queryMock.mockResolvedValue({
      data: {
        video: {
          id: 'series-1',
          availableLanguages: ['529'],
          children: [],
          parents: []
        }
      }
    })

    await app.request('/media-component-links/series-1')

    // One selection for the children and one for the parents.
    const { query } = queryMock.mock.calls[0][0]
    expect(print(query).match(/\bdash\b/g)).toHaveLength(2)
  })
})
