import { campaignPublic, eurRegion } from '@core/journeys/ui/Campaign/testData'
import type { CampaignPublic } from '@core/journeys/ui/Campaign/types'

import { CampaignPageKind } from '../../../__generated__/globalTypes'
import { logger } from '../logger'

import { inMemoryCampaignReader } from './inMemoryCampaignReader'
import { resolveCampaignPage } from './resolveCampaignPage'
import type {
  CampaignPageRequest,
  CampaignReader,
  CampaignTarget
} from './resolveCampaignPage'

const SLUG = campaignPublic.slug
const HOSTNAME = 'outreach.example.org'

const french: CampaignPublic = {
  ...campaignPublic,
  languageId: '496',
  language: { __typename: 'Language', id: '496', bcp47: 'fr' },
  title: 'Campagne 2026'
}

const draftOrUnknown = inMemoryCampaignReader([])

function readerAt(
  target: CampaignTarget,
  inLanguage: Record<string, CampaignPublic> = { '496': french }
): ReturnType<typeof vi.fn<CampaignReader>> {
  return vi.fn(
    inMemoryCampaignReader([{ target, inDefault: campaignPublic, inLanguage }])
  )
}

function abortError(): DOMException {
  return new DOMException('The operation was aborted.', 'AbortError')
}

describe('resolveCampaignPage', () => {
  beforeEach(() => {
    vi.spyOn(logger, 'error').mockImplementation(() => undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe.each([
    ['root', { slug: SLUG }, `/campaign/${SLUG}`],
    ['host', { hostname: HOSTNAME }, '']
  ] as Array<[string, CampaignTarget, string]>)(
    'on a %s target',
    (_name, target, basePath) => {
      function request(
        overrides: Omit<CampaignPageRequest, 'target'> = {}
      ): CampaignPageRequest {
        return { target, ...overrides }
      }

      it('resolves the landing page in the campaign default after one read', async () => {
        const read = readerAt(target)

        expect(await resolveCampaignPage(request(), read)).toEqual({
          kind: 'page',
          campaign: campaignPublic,
          pageKind: CampaignPageKind.landing,
          region: null
        })
        expect(read).toHaveBeenCalledTimes(1)
        expect(read).toHaveBeenCalledWith(target)
      })

      it('resolves a region page', async () => {
        expect(
          await resolveCampaignPage(
            request({ segment: eurRegion.slug }),
            readerAt(target)
          )
        ).toEqual({
          kind: 'page',
          campaign: campaignPublic,
          pageKind: CampaignPageKind.regionTemplate,
          region: eurRegion
        })
      })

      it('resolves a region page in the Page Language the tag names, from a second read', async () => {
        const read = readerAt(target)

        expect(
          await resolveCampaignPage(
            request({ segment: eurRegion.slug, language: 'fr' }),
            read
          )
        ).toEqual(expect.objectContaining({ kind: 'page', campaign: french }))
        expect(read).toHaveBeenLastCalledWith(target, '496')
      })

      it('reads again in the default when it is not the Watch text language', async () => {
        const inFrench = { ...french, defaultLanguageId: '496' }
        const read = vi.fn(
          inMemoryCampaignReader([
            { target, inDefault: inFrench, inLanguage: { '496': inFrench } }
          ])
        )

        await resolveCampaignPage(request(), read)

        expect(read).toHaveBeenCalledTimes(2)
        expect(read).toHaveBeenLastCalledWith(target, '496')
      })

      it('falls back to the plain page for a tag that is not a campaign language', async () => {
        expect(
          await resolveCampaignPage(
            request({ segment: eurRegion.slug, language: 'de' }),
            readerAt(target)
          )
        ).toEqual({
          kind: 'languageFallback',
          destination: `${basePath}/${eurRegion.slug}`,
          campaignId: campaignPublic.id
        })
        expect(
          await resolveCampaignPage(
            request({ language: 'de' }),
            readerAt(target)
          )
        ).toEqual(
          expect.objectContaining({
            destination: basePath === '' ? '/' : basePath
          })
        )
      })
    }
  )

  describe('on a root target', () => {
    const target = { slug: SLUG }

    it('is not found for a draft or unknown campaign', async () => {
      expect(await resolveCampaignPage({ target }, draftOrUnknown)).toEqual({
        kind: 'notFound'
      })
    })

    it('is not found for a region the campaign does not have', async () => {
      expect(
        await resolveCampaignPage(
          { target, segment: 'no-such-region' },
          readerAt(target)
        )
      ).toEqual({ kind: 'notFound' })
    })

    it('is not found for a region gone by the second read', async () => {
      const read = readerAt(target, {
        '496': { ...french, regions: [] }
      })

      expect(
        await resolveCampaignPage(
          { target, segment: eurRegion.slug, language: 'fr' },
          read
        )
      ).toEqual({ kind: 'notFound' })
      expect(read).toHaveBeenCalledTimes(2)
    })

    it.each([
      ['a failed read', new Error('socket hang up')],
      ['a timed-out read', abortError()]
    ])('rethrows %s, so ISR keeps the last good page', async (_name, error) => {
      const read = vi.fn<CampaignReader>().mockRejectedValue(error)

      await expect(resolveCampaignPage({ target }, read)).rejects.toBe(error)
      expect(logger.error).not.toHaveBeenCalled()
    })
  })

  describe('on a host target', () => {
    const target = { hostname: HOSTNAME }

    it('is not a campaign when the host has no published campaign', async () => {
      expect(await resolveCampaignPage({ target }, draftOrUnknown)).toEqual({
        kind: 'notACampaign'
      })
    })

    it('is not a campaign for a journey slug, after one read', async () => {
      const read = readerAt(target)

      expect(
        await resolveCampaignPage(
          { target, segment: 'my-journey', language: 'fr' },
          read
        )
      ).toEqual({ kind: 'notACampaign' })
      expect(read).toHaveBeenCalledTimes(1)
    })

    it('is not a campaign for a segment the viewer reserves, even if a region took it', async () => {
      const read = vi.fn(
        inMemoryCampaignReader([
          {
            target,
            inDefault: {
              ...campaignPublic,
              regions: [{ ...eurRegion, slug: 'embed' }]
            }
          }
        ])
      )

      expect(
        await resolveCampaignPage({ target, segment: 'embed' }, read)
      ).toEqual({ kind: 'notACampaign' })
    })

    it('is not a campaign for a region gone by the second read', async () => {
      const read = readerAt(target, { '496': { ...french, regions: [] } })

      expect(
        await resolveCampaignPage(
          { target, segment: eurRegion.slug, language: 'fr' },
          read
        )
      ).toEqual({ kind: 'notACampaign' })
      expect(read).toHaveBeenCalledTimes(2)
    })

    it.each([
      ['a failed read', new Error('socket hang up')],
      ['a timed-out read', abortError()]
    ])('is not a campaign after %s, which is logged', async (_name, error) => {
      const read = vi.fn<CampaignReader>().mockRejectedValue(error)

      expect(
        await resolveCampaignPage({ target, segment: 'my-journey' }, read)
      ).toEqual({ kind: 'notACampaign' })
      expect(logger.error).toHaveBeenCalledTimes(1)
      expect(logger.error).toHaveBeenCalledWith(
        { err: error, hostname: HOSTNAME, segment: 'my-journey' },
        'campaign root read failed'
      )
    })
  })
})
