import { MockedProvider } from '@apollo/client/testing/react'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactElement, ReactNode } from 'react'

import {
  LANDING_PAGE_ID,
  featuredMediaSectionBlock,
  imageSectionBlock,
  journeyCard,
  youTubeVideoBlock
} from '@core/journeys/ui/Campaign/testData'

import { CampaignTextSource } from '../../../__generated__/globalTypes'
import {
  campaignWithColumns,
  eurRegion,
  withEmptyTranslations
} from '../../components/CampaignEditor/data'
import {
  campaignCache,
  getCampaignMockFor
} from '../../components/CampaignEditor/testing'

import { useCampaignQuery } from './useCampaignQuery'

function translated(value: string): unknown[] {
  return [
    {
      __typename: 'TranslatedValue',
      languageId: '496',
      value,
      source: CampaignTextSource.human
    }
  ]
}

/** One block of every kind that carries translatable text, each with a French translation per field. */
const translatedBlocks = [
  {
    ...withEmptyTranslations(campaignWithColumns.blocks.at(-1)!),
    titleTranslations: translated('Notre histoire'),
    richTextContentTranslations: translated('Premier.')
  },
  {
    ...withEmptyTranslations(featuredMediaSectionBlock),
    eyebrowTranslations: translated('Pourquoi'),
    titleTranslations: translated('Une histoire'),
    descriptionTranslations: translated('Des films'),
    bulletsTranslations: translated('Gratuit')
  },
  {
    ...withEmptyTranslations(
      journeyCard({
        id: 'journeyCardId',
        parentBlockId: 'heroId',
        pageId: LANDING_PAGE_ID
      })
    ),
    titleTranslations: translated('Campagne'),
    descriptionTranslations: translated('Un voyage')
  },
  {
    ...withEmptyTranslations({ ...youTubeVideoBlock }),
    titleTranslations: translated('Une vidéo'),
    descriptionTranslations: translated('La description')
  },
  {
    ...withEmptyTranslations(imageSectionBlock),
    altTranslations: translated('Une famille')
  }
]

const translatedCampaign = {
  ...campaignWithColumns,
  blocks: [
    ...campaignWithColumns.blocks.filter(
      (block) => block.id !== 'slotRichTextId'
    ),
    ...translatedBlocks
  ],
  regions: [{ ...eurRegion, nameTranslations: translated('Europe') }]
}

function wrapper({ children }: { children: ReactNode }): ReactElement {
  return (
    <MockedProvider
      mocks={[getCampaignMockFor(translatedCampaign as never)] as never}
      cache={campaignCache()}
    >
      {children}
    </MockedProvider>
  )
}

describe('useCampaignQuery', () => {
  it('reads every translatable field of every block and the region name', async () => {
    const { result } = renderHook(
      () => useCampaignQuery({ id: 'campaignId' }),
      {
        wrapper
      }
    )
    await waitFor(() => expect(result.current.data?.campaign).toBeDefined())

    const blocks = result.current.data?.campaign.blocks as unknown as Array<
      Record<string, unknown>
    >
    const block = (id: string): Record<string, unknown> =>
      blocks.find((candidate) => candidate.id === id) ?? {}
    expect(block('slotRichTextId')).toMatchObject({
      titleTranslations: translated('Notre histoire'),
      richTextContentTranslations: translated('Premier.')
    })
    expect(block('featuredMediaId')).toMatchObject({
      eyebrowTranslations: translated('Pourquoi'),
      titleTranslations: translated('Une histoire'),
      descriptionTranslations: translated('Des films'),
      bulletsTranslations: translated('Gratuit')
    })
    expect(block('journeyCardId')).toMatchObject({
      titleTranslations: translated('Campagne'),
      descriptionTranslations: translated('Un voyage')
    })
    expect(block(youTubeVideoBlock.id)).toMatchObject({
      titleTranslations: translated('Une vidéo'),
      descriptionTranslations: translated('La description')
    })
    expect(block(imageSectionBlock.id)).toMatchObject({
      altTranslations: translated('Une famille')
    })
    expect(result.current.data?.campaign.regions[0].nameTranslations).toEqual(
      translated('Europe')
    )
  })
})
