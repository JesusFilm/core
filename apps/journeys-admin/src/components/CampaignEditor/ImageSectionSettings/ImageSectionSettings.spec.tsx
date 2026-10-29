import { MockLink } from '@apollo/client/testing'
import Typography from '@mui/material/Typography'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { ReactElement } from 'react'

import { imageSectionBlock } from '@core/journeys/ui/Campaign/testData'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks_CampaignImageBlock as CampaignImageBlock
} from '../../../../__generated__/GetCampaign'
import { CampaignTextSource } from '../../../../__generated__/globalTypes'
import { CAMPAIGN_TRANSLATION_SET } from '../../../libs/useCampaignTranslationSetMutation'
import { GET_MY_CLOUDFLARE_IMAGES } from '../../Editor/Slider/Settings/Drawer/ImageBlockEditor/MediaLibrary/MediaLibrary'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { campaignWithColumns, withEmptyTranslations } from '../data'
import { WithBlock, blockUpdateMock } from '../styleTesting'
import {
  CommandProbe,
  PreviewLanguageSwitch,
  QueriedEditor,
  UndoRedo,
  holdRequests,
  landRequests
} from '../testing'

import { ImageSectionSettings } from './ImageSectionSettings'

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

const emptyImage: CampaignImageBlock = {
  ...image,
  src: null,
  width: null,
  height: null
}

const campaignWithEmptyImage = {
  ...campaignWithColumns,
  blocks: [...campaignWithColumns.blocks, emptyImage]
}

const PICKED_SRC = 'https://imagedelivery.net/accountHash/earlierId/public'

/** The team's earlier uploads, as the image picker's library lists them. */
const uploadsMock: MockLink.MockedResponse = {
  request: {
    query: GET_MY_CLOUDFLARE_IMAGES,
    variables: { offset: 0, limit: 11, isAi: false, teamId: 'teamId' }
  },
  result: {
    data: {
      getMyCloudflareImages: [
        {
          __typename: 'CloudflareImage',
          id: 'earlierId',
          url: 'https://imagedelivery.net/accountHash/earlierId',
          blurhash: null,
          userId: 'userId'
        }
      ]
    }
  }
}

/** The editor over the block as the cache currently holds it. */
function CachedImageEdit(): ReactElement | null {
  const { campaign } = useCampaignEditor()
  const block = campaign.blocks.find((candidate) => candidate.id === 'imageId')
  if (block?.__typename !== 'CampaignImageBlock') return null
  return <ImageSectionSettings block={block} />
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
  mocks: MockLink.MockedResponse[],
  previewLanguageId = '529',
  campaign: Campaign = campaignWithImage
): void {
  render(
    <QueriedEditor
      campaign={campaign}
      initialState={{ previewLanguageId }}
      mocks={mocks}
    >
      <UndoRedo />
      <CommandProbe />
      <PreviewLanguageSwitch languageIds={['529', '496']} />
      <CachedImageEdit />
      <WithBlock blockId="imageId" typename="CampaignImageBlock">
        {(block) => (
          <Typography component="span" data-testid="ImageSize">
            {`${String(block.width)}x${String(block.height)}`}
          </Typography>
        )}
      </WithBlock>
    </QueriedEditor>
  )
}

