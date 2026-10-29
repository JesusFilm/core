import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'

import { GetCampaign_campaign_blocks_CampaignHeroBlock as CampaignHeroBlock } from '../../../../../__generated__/GetCampaign'
import { CampaignTextBlock } from '../../../../libs/useCampaignBlockTextMutation'
import { CAMPAIGN_TRANSLATION_SET } from '../../../../libs/useCampaignTranslationSetMutation'
import { CampaignEditorState } from '../../CampaignEditorProvider'
import { campaign, campaignStrings } from '../../data'
import { blockUpdateMock } from '../../styleTesting'
import { PreviewLanguageSwitch, StaticEditor } from '../../testing'
import type { CampaignTextTarget } from '../../utils/useCampaignTextCommand'

import { InlineText, inlineTextCap, inlineTextTestId } from './InlineText'

const hero = campaign.blocks.find(
  (block) => block.id === 'heroId'
) as CampaignHeroBlock

function heroMock(title: string, errors?: GraphQLError[]) {
  const mock = blockUpdateMock(hero, { title })
  if (errors != null) mock.result = vi.fn(() => ({ errors }))
  return mock
}

function heroTranslationMock(value: string) {
  return {
    request: {
      query: CAMPAIGN_TRANSLATION_SET,
      variables: {
        input: {
          target: { blockId: 'heroId' },
          field: 'title',
          languageId: '496',
          value
        }
      }
    },
    result: vi.fn(() => ({
      data: {
        campaignTranslationSet: [
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

  it('reads its cap from the Translated Field declaration', () => {
    expect(inlineTextCap({ block: hero, field: 'title' })).toBe(150)
    expect(inlineTextCap({ block: hero, field: 'eyebrow' })).toBe(80)
    expect(inlineTextCap({ string: campaignStrings[0] })).toBe(200)
  })

  it('renders as text when not editing and selects its block on click', () => {
    const onSelect = vi.fn()
    renderText({ editing: false, onSelect })

    const text = screen.getByTestId('InlineText-title')
    expect(text).toHaveTextContent('Share the story of Outreach')
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
    expect(screen.getByRole('alert')).toHaveTextContent(/^Max 150 characters$/)
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

  it('takes focus when the click on its text is what opened it, without autoFocus', () => {
    const onSelect = vi.fn()
    const { rerender } = renderText({ editing: false, onSelect })

    fireEvent.click(screen.getByTestId('InlineText-title'))
    rerender(
      <StaticEditor>
        <InlineText
          target={{ block: hero, field: 'title' }}
          placeholder="Title"
          editing
          variant="h1"
          onSelect={onSelect}
        />
      </StaticEditor>
    )

    expect(screen.getByRole('textbox', { name: 'Title' })).toHaveFocus()
  })

  it('does not take focus when something else opened it', () => {
    const { rerender } = renderText({ editing: false })

    rerender(
      <StaticEditor>
        <InlineText
          target={{ block: hero, field: 'title' }}
          placeholder="Title"
          editing
          variant="h1"
        />
      </StaticEditor>
    )

    expect(screen.getByRole('textbox', { name: 'Title' })).not.toHaveFocus()
  })

  describe('autoWidth', () => {
    it('sizes the input from a hidden copy of the text and keeps it multi-line', () => {
      renderText({ autoWidth: true })

      const input = screen.getByRole('textbox', { name: 'Title' })
      expect(input.tagName).toBe('TEXTAREA')
      expect(screen.getByTestId('InlineTextSizer')).toHaveTextContent(
        'Share the story of Outreach'
      )
    })

    it('sizes to the placeholder while the value is empty', () => {
      renderText({
        autoWidth: true,
        target: {
          block: { ...hero, title: '' } as CampaignTextBlock,
          field: 'title'
        }
      })

      expect(screen.getByTestId('InlineTextSizer')).toHaveTextContent('Title')
    })

    it('grows the sizer as the author types', () => {
      renderText({ autoWidth: true }, [heroMock('Short')])

      fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
        target: { value: 'Short' }
      })

      expect(screen.getByTestId('InlineTextSizer')).toHaveTextContent('Short')
    })

    it('renders a full-width multiline field, sized by the hidden copy, without it', () => {
      renderText()

      expect(screen.getByRole('textbox', { name: 'Title' }).tagName).toBe(
        'TEXTAREA'
      )
      expect(screen.getByTestId('InlineTextSizer')).toHaveTextContent(
        'Share the story of Outreach'
      )
    })
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
      expect(screen.getByRole('alert')).toHaveTextContent(
        /^Max 200 characters$/
      )
    })
  })

  describe('previewing a non-default language', () => {
    const translated = {
      ...hero,
      titleTranslations: [
        {
          __typename: 'TranslatedValue' as const,
          languageId: '496',
          value: "Partagez l'histoire de Campagne",
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
      expect(text).toHaveTextContent("Partagez l'histoire de Campagne")
      expect(text).not.toHaveAttribute('data-fallback')
    })

    it('shows the default-language text as a marked fallback when the translation is missing, and as the input placeholder', () => {
      renderText({ editing: false }, [], { previewLanguageId: '496' })
      const text = screen.getByTestId('InlineText-title')
      expect(text).toHaveTextContent('Share the story of Outreach')
      expect(text).toHaveAttribute('data-fallback', 'true')

      renderText({}, [], { previewLanguageId: '496' })
      const input = screen.getByRole('textbox', { name: 'Title' })
      expect(input).toHaveValue('')
      expect(input).toHaveAttribute(
        'placeholder',
        'Share the story of Outreach'
      )
    })

    it('writes a translation, not the block update, while translating', async () => {
      const translation = heroTranslationMock('Bonjour')
      const update = heroMock('Bonjour')
      renderText(
        { target: { block: translated, field: 'title' } },
        [translation, update],
        { previewLanguageId: '496' }
      )

      fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
        target: { value: 'Bonjour' }
      })

      await waitFor(() => expect(translation.result).toHaveBeenCalled())
      expect(update.result).not.toHaveBeenCalled()
    })

    it('writes the block update, not a translation, in the default language', async () => {
      const translation = heroTranslationMock('Hello')
      const update = heroMock('Hello')
      renderText({ target: { block: translated, field: 'title' } }, [
        translation,
        update
      ])

      fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), {
        target: { value: 'Hello' }
      })

      await waitFor(() => expect(update.result).toHaveBeenCalled())
      expect(translation.result).not.toHaveBeenCalled()
    })

    it('drops what was typed in one language when the Preview Language changes', async () => {
      const translation = heroTranslationMock('Brouillon')
      render(
        <StaticEditor
          mocks={[translation]}
          initialState={{ previewLanguageId: '496' }}
        >
          <PreviewLanguageSwitch languageIds={['529', '496']} />
          <InlineText
            target={{ block: translated, field: 'title' }}
            placeholder="Title"
            editing
            variant="h1"
          />
        </StaticEditor>
      )
      const input = screen.getByRole('textbox', { name: 'Title' })
      fireEvent.change(input, { target: { value: 'Brouillon' } })
      await waitFor(() => expect(translation.result).toHaveBeenCalled())

      fireEvent.click(screen.getByRole('button', { name: 'Preview 529' }))

      await waitFor(() =>
        expect(input).toHaveValue('Share the story of Outreach')
      )
    })
  })
})
