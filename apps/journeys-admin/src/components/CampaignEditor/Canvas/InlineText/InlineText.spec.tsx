import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'

import {
  CAMPAIGN_HERO_BLOCK_UPDATE_TEXT,
  CampaignTextBlock
} from '../../../../libs/useCampaignBlockTextMutation'
import { CampaignEditorState } from '../../CampaignEditorProvider'
import { campaign, campaignStrings } from '../../data'
import { StaticEditor } from '../../testing'
import type { CampaignTextTarget } from '../../utils/useCampaignTextCommand'

import { InlineText, inlineTextTestId, textLength } from './InlineText'

const hero = campaign.blocks.find(
  (block) => block.id === 'heroId'
) as CampaignTextBlock

function heroMock(title: string, errors?: GraphQLError[]) {
  return {
    request: {
      query: CAMPAIGN_HERO_BLOCK_UPDATE_TEXT,
      variables: { id: 'heroId', input: { title } }
    },
    result: vi.fn(() =>
      errors != null
        ? { errors }
        : {
            data: {
              campaignHeroBlockUpdate: {
                __typename: 'CampaignHeroBlock',
                id: 'heroId',
                eyebrow: 'Christmas 2026',
                title,
                lede: 'Pick your region to find a journey in your language, ready to share.'
              }
            }
          }
    )
  }
}

function renderText(
  props: Partial<Parameters<typeof InlineText>[0]> = {},
  mocks: Array<ReturnType<typeof heroMock>> = [],
  initialState?: Partial<CampaignEditorState>
): ReturnType<typeof render> {
  return render(
    <StaticEditor mocks={mocks} initialState={initialState}>
      <InlineText
        target={{ block: hero, field: 'title' }}
        placeholder="Title"
        editing
        variant="h1"
        {...props}
      />
    </StaticEditor>
  )
}

describe('InlineText', () => {
  beforeEach(() => vi.clearAllMocks())

  it('counts Unicode code points after trim', () => {
    expect(textLength('  héllo 👋  ')).toBe(7)
  })

  it('renders as text when not editing and selects its block on click', () => {
    const onSelect = vi.fn()
    renderText({ editing: false, onSelect })

    const text = screen.getByTestId('InlineText-title')
    expect(text).toHaveTextContent('Share the story of Christmas')
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()

    fireEvent.click(text)
    expect(onSelect).toHaveBeenCalledTimes(1)
  })

  it('shows the placeholder for empty text when not editing', () => {
    renderText({
      editing: false,
      target: {
        block: { ...hero, title: '' } as CampaignTextBlock,
        field: 'title'
      }
    })

    expect(screen.getByTestId('InlineText-title')).toHaveTextContent('Title')
  })

  it('pre-validates only the length, with a character counter near the cap', async () => {
    const over = heroMock('x'.repeat(151))
    const near = heroMock('x'.repeat(130))
    renderText({}, [over, near])
    const input = screen.getByRole('textbox', { name: 'Title' })

    fireEvent.change(input, { target: { value: 'x'.repeat(130) } })
    expect(screen.getByText('130 / 150')).toBeInTheDocument()
    await waitFor(() => expect(near.result).toHaveBeenCalled())

    fireEvent.change(input, { target: { value: 'x'.repeat(151) } })
    expect(screen.getByRole('alert')).toHaveTextContent('Max 150 characters')
    await waitFor(() => expect(over.result).not.toHaveBeenCalled())
  })

  it('shows the API message verbatim when the save fails', async () => {
    const failing = heroMock('Nope', [
      new GraphQLError('title must be at most 150 characters', {
        extensions: { code: 'BAD_USER_INPUT', field: 'title' }
      })
    ])
    renderText({}, [failing])
    const input = screen.getByRole('textbox', { name: 'Title' })

    fireEvent.change(input, { target: { value: 'Nope' } })

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'title must be at most 150 characters'
    )
  })

  it('takes focus when asked', () => {
    renderText({ autoFocus: true })

    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus()
  })

  describe('Campaign Strings', () => {
    const copy = campaignStrings.find((string) => string.key === 'copy')!
    const target: CampaignTextTarget = { string: copy }

    it('renders a string by its own test id with the 200-character cap', () => {
      expect(inlineTextTestId(target)).toBe('InlineText-string-copy')
      renderText({ target, placeholder: 'copy', variant: 'body2' })
      const input = screen.getByRole('textbox', { name: 'copy' })
      expect(input).toHaveValue('Copy link')

      fireEvent.change(input, { target: { value: 'x'.repeat(201) } })
      expect(screen.getByRole('alert')).toHaveTextContent('Max 200 characters')
    })
  })

  describe('previewing a non-default language', () => {
    const translated = {
      ...hero,
      titleTranslations: [
        {
          __typename: 'TranslatedValue' as const,
          languageId: '496',
          value: "Partagez l'histoire de Noël",
          source: 'human' as const
        }
      ]
    } as CampaignTextBlock

    it('shows the translation when there is one', () => {
      renderText(
        { editing: false, target: { block: translated, field: 'title' } },
        [],
        { previewLanguageId: '496' }
      )
      const text = screen.getByTestId('InlineText-title')
      expect(text).toHaveTextContent("Partagez l'histoire de Noël")
      expect(text).not.toHaveAttribute('data-fallback')
    })

    it('shows the default-language text as a marked fallback when the translation is missing, and as the input placeholder', () => {
      renderText({ editing: false }, [], { previewLanguageId: '496' })
      const text = screen.getByTestId('InlineText-title')
      expect(text).toHaveTextContent('Share the story of Christmas')
      expect(text).toHaveAttribute('data-fallback', 'true')

      renderText({}, [], { previewLanguageId: '496' })
      const input = screen.getByRole('textbox', { name: 'Title' })
      expect(input).toHaveValue('')
      expect(input).toHaveAttribute(
        'placeholder',
        'Share the story of Christmas'
      )
    })
  })
})
