import { CombinedGraphQLErrors, InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { ReactNode } from 'react'

import { CAMPAIGN_PUBLIC_BLOCK_FIELDS } from '@core/journeys/ui/Campaign'
import {
  featuredMediaSectionBlock,
  imageSectionBlock,
  youTubeVideoBlock
} from '@core/journeys/ui/Campaign/testData'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../__generated__/GetCampaign'
import {
  ButtonVariant,
  CampaignColumnsRatio,
  CampaignJourneyListDisplay,
  CampaignMediaSide,
  CampaignSwitcherVariant,
  TypographyVariant
} from '../../../__generated__/globalTypes'
import {
  campaignWithColumns,
  withEmptyTranslations
} from '../../components/CampaignEditor/data'
import { campaignCache } from '../../components/CampaignEditor/testing'
import { CAMPAIGN_BLOCK_TRANSLATION_FIELDS } from '../useCampaignQuery'

import {
  CAMPAIGN_BLOCK_UPDATE_DOCUMENTS,
  CampaignBlockUpdateInput,
  CampaignUpdatableBlock,
  CampaignUpdateTypename,
  campaignBlockUpdateOperation,
  readCampaignBlockRow,
  useCampaignBlockUpdateMutation
} from './useCampaignBlockUpdateMutation'

const blocks: CampaignBlock[] = [
  ...campaignWithColumns.blocks,
  withEmptyTranslations(imageSectionBlock),
  withEmptyTranslations(youTubeVideoBlock),
  withEmptyTranslations(featuredMediaSectionBlock)
]

function fixture<T extends CampaignUpdateTypename>(
  id: string
): CampaignUpdatableBlock<T> {
  const block = blocks.find((candidate) => candidate.id === id)
  if (block == null) throw new Error(`no fixture block ${id}`)
  return block as CampaignUpdatableBlock<T>
}

/** Write a block into the cache with the two fragments the editor reads it through. */
function seed(cache: InMemoryCache, block: CampaignBlock): void {
  const id = cache.identify({ __typename: block.__typename, id: block.id })
  cache.writeFragment({
    id,
    fragment: CAMPAIGN_PUBLIC_BLOCK_FIELDS,
    fragmentName: 'CampaignPublicBlockFields',
    data: block
  })
  cache.writeFragment({
    id,
    fragment: CAMPAIGN_BLOCK_TRANSLATION_FIELDS,
    fragmentName: 'CampaignBlockTranslationFields',
    data: block
  })
}

function refOf(block: { __typename: string; id: string }): {
  __typename: string
  id: string
} {
  return { __typename: block.__typename, id: block.id }
}

function seededCache(): InMemoryCache {
  const cache = campaignCache()
  for (const block of blocks) {
    if (block.__typename === 'CampaignColumnBlock') continue
    seed(cache, block)
  }
  return cache
}

function updateMock<B extends CampaignUpdatableBlock>(
  block: B,
  input: CampaignBlockUpdateInput<B['__typename']>,
  row: object
): Record<string, unknown> {
  return {
    request: {
      query: CAMPAIGN_BLOCK_UPDATE_DOCUMENTS[block.__typename],
      variables: { id: block.id, input }
    },
    result: { data: { [campaignBlockUpdateOperation(block.__typename)]: row } },
    delay: 50
  }
}

function renderModule(
  cache: InMemoryCache,
  mocks: Array<Record<string, unknown>>
): ReturnType<
  typeof renderHook<ReturnType<typeof useCampaignBlockUpdateMutation>, unknown>
> {
  return renderHook(() => useCampaignBlockUpdateMutation(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MockedProvider cache={cache} mocks={mocks as never}>
        {children}
      </MockedProvider>
    )
  })
}

function cached(
  cache: InMemoryCache,
  block: CampaignUpdatableBlock
): Record<string, unknown> | undefined {
  return readCampaignBlockRow(cache, block) as
    | Record<string, unknown>
    | undefined
}

