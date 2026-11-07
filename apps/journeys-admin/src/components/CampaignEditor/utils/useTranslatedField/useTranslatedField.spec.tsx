import { MockLink } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import { imageSectionBlock } from '@core/journeys/ui/Campaign/testData'

import { GetCampaign_campaign_blocks_CampaignImageBlock as CampaignImageBlock } from '../../../../../__generated__/GetCampaign'
import { CampaignTextSource } from '../../../../../__generated__/globalTypes'
import { CAMPAIGN_TRANSLATION_SET } from '../../../../libs/useCampaignTranslationSetMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaignWithColumns, withEmptyTranslations } from '../../data'
import { blockUpdateMock } from '../../styleTesting'
import { PreviewLanguageSwitch, QueriedEditor } from '../../testing'

import { useTranslatedField } from './useTranslatedField'

const image = {
  ...withEmptyTranslations(imageSectionBlock),
  id: 'imageId',
  altTranslations: [
    {
      __typename: 'TranslatedValue' as const,
      languageId: '21028',
      value: 'Una familia que lee',
      source: CampaignTextSource.human
    }
  ]
} as CampaignImageBlock

const campaignWithImage = {
  ...campaignWithColumns,
  blocks: [...campaignWithColumns.blocks, image]
}

function translationMock(value: string) {
  return {
    request: {
      query: CAMPAIGN_TRANSLATION_SET,
      variables: {
        input: {
          target: { blockId: 'imageId' },
          field: 'alt',
          languageId: '496',
          value
        }
      }
    },
    result: vi.fn(() => ({
      data: {
        campaignTranslationSet: [
          ...image.altTranslations,
          {
            __typename: 'TranslatedValue',
            languageId: '496',
            value,
            source: 'human'
          }
        ]
      }
    }))
  }
}

function AltField({ block }: { block: CampaignImageBlock }): ReactElement {
  const alt = useTranslatedField({ block, field: 'alt' })
  return (
    <>
      <input
        aria-label="Alt"
        value={alt.value}
        placeholder={alt.translating ? alt.fallback : undefined}
        onChange={(event) => alt.onChange(event.target.value)}
        onBlur={alt.onBlur}
      />
      <span data-testid="AltError">{alt.error ?? ''}</span>
    </>
  )
}

/** The field over the image as the cache holds it, and its cached translations. */
function CachedAltField(): ReactElement | null {
  const { campaign } = useCampaignEditor()
  const block = campaign.blocks.find((candidate) => candidate.id === 'imageId')
  if (block?.__typename !== 'CampaignImageBlock') return null
  return (
    <>
      <AltField block={block} />
      <span data-testid="CachedAlt">{block.alt}</span>
      <span data-testid="CachedAltTranslations">
        {block.altTranslations
          .map((entry) => `${entry.languageId}:${entry.value}`)
          .join('|')}
      </span>
    </>
  )
}

function renderField(
  mocks: MockLink.MockedResponse[],
  previewLanguageId: string
): void {
  render(
    <QueriedEditor
      campaign={campaignWithImage}
      initialState={{ previewLanguageId }}
      mocks={mocks}
    >
      <PreviewLanguageSwitch languageIds={['529', '496']} />
      <CachedAltField />
    </QueriedEditor>
  )
}

describe('useTranslatedField', () => {
  it('commits a translation, and no block update, in a non-default Preview Language', async () => {
    const translation = translationMock('Lecture en famille')
    const update = blockUpdateMock(image, { alt: 'Lecture en famille' })
    renderField([translation, update], '496')

    const alt = await screen.findByRole('textbox', { name: 'Alt' })
    expect(alt).toHaveValue('')
    expect(alt).toHaveAttribute('placeholder', 'A family reading together')
    fireEvent.change(alt, { target: { value: ' Lecture en famille ' } })
    fireEvent.blur(alt)

    await waitFor(() => expect(translation.result).toHaveBeenCalled())
    expect(update.result).not.toHaveBeenCalled()
    await waitFor(() =>
      expect(screen.getByTestId('CachedAltTranslations')).toHaveTextContent(
        '21028:Una familia que lee|496:Lecture en famille'
      )
    )
    expect(screen.getByTestId('CachedAlt')).toHaveTextContent(
      'A family reading together'
    )
  })

  it('commits a block update, and no translation, in the default language', async () => {
    const translation = translationMock('Readers')
    const update = blockUpdateMock(image, { alt: 'Readers' })
    renderField([translation, update], '529')

    const alt = await screen.findByRole('textbox', { name: 'Alt' })
    expect(alt).toHaveValue('A family reading together')
    fireEvent.change(alt, { target: { value: 'Readers' } })
    fireEvent.blur(alt)

    await waitFor(() => expect(update.result).toHaveBeenCalled())
    expect(translation.result).not.toHaveBeenCalled()
    await waitFor(() =>
      expect(screen.getByTestId('CachedAlt')).toHaveTextContent('Readers')
    )
  })

  it('drops an uncommitted draft and the error when the Preview Language changes', async () => {
    renderField([], '496')

    const alt = await screen.findByRole('textbox', { name: 'Alt' })
    fireEvent.change(alt, { target: { value: 'x'.repeat(501) } })
    fireEvent.blur(alt)
    expect(screen.getByTestId('AltError')).toHaveTextContent(
      'Max 500 characters'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Preview 529' }))

    await waitFor(() => expect(alt).toHaveValue('A family reading together'))
    expect(screen.getByTestId('AltError')).toHaveTextContent('')
  })
})
