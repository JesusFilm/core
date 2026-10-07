import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { CAMPAIGN_BLOCK_DELETE } from '../../../libs/useCampaignBlockDeleteMutation'
import { CAMPAIGN_TYPOGRAPHY_BLOCK_CREATE } from '../../../libs/useCampaignTypographyBlockCreateMutation'
import { CampaignEditorState } from '../CampaignEditorProvider'
import { campaign } from '../data'
import { SelectionProbe, StaticEditor } from '../testing'

import { BottomBar } from './BottomBar'

vi.mock('uuid', () => ({ v4: () => 'newId' }))

const createMock = {
  request: {
    query: CAMPAIGN_TYPOGRAPHY_BLOCK_CREATE,
    variables: {
      input: {
        id: 'newId',
        campaignId: 'campaignId',
        parentBlockId: 'headerId',
        placement: 'below'
      }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignTypographyBlockCreate: {
        __typename: 'CampaignTypographyBlock',
        id: 'newId',
        campaignId: 'campaignId',
        pageId: null,
        regionId: null,
        parentBlockId: 'headerId',
        parentOrder: 2,
        content: '',
        contentTranslations: [],
        typographyVariant: null,
        align: null,
        color: null,
        placement: 'below'
      }
    }
  }))
}

const deleteMock = {
  request: {
    query: CAMPAIGN_BLOCK_DELETE,
    variables: { id: 'journeyListNoteId' }
  },
  result: vi.fn(() => ({ data: { campaignBlockDelete: [] } }))
}

function renderBar(
  initialState?: Partial<CampaignEditorState>,
  onSettingsClick = vi.fn()
): ReturnType<typeof render> {
  return render(
    <StaticEditor initialState={initialState} mocks={[createMock, deleteMock]}>
      <SelectionProbe />
      <BottomBar onSettingsClick={onSettingsClick} />
    </StaticEditor>
  )
}

function buttonNames(): string[] {
  return screen
    .getAllByRole('button')
    .map((button) => button.getAttribute('aria-label') ?? button.textContent)
    .filter((name): name is string => name != null && name !== '')
}

describe('BottomBar', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows Settings, Theme, Languages, Translations and Add section on the campaign row', () => {
    const onSettingsClick = vi.fn()
    renderBar(undefined, onSettingsClick)

    expect(screen.getByTestId('CampaignBottomBar')).toHaveAttribute(
      'data-selection',
      'campaign'
    )
    expect(buttonNames()).toEqual([
      'Settings',
      'Theme',
      'Languages',
      'Translations',
      'Add section'
    ])
    expect(screen.getByRole('button', { name: 'Theme' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Translations' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Add section' })).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    expect(onSettingsClick).toHaveBeenCalled()
  })

  it('shows Edit, Style, Add, move, duplicate and bin for a section', () => {
    renderBar({ selectedBlockId: 'heroId' })

    expect(buttonNames()).toEqual([
      'Campaign',
      'Edit',
      'Style',
      'Add',
      'Move up',
      'Move down',
      'Duplicate',
      'Delete'
    ])
    expect(screen.getByRole('button', { name: 'Style' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Move up' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Move down' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Duplicate' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled()
  })

  it('shows Edit, Style and Add only for chrome', () => {
    renderBar({ selectedBlockId: 'footerId' })

    expect(buttonNames()).toEqual(['Campaign', 'Edit', 'Style', 'Add'])
  })

  it('shows size, align, colour, Style and an enabled bin for a text Extra', () => {
    renderBar({ selectedBlockId: 'journeyListNoteId' })

    expect(buttonNames()).toEqual([
      'Campaign',
      'Journey list',
      'Size',
      'Align',
      'Colour',
      'Style',
      'Delete'
    ])
    expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Size' })).toBeDisabled()
  })

  it('adds the link chip and variant, size and colours for a button Extra', () => {
    renderBar({ selectedBlockId: 'heroButtonId' })

    expect(screen.getByText('Add link')).toBeInTheDocument()
    expect(buttonNames()).toEqual([
      'Campaign',
      'Hero',
      'Variant',
      'Size',
      'Colours',
      'Style',
      'Delete'
    ])
    expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled()
  })

  it('offers text or button, above or below, from a section or chrome block’s Add', async () => {
    renderBar({ selectedBlockId: 'headerId' })

    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(
      screen.getAllByRole('menuitem').map((item) => item.textContent)
    ).toEqual(['Text above', 'Text below', 'Button above', 'Button below'])

    fireEvent.click(screen.getByRole('menuitem', { name: 'Text below' }))

    await waitFor(() => expect(createMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('newId')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('deletes an Extra from the bin without confirmation', async () => {
    renderBar({ selectedBlockId: 'journeyListNoteId' })

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(deleteMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'landingJourneyListId'
    )
  })
})
