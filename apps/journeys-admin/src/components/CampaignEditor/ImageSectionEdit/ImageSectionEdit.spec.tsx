import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { ReactElement } from 'react'

import { imageSectionBlock } from '@core/journeys/ui/Campaign/testData'

import { GetCampaign_campaign_blocks_CampaignImageBlock as CampaignImageBlock } from '../../../../__generated__/GetCampaign'
import { CampaignTextSource } from '../../../../__generated__/globalTypes'
import { CAMPAIGN_IMAGE_BLOCK_UPDATE_MEDIA } from '../../../libs/useCampaignImageBlockUpdateMutation'
import { CAMPAIGN_TRANSLATION_SET } from '../../../libs/useCampaignTranslationSetMutation'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { campaignWithColumns, withEmptyTranslations } from '../data'
import { CommandProbe, QueriedEditor } from '../testing'

import { ImageSectionEdit } from './ImageSectionEdit'

const image = {
  ...withEmptyTranslations(imageSectionBlock),
  id: 'imageId',
  altTranslations: [
    {
      __typename: 'TranslatedValue' as const,
      languageId: '496',
      value: 'Une famille qui lit',
      source: CampaignTextSource.human
    }
  ]
} as CampaignImageBlock

const campaignWithImage = {
  ...campaignWithColumns,
  blocks: [...campaignWithColumns.blocks, image]
}

/** The editor over the block as the cache currently holds it. */
function CachedImageEdit(): ReactElement | null {
  const { campaign } = useCampaignEditor()
  const block = campaign.blocks.find((candidate) => candidate.id === 'imageId')
  if (block?.__typename !== 'CampaignImageBlock') return null
  return <ImageSectionEdit block={block} />
}

function translationMock(value: string, errors?: GraphQLError[]) {
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
    result: vi.fn(() =>
      errors != null
        ? { errors }
        : {
            data: {
              campaignTranslationSet:
                value === ''
                  ? []
                  : [
                      {
                        __typename: 'TranslatedValue',
                        languageId: '496',
                        value,
                        source: 'human'
                      }
                    ]
            }
          }
    )
  }
}

function renderEdit(
  mocks: Array<ReturnType<typeof translationMock>>,
  previewLanguageId = '529'
): void {
  render(
    <QueriedEditor
      campaignProp={campaignWithImage}
      initialState={{ previewLanguageId }}
      mocks={mocks}
    >
      <CommandProbe />
      <CachedImageEdit />
    </QueriedEditor>
  )
}

describe('ImageSectionEdit', () => {
  it('reads and writes the default alt text through campaignImageBlockUpdate in the default language', async () => {
    const update = {
      request: {
        query: CAMPAIGN_IMAGE_BLOCK_UPDATE_MEDIA,
        variables: { id: 'imageId', input: { alt: 'Readers' } }
      },
      result: vi.fn(() => ({
        data: {
          campaignImageBlockUpdate: {
            __typename: 'CampaignImageBlock',
            id: 'imageId',
            src: image.src,
            alt: 'Readers',
            width: image.width,
            height: image.height
          }
        }
      }))
    }
    const translation = translationMock('Readers')
    renderEdit([update as never, translation])

    const alt = await screen.findByRole('textbox', { name: 'Alt text' })
    expect(alt).toHaveValue('A family reading together')
    fireEvent.change(alt, { target: { value: 'Readers' } })
    fireEvent.blur(alt)

    await waitFor(() => expect(update.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    expect(translation.result).not.toHaveBeenCalled()
  })

  it('shows the previewed language’s alt translation with the default text as the placeholder', async () => {
    renderEdit([], '496')

    const alt = await screen.findByRole('textbox', { name: 'Alt text' })
    expect(alt).toHaveValue('Une famille qui lit')
    expect(alt).toHaveAttribute('placeholder', 'A family reading together')
  })

  it('writes a translation, not the default column, when previewing a non-default language', async () => {
    const translation = translationMock('Lecture en famille')
    renderEdit([translation], '496')

    const alt = await screen.findByRole('textbox', { name: 'Alt text' })
    fireEvent.change(alt, { target: { value: ' Lecture en famille ' } })
    fireEvent.blur(alt)

    await waitFor(() => expect(translation.result).toHaveBeenCalled())
    await waitFor(() => expect(alt).toHaveValue('Lecture en famille'))
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  it('clears the translation when the alt text is emptied', async () => {
    const translation = translationMock('')
    renderEdit([translation], '496')

    const alt = await screen.findByRole('textbox', { name: 'Alt text' })
    fireEvent.change(alt, { target: { value: '' } })
    fireEvent.blur(alt)

    await waitFor(() => expect(translation.result).toHaveBeenCalled())
    await waitFor(() => expect(alt).toHaveValue(''))
  })

  it('shows the API message and restores the alt text when the translation fails', async () => {
    const translation = translationMock('Lecture', [
      new GraphQLError('alt must be at most 500 characters')
    ])
    renderEdit([translation], '496')

    const alt = await screen.findByRole('textbox', { name: 'Alt text' })
    fireEvent.change(alt, { target: { value: 'Lecture' } })
    fireEvent.blur(alt)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'alt must be at most 500 characters'
    )
    expect(alt).toHaveValue('Une famille qui lit')
  })
})