interface TypenameCase {
  id: string
  input: Record<string, unknown>
  /** The columns the optimistic row changes. */
  applied: Record<string, unknown>
}

const TYPENAME_CASES: Record<CampaignUpdateTypename, TypenameCase> = {
  CampaignTypographyBlock: {
    id: 'journeyListNoteId',
    input: { variant: TypographyVariant.h2 },
    applied: { typographyVariant: TypographyVariant.h2 }
  },
  CampaignButtonBlock: {
    id: 'heroButtonId',
    input: { variant: ButtonVariant.text },
    applied: { buttonVariant: ButtonVariant.text }
  },
  CampaignHeroBlock: {
    id: 'heroId',
    input: { title: 'A new title' },
    applied: { title: 'A new title' }
  },
  CampaignRegionSwitcherBlock: {
    id: 'landingSwitcherId',
    input: { variant: CampaignSwitcherVariant.pills },
    applied: { switcherVariant: CampaignSwitcherVariant.pills }
  },
  CampaignVideoCarouselBlock: {
    id: 'carouselId',
    input: { title: 'Films for every home' },
    applied: { title: 'Films for every home' }
  },
  CampaignJourneyListBlock: {
    id: 'landingJourneyListId',
    input: { display: CampaignJourneyListDisplay.list },
    applied: { display: CampaignJourneyListDisplay.list }
  },
  CampaignJourneyBlock: {
    id: 'landingJourneyId',
    input: { description: 'Retold' },
    applied: { description: 'Retold', snapshotEdited: true }
  },
  CampaignAnalyticsBlock: {
    id: 'landingAnalyticsId',
    input: { eyebrow: 'Reach' },
    applied: { eyebrow: 'Reach' }
  },
  CampaignRegionHeaderBlock: {
    id: 'regionHeaderId',
    input: { intro: 'Welcome' },
    applied: { intro: 'Welcome' }
  },
  CampaignRegionShareBlock: {
    id: 'regionShareId',
    input: { title: 'Share it' },
    applied: { title: 'Share it' }
  },
  CampaignRichTextBlock: {
    id: 'slotRichTextId',
    input: { content: 'New story' },
    applied: { richTextContent: 'New story' }
  },
  CampaignColumnsBlock: {
    id: 'columnsId',
    input: { ratio: CampaignColumnsRatio.wideRight },
    applied: { ratio: CampaignColumnsRatio.wideRight }
  },
  CampaignImageBlock: {
    id: 'imageSectionId',
    input: { alt: 'Readers' },
    applied: { alt: 'Readers' }
  },
  CampaignVideoBlock: {
    id: 'youTubeVideoId',
    input: { title: 'Outreach' },
    applied: { title: 'Outreach' }
  },
  CampaignFeaturedMediaBlock: {
    id: 'featuredMediaId',
    input: { mediaSide: CampaignMediaSide.right },
    applied: { mediaSide: CampaignMediaSide.right }
  },
  CampaignHeaderBlock: {
    id: 'headerId',
    input: { headingColor: '#112233' },
    applied: { headingColor: '#112233' }
  },
  CampaignFooterBlock: {
    id: 'footerId',
    input: { textColor: '#445566' },
    applied: { textColor: '#445566' }
  }
}

