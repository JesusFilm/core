import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'

import {
  CAMPAIGN_HERO_BLOCK_UPDATE_TEXT,
  CampaignTextBlock
} from '../../../../libs/useCampaignBlockTextMutation'
import { campaign } from '../../data'
import { StaticEditor } from '../../testing'

import { InlineText, textLength } from './InlineText'

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
  mocks: Array<ReturnType<typeof heroMock>> = []
): ReturnType<typeof render> {
  return render(
    <StaticEditor mocks={mocks}>
      <InlineText
        block={hero}
        field="title"
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
    expect(onSelect).toHaveBeenCalledWith('title')
  })

  it('shows the placeholder for empty text when not editing', () => {
    renderText({
      editing: false,
      block: { ...hero, title: '' } as CampaignTextBlock
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
})
