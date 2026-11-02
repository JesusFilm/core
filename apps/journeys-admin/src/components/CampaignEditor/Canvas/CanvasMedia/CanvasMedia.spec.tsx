import { render, screen } from '@testing-library/react'

import { watchParentVideoBlock } from '@core/journeys/ui/Campaign/testData'

import {
  CampaignStringKey,
  CampaignTextSource
} from '../../../../../__generated__/globalTypes'
import { campaign, withEmptyTranslations } from '../../data'
import { StaticEditor } from '../../testing'

import { CanvasMedia } from './CanvasMedia'

function renderMedia(
  word: string,
  previewLanguageId = campaign.defaultLanguageId
): void {
  const source = {
    ...campaign,
    strings: campaign.strings.map((string) =>
      string.key === CampaignStringKey.videos
        ? {
            ...string,
            value: word,
            valueTranslations: [
              {
                __typename: 'TranslatedValue' as const,
                languageId: '496',
                value: 'films en français',
                source: CampaignTextSource.human
              }
            ]
          }
        : string
    )
  }

  render(
    <StaticEditor campaignProp={source} initialState={{ previewLanguageId }}>
      <CanvasMedia media={withEmptyTranslations(watchParentVideoBlock)} />
    </StaticEditor>
  )
}

describe('CanvasMedia playlist wording', () => {
  it('shows the edited videos wording on the media slot preview', () => {
    renderMedia('films')

    expect(screen.getByText('61 films')).toBeInTheDocument()
  })

  it('places the count where the campaign wording requests it', () => {
    renderMedia('Films: {{count}}')

    expect(screen.getByText('Films: 61')).toBeInTheDocument()
  })

  it('reads the wording in the preview language', () => {
    renderMedia('films', '496')

    expect(screen.getByText('61 films en français')).toBeInTheDocument()
  })

  it('uses the same interface fallback as the public page for blank wording', () => {
    renderMedia(' ')

    expect(screen.getByText('61 videos')).toBeInTheDocument()
  })
})