describe('useCampaignBlockUpdateMutation', () => {
  describe.each(Object.entries(TYPENAME_CASES))(
    '%s',
    (typename, { id, input, applied }) => {
      it('shows the block as cached when sent with the input applied, then resolves with the server row', async () => {
        const cache = seededCache()
        // The block as the caller held it when the edit was made…
        const stale = fixture(id)
        expect(stale.__typename).toBe(typename)
        // …and a sibling field changed in the cache since.
        cache.modify({
          id: cache.identify({ __typename: typename, id }),
          fields: { parentOrder: () => 42 }
        })
        const serverRow = { ...stale, ...applied, parentOrder: 43 }
        const { result } = renderModule(cache, [
          updateMock(stale, input, serverRow)
        ])

        let resolved: Promise<unknown> = Promise.resolve()
        act(() => {
          resolved = result.current.update(stale, input)
        })

        await waitFor(() =>
          expect(cached(cache, stale)).toEqual({
            ...stale,
            ...applied,
            parentOrder: 42
          })
        )
        await expect(resolved).resolves.toEqual(serverRow)
        expect(cached(cache, stale)).toEqual(serverRow)
      })
    }
  )

  it('keeps a sibling text field a teammate changed after the edit was typed', async () => {
    const cache = seededCache()
    const hero = fixture<'CampaignHeroBlock'>('heroId')
    cache.modify({
      id: cache.identify(refOf(hero)),
      fields: { description: () => 'A teammate’s description' }
    })
    const { result } = renderModule(cache, [
      updateMock(hero, { title: 'Undone title' }, hero)
    ])

    act(() => {
      void result.current.update(hero, { title: 'Undone title' })
    })

    await waitFor(() =>
      expect(cached(cache, hero)).toMatchObject({
        title: 'Undone title',
        description: 'A teammate’s description'
      })
    )
  })

  it('clears the size of an image whose src changes, and keeps it for the same src', async () => {
    const cache = seededCache()
    const image = fixture<'CampaignImageBlock'>('imageSectionId')
    const newSrc = 'https://imagedelivery.net/accountHash/other/public'
    const { result } = renderModule(cache, [
      updateMock(image, { src: newSrc }, image),
      updateMock(image, { src: image.src }, image)
    ])

    act(() => {
      void result.current.update(image, { src: newSrc })
    })
    await waitFor(() =>
      expect(cached(cache, image)).toMatchObject({
        src: newSrc,
        width: null,
        height: null
      })
    )
    await waitFor(() => expect(cached(cache, image)).toEqual(image))

    act(() => {
      void result.current.update(image, { src: image.src })
    })
    await waitFor(() =>
      expect(cached(cache, image)).toMatchObject({
        src: image.src,
        width: image.width,
        height: image.height
      })
    )
  })

  it('marks a journey card’s snapshot edited by a text edit unless the input sets the flag, which wins', async () => {
    const cache = seededCache()
    const card = fixture<'CampaignJourneyBlock'>('landingJourneyId')
    expect(card.snapshotEdited).toBe(false)
    const restore = {
      title: card.title,
      description: card.description,
      snapshotEdited: false
    }
    const { result } = renderModule(cache, [
      updateMock(card, { title: 'Retitled' }, card),
      updateMock(card, restore, card)
    ])

    act(() => {
      void result.current.update(card, { title: 'Retitled' })
    })
    await waitFor(() =>
      expect(cached(cache, card)).toMatchObject({
        title: 'Retitled',
        snapshotEdited: true
      })
    )
    await waitFor(() => expect(cached(cache, card)).toEqual(card))

    cache.modify({
      id: cache.identify(refOf(card)),
      fields: { snapshotEdited: () => true }
    })
    act(() => {
      void result.current.update(card, restore)
    })
    await waitFor(() =>
      expect(cached(cache, card)).toMatchObject({
        title: card.title,
        snapshotEdited: false
      })
    )
  })

  it('shows no row for a Watch link, which only the server resolves, and clears the video for explicit mode', async () => {
    const cache = seededCache()
    const carousel = fixture<'CampaignVideoCarouselBlock'>('carouselId')
    cache.modify({
      id: cache.identify(refOf(carousel)),
      fields: { videoVariantLanguageId: () => '529' }
    })
    const watchUrl = 'https://www.jesusfilm.org/watch/jesus.html/english.html'
    const { result } = renderModule(cache, [
      updateMock(carousel, { url: watchUrl }, carousel),
      updateMock(carousel, { videoId: null }, carousel)
    ])
    const before = cached(cache, carousel)

    act(() => {
      void result.current.update(carousel, { url: watchUrl })
    })
    expect(cached(cache, carousel)).toEqual(before)
    await waitFor(() => expect(cached(cache, carousel)).toEqual(carousel))

    cache.modify({
      id: cache.identify(refOf(carousel)),
      fields: { videoVariantLanguageId: () => '529' }
    })
    act(() => {
      void result.current.update(carousel, { videoId: null })
    })
    await waitFor(() =>
      expect(cached(cache, carousel)).toMatchObject({
        videoId: null,
        videoVariantLanguageId: null,
        video: null
      })
    )
  })

  it('falls back to the passed block when the cache no longer holds it', async () => {
    const cache = campaignCache()
    const hero = fixture<'CampaignHeroBlock'>('heroId')
    const { result } = renderModule(cache, [
      updateMock(hero, { title: 'Replayed' }, { ...hero, title: 'Replayed' })
    ])

    act(() => {
      void result.current.update(hero, { title: 'Replayed' })
    })

    await waitFor(() =>
      expect(cached(cache, hero)).toEqual({ ...hero, title: 'Replayed' })
    )
  })

  it('rejects with the Apollo error unchanged', async () => {
    const cache = seededCache()
    const hero = fixture<'CampaignHeroBlock'>('heroId')
    const { result } = renderModule(cache, [
      {
        request: {
          query: CAMPAIGN_BLOCK_UPDATE_DOCUMENTS.CampaignHeroBlock,
          variables: { id: hero.id, input: { title: 'x'.repeat(151) } }
        },
        result: { errors: [new GraphQLError('Title is too long')] }
      }
    ])

    const error = await result.current
      .update(hero, { title: 'x'.repeat(151) })
      .catch((caught: unknown) => caught)

    expect(CombinedGraphQLErrors.is(error)).toBe(true)
    expect((error as CombinedGraphQLErrors).errors[0].message).toBe(
      'Title is too long'
    )
  })

  describe('previousFields', () => {
    it('returns the cached values of exactly the input’s keys, through the alias map', () => {
      const cache = seededCache()
      const note = fixture<'CampaignTypographyBlock'>('journeyListNoteId')
      cache.modify({
        id: cache.identify(refOf(note)),
        // The cache stores the aliased column under the API's field name.
        fields: { align: () => 'right', variant: () => 'h3' }
      })
      const { result } = renderModule(cache, [])

      expect(
        result.current.previousFields(note, {
          variant: TypographyVariant.h1,
          align: null
        })
      ).toEqual({ variant: 'h3', align: 'right' })
      expect(
        result.current.previousFields(fixture('heroButtonId'), {
          variant: ButtonVariant.outlined
        })
      ).toEqual({
        variant:
          fixture<'CampaignButtonBlock'>('heroButtonId').buttonVariant ?? null
      })
      expect(
        result.current.previousFields(fixture('slotRichTextId'), {
          content: 'x'
        })
      ).toEqual({
        content:
          fixture<'CampaignRichTextBlock'>('slotRichTextId').richTextContent
      })
    })

    it('undoes a Video Carousel’s Watch link or video by the video and language it replaced', () => {
      const cache = seededCache()
      const carousel = fixture<'CampaignVideoCarouselBlock'>('carouselId')
      cache.modify({
        id: cache.identify(refOf(carousel)),
        fields: {
          videoId: () => 'videoId',
          videoVariantLanguageId: () => '529'
        }
      })
      const { result } = renderModule(cache, [])

      expect(
        result.current.previousFields(carousel, {
          url: 'https://www.jesusfilm.org/watch/jesus.html',
          eyebrow: 'Collection'
        })
      ).toEqual({
        videoId: 'videoId',
        videoVariantLanguageId: '529',
        eyebrow: carousel.eyebrow
      })
      expect(
        result.current.previousFields(carousel, { videoId: null })
      ).toEqual({ videoId: 'videoId', videoVariantLanguageId: '529' })
    })

    it('reads the passed block when the cache does not hold it', () => {
      const hero = fixture<'CampaignHeroBlock'>('heroId')
      const { result } = renderModule(campaignCache(), [])

      expect(result.current.previousFields(hero, { minHeight: 50 })).toEqual({
        minHeight: hero.minHeight
      })
    })
  })
})