describe('ImageSectionSettings', () => {
  afterEach(() => vi.useRealTimers())

  it('reads and writes the default alt text through campaignImageBlockUpdate in the default language', async () => {
    const update = blockUpdateMock(image, { alt: 'Readers' })
    const translation = translationMock('Readers')
    renderEdit([update, translation])

    const alt = await screen.findByRole('textbox', { name: 'Alt text' })
    expect(alt).toHaveValue('A family reading together')
    fireEvent.change(alt, { target: { value: 'Readers' } })
    fireEvent.blur(alt)

    await waitFor(() => expect(update.result).toHaveBeenCalled())
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    expect(translation.result).not.toHaveBeenCalled()
  })

  it('writes a picked picture’s src as one Command, its size unknown until the server measures it', async () => {
    const pick = blockUpdateMock(image, { src: PICKED_SRC })
    renderEdit([uploadsMock, pick])
    expect(await screen.findByTestId('ImageSize')).toHaveTextContent('1600x900')

    fireEvent.click(screen.getByRole('button', { name: 'Replace image' }))
    const earlier = await screen.findByTestId('media-library-image-earlierId')
    await holdRequests(() => fireEvent.click(earlier))

    // Optimistic: the new picture shows at once, with no size yet.
    expect(
      screen.getByTestId('CampaignImageSectionEditPicture')
    ).toHaveAttribute('src', PICKED_SRC)
    expect(screen.getByTestId('ImageSize')).toHaveTextContent('nullxnull')
    expect(pick.result).not.toHaveBeenCalled()
    await landRequests()
    expect(pick.result).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    expect(
      screen.queryByTestId('CampaignSectionImagePicker')
    ).not.toBeInTheDocument()
  })

  it('writes src null on Remove and offers the picker in its place', async () => {
    const remove = blockUpdateMock(image, { src: null })
    renderEdit([remove, uploadsMock])

    fireEvent.click(await screen.findByRole('button', { name: 'Remove image' }))

    await waitFor(() => expect(remove.result).toHaveBeenCalledTimes(1))
    await waitFor(() =>
      expect(
        screen.queryByTestId('CampaignImageSectionEditPicture')
      ).not.toBeInTheDocument()
    )
    expect(screen.getByTestId('CampaignSectionImagePicker')).toBeInTheDocument()
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('shows the focal point control only once there is a picture', async () => {
    const pick = blockUpdateMock(emptyImage, { src: PICKED_SRC })
    renderEdit([uploadsMock, pick], '529', campaignWithEmptyImage)

    const earlier = await screen.findByTestId('media-library-image-earlierId')
    expect(screen.queryByTestId('FocalPointControl')).not.toBeInTheDocument()

    fireEvent.click(earlier)

    expect(await screen.findByTestId('FocalPointControl')).toBeInTheDocument()
    await waitFor(() => expect(pick.result).toHaveBeenCalledTimes(1))
  })

  it('puts the picture back when Remove is undone', async () => {
    const remove = blockUpdateMock(image, { src: null })
    const restore = blockUpdateMock(
      image,
      { src: image.src },
      { src: null, width: null, height: null }
    )
    renderEdit([remove, restore, uploadsMock])

    fireEvent.click(await screen.findByRole('button', { name: 'Remove image' }))
    await waitFor(() => expect(remove.result).toHaveBeenCalledTimes(1))
    await waitFor(() =>
      expect(screen.queryByTestId('FocalPointControl')).not.toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(restore.result).toHaveBeenCalledTimes(1))
    await waitFor(() =>
      expect(
        screen.getByTestId('CampaignImageSectionEditPicture')
      ).toHaveAttribute('src', image.src)
    )
    expect(screen.getByTestId('FocalPointControl')).toBeInTheDocument()
  })

  it('counts the alt text against its cap', async () => {
    renderEdit([])

    const alt = await screen.findByRole('textbox', { name: 'Alt text' })
    expect(screen.getByText('25 / 500')).toBeInTheDocument()

    fireEvent.change(alt, { target: { value: 'Readers' } })

    expect(screen.getByText('7 / 500')).toBeInTheDocument()
  })

  it('counts an emoji in the alt text once, as the API does', async () => {
    renderEdit([])

    const alt = await screen.findByRole('textbox', { name: 'Alt text' })
    fireEvent.change(alt, { target: { value: 'Readers 👋🏽' } })

    expect(screen.getByText('10 / 500')).toBeInTheDocument()
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
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('undoes a translated alt by writing the previous translation back', async () => {
    const write = translationMock('Lecture en famille')
    const restore = translationMock('Une famille qui lit')
    renderEdit([write, restore], '496')

    const alt = await screen.findByRole('textbox', { name: 'Alt text' })
    fireEvent.change(alt, { target: { value: 'Lecture en famille' } })
    fireEvent.blur(alt)
    await waitFor(() => expect(write.result).toHaveBeenCalled())
    await waitFor(() => expect(alt).toHaveValue('Lecture en famille'))

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(restore.result).toHaveBeenCalled())
    await waitFor(() => expect(alt).toHaveValue('Une famille qui lit'))
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

  it('drops an uncommitted draft when the Preview Language changes', async () => {
    renderEdit([], '496')

    const field = await screen.findByRole('textbox', { name: 'Alt text' })
    fireEvent.change(field, { target: { value: 'Lecture en famille' } })
    fireEvent.click(screen.getByRole('button', { name: 'Preview 529' }))

    await waitFor(() => expect(field).toHaveValue('A family reading together'))
    expect(field).not.toHaveAttribute('placeholder')
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })
})
