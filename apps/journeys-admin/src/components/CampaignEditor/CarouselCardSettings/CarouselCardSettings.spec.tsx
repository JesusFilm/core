import { MockLink } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { ReactElement } from 'react'

import { youTubeVideoBlock } from '@core/journeys/ui/Campaign/testData'

import { CampaignTextSource } from '../../../../__generated__/globalTypes'
import { CAMPAIGN_VIDEO_BLOCK_UPDATE } from '../../../libs/useCampaignBlockUpdateMutation'
import { CAMPAIGN_TRANSLATION_SET } from '../../../libs/useCampaignTranslationSetMutation'
import { CampaignVideoBlock } from '../../../libs/useCampaignVideoBlockCreateMutation'
import { useCampaignEditor } from '../CampaignEditorProvider'
import { campaign, withEmptyTranslations } from '../data'
import { blockUpdateMock } from '../styleTesting'
import {
  CommandProbe,
  PreviewLanguageSwitch,
  QueriedEditor,
  UndoRedo,
  holdRequests,
  landRequests
} from '../testing'

import { CarouselCardSettings } from './CarouselCardSettings'

const card = {
  ...withEmptyTranslations(youTubeVideoBlock),
  id: 'cardId',
  parentBlockId: 'carouselId',
  parentOrder: 0,
  titleTranslations: [
    {
      __typename: 'TranslatedValue' as const,
      languageId: '496',
      value: 'Campagne autour du monde',
      source: CampaignTextSource.human
    }
  ]
} as CampaignVideoBlock

const campaignWithCard = {
  ...campaign,
  blocks: [...campaign.blocks, card]
}

/** The editor over the block as the cache currently holds it. */
function CachedCardEdit(): ReactElement | null {
  const { campaign: current } = useCampaignEditor()
  const block = current.blocks.find((candidate) => candidate.id === 'cardId')
  if (block?.__typename !== 'CampaignVideoBlock') return null
  return <CarouselCardSettings block={block} />
}

function translationMock(
  field: 'title' | 'description',
  value: string,
  languageId = '496'
) {
  return {
    request: {
      query: CAMPAIGN_TRANSLATION_SET,
      variables: {
        input: { target: { blockId: 'cardId' }, field, languageId, value }
      }
    },
    result: vi.fn(() => ({
      data: {
        campaignTranslationSet:
          value === ''
            ? []
            : [
                {
                  __typename: 'TranslatedValue',
                  languageId,
                  value,
                  source: 'human'
                }
              ]
      }
    }))
  }
}

function renderEdit(
  mocks: MockLink.MockedResponse[],
  previewLanguageId = '529'
): void {
  render(
    <QueriedEditor
      campaign={campaignWithCard}
      initialState={{ previewLanguageId }}
      mocks={mocks}
    >
      <UndoRedo />
      <CommandProbe />
      <PreviewLanguageSwitch languageIds={['529', '496']} />
      <CachedCardEdit />
    </QueriedEditor>
  )
}

describe('CarouselCardSettings', () => {
  afterEach(() => vi.useRealTimers())

  it('writes the default title through campaignVideoBlockUpdate in the default language', async () => {
    const update = {
      request: {
        query: CAMPAIGN_VIDEO_BLOCK_UPDATE,
        variables: { id: 'cardId', input: { title: 'Outreach' } }
      },
      result: vi.fn(() => ({
        data: {
          campaignVideoBlockUpdate: { ...card, title: 'Outreach' }
        }
      }))
    }
    const translation = translationMock('title', 'Outreach')
    renderEdit([update, translation])

    const title = await screen.findByRole('textbox', { name: 'Title' })
    expect(title).toHaveValue('Outreach around the world')
    fireEvent.change(title, { target: { value: 'Outreach' } })
    fireEvent.blur(title)

    await waitFor(() => expect(update.result).toHaveBeenCalled())
    expect(translation.result).not.toHaveBeenCalled()
  })

  it('counts an emoji in the title once, as the API does', async () => {
    renderEdit([])

    const title = await screen.findByRole('textbox', { name: 'Title' })
    expect(screen.getByText('25 / 200')).toBeInTheDocument()
    fireEvent.change(title, { target: { value: 'Outreach 👋' } })

    expect(screen.getByText('10 / 200')).toBeInTheDocument()
  })

  it('does not save a title over its cap', async () => {
    const update = {
      request: {
        query: CAMPAIGN_VIDEO_BLOCK_UPDATE,
        variables: { id: 'cardId', input: { title: 'x'.repeat(201) } }
      },
      result: vi.fn(() => ({
        data: { campaignVideoBlockUpdate: { ...card, title: 'x'.repeat(201) } }
      }))
    }
    renderEdit([update])

    const title = await screen.findByRole('textbox', { name: 'Title' })
    fireEvent.change(title, { target: { value: 'x'.repeat(201) } })
    expect(screen.getByText('201 / 200')).toBeInTheDocument()
    fireEvent.blur(title)

    expect(screen.getByText('Max 200 characters')).toBeInTheDocument()
    expect(title).toHaveAttribute('aria-invalid', 'true')
    await waitFor(() => expect(update.result).not.toHaveBeenCalled())
  })

  it('shows the previewed language’s translations with the default text as the placeholder', async () => {
    renderEdit([], '496')

    const title = await screen.findByRole('textbox', { name: 'Title' })
    expect(title).toHaveValue('Campagne autour du monde')
    expect(title).toHaveAttribute('placeholder', 'Outreach around the world')
    const description = screen.getByRole('textbox', { name: 'Description' })
    expect(description).toHaveValue('')
    expect(description).toHaveAttribute(
      'placeholder',
      'How the story is told in twelve countries.'
    )
  })

  it('writes a translation, not the default column, when previewing a non-default language', async () => {
    const translation = translationMock(
      'description',
      'Comment on raconte l’histoire'
    )
    renderEdit([translation], '496')

    const description = await screen.findByRole('textbox', {
      name: 'Description'
    })
    fireEvent.change(description, {
      target: { value: ' Comment on raconte l’histoire ' }
    })
    fireEvent.blur(description)

    await waitFor(() => expect(translation.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(description).toHaveValue('Comment on raconte l’histoire')
    )
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('undoes a translation by writing the previous one back', async () => {
    const write = translationMock('title', 'Campagne dans le monde')
    const restore = translationMock('title', 'Campagne autour du monde')
    renderEdit([write, restore], '496')

    const title = await screen.findByRole('textbox', { name: 'Title' })
    fireEvent.change(title, { target: { value: 'Campagne dans le monde' } })
    fireEvent.blur(title)
    await waitFor(() => expect(write.result).toHaveBeenCalled())
    await waitFor(() => expect(title).toHaveValue('Campagne dans le monde'))

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(restore.result).toHaveBeenCalled())
    await waitFor(() => expect(title).toHaveValue('Campagne autour du monde'))
  })

  it('clears the translation when the field is emptied', async () => {
    const translation = translationMock('title', '')
    renderEdit([translation], '496')

    const title = await screen.findByRole('textbox', { name: 'Title' })
    fireEvent.change(title, { target: { value: '' } })
    fireEvent.blur(title)

    await waitFor(() => expect(translation.result).toHaveBeenCalled())
    await waitFor(() => expect(title).toHaveValue(''))
  })

  it('drops an uncommitted draft when the Preview Language changes', async () => {
    renderEdit([], '496')

    const field = await screen.findByRole('textbox', { name: 'Title' })
    fireEvent.change(field, { target: { value: 'Campagne dans le monde' } })
    fireEvent.click(screen.getByRole('button', { name: 'Preview 529' }))

    await waitFor(() => expect(field).toHaveValue('Outreach around the world'))
    expect(field).not.toHaveAttribute('placeholder')
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
  })

  describe.each(['title', 'description'] as const)('%s', (field) => {
    it.each([
      { from: '496', to: '529' },
      { from: '529', to: '496' }
    ])(
      'ignores a pending refusal after changing Preview Language from $from to $to',
      async ({ from, to }) => {
        const refusal = 'The previous language card save was refused'
        const save = {
          ...(from === '496'
            ? translationMock(field, 'Readers')
            : blockUpdateMock(card, { [field]: 'Readers' })),
          result: vi.fn(() => ({ errors: [new GraphQLError(refusal)] }))
        }
        renderEdit([save], from)

        const label = field === 'title' ? 'Title' : 'Description'
        const input = await screen.findByRole('textbox', { name: label })
        await holdRequests(() => {
          fireEvent.change(input, { target: { value: 'Readers' } })
          fireEvent.blur(input)
        })
        expect(save.result).not.toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: `Preview ${to}` }))
        expect(screen.getByRole('textbox', { name: label })).toBe(input)
        expect(input).toHaveAttribute('aria-invalid', 'false')

        await landRequests()

        expect(save.result).toHaveBeenCalledTimes(1)
        expect(screen.queryByText(refusal)).not.toBeInTheDocument()
        expect(input).toHaveAttribute('aria-invalid', 'false')
        expect(input).toHaveValue(
          to === '529'
            ? card[field]
            : (card[`${field}Translations`][0]?.value ?? '')
        )
      }
    )
  })
})
