import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { v4 as uuidv4 } from 'uuid'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { CAMPAIGN_BLOCK_DELETE } from '../../../libs/useCampaignBlockDeleteMutation'
import { CAMPAIGN_BLOCK_DUPLICATE } from '../../../libs/useCampaignBlockDuplicateMutation'
import { CAMPAIGN_BLOCK_ORDER_UPDATE } from '../../../libs/useCampaignBlockOrderUpdateMutation'
import {
  CAMPAIGN_HERO_BLOCK_CREATE,
  CAMPAIGN_REGION_SHARE_BLOCK_CREATE
} from '../../../libs/useCampaignSectionCreateMutation'
import { CAMPAIGN_TYPOGRAPHY_BLOCK_CREATE } from '../../../libs/useCampaignTypographyBlockCreateMutation'
import { CampaignEditorState } from '../CampaignEditorProvider'
import { campaign } from '../data'
import { Hotkeys } from '../Hotkeys'
import { newSectionBlock } from '../sectionTypes'
import { SelectionProbe, StaticEditor } from '../testing'
import { duplicateBlocks } from '../utils/useCampaignBlockDuplicateCommand'

import { BottomBar } from './BottomBar'

vi.mock('uuid', () => ({ v4: vi.fn(() => 'newId') }))

const hero = campaign.blocks.find((block) => block.id === 'heroId')!

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

const heroBelowMock = {
  request: {
    query: CAMPAIGN_HERO_BLOCK_CREATE,
    variables: {
      input: {
        id: 'newId',
        campaignId: 'campaignId',
        pageId: 'landingPageId',
        parentOrder: 1
      }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignHeroBlockCreate: newSectionBlock('CampaignHeroBlock', {
        id: 'newId',
        campaignId: 'campaignId',
        pageId: 'landingPageId',
        parentOrder: 1
      })
    }
  }))
}

const regionShareAppendMock = {
  request: {
    query: CAMPAIGN_REGION_SHARE_BLOCK_CREATE,
    variables: {
      input: {
        id: 'newId',
        campaignId: 'campaignId',
        pageId: 'regionPageId',
        parentOrder: 5
      }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignRegionShareBlockCreate: newSectionBlock(
        'CampaignRegionShareBlock',
        {
          id: 'newId',
          campaignId: 'campaignId',
          pageId: 'regionPageId',
          parentOrder: 5
        }
      )
    }
  }))
}

const moveUpMock = {
  request: {
    query: CAMPAIGN_BLOCK_ORDER_UPDATE,
    variables: { id: 'landingSwitcherId', parentOrder: 0 }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockOrderUpdate: [
        {
          __typename: 'CampaignRegionSwitcherBlock',
          id: 'landingSwitcherId',
          parentOrder: 0
        },
        { __typename: 'CampaignHeroBlock', id: 'heroId', parentOrder: 1 }
      ]
    }
  }))
}

const copyIds = ['heroCopyId', 'heroButtonCopyId']
const duplicated = duplicateBlocks(campaign.blocks, hero, () =>
  copyIds[0] === 'heroCopyId' && copyIds.length === 2
    ? (copyIds.shift() as string)
    : 'heroButtonCopyId'
)

const duplicateMock = {
  request: {
    query: CAMPAIGN_BLOCK_DUPLICATE,
    variables: { id: 'heroId', idMap: duplicated.idMap }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockDuplicate: [
        ...duplicated.siblingsAfter,
        ...duplicated.copies.slice(1)
      ]
    }
  }))
}

const sectionDeleteMock = {
  request: { query: CAMPAIGN_BLOCK_DELETE, variables: { id: 'heroId' } },
  result: vi.fn(() => ({ data: { campaignBlockDelete: [] } }))
}

function renderBar(
  initialState?: Partial<CampaignEditorState>,
  onSettingsClick = vi.fn()
): ReturnType<typeof render> {
  return render(
    <StaticEditor
      initialState={initialState}
      mocks={[
        createMock,
        deleteMock,
        heroBelowMock,
        regionShareAppendMock,
        moveUpMock,
        duplicateMock,
        sectionDeleteMock
      ]}
    >
      <Hotkeys />
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

function menuItemNames(): string[] {
  return screen.getAllByRole('menuitem').map((item) => item.textContent ?? '')
}

describe('BottomBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(uuidv4).mockImplementation(() => 'newId')
  })

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
    expect(screen.getByRole('button', { name: 'Add section' })).toBeEnabled()

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }))
    expect(onSettingsClick).toHaveBeenCalled()
  })

  it('opens the Translations view from the campaign row', () => {
    const onTranslationsClick = vi.fn()
    render(
      <StaticEditor mocks={[createMock, deleteMock]}>
        <BottomBar
          onSettingsClick={vi.fn()}
          onTranslationsClick={onTranslationsClick}
        />
      </StaticEditor>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Translations' }))

    expect(onTranslationsClick).toHaveBeenCalled()
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
    expect(screen.getByRole('button', { name: 'Style' })).toBeEnabled()
    // The hero is first on the page, so only Move down applies.
    expect(screen.getByRole('button', { name: 'Move up' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Move down' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Duplicate' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled()
  })

  it('disables Move down for the last section on the page', () => {
    renderBar({ selectedBlockId: 'landingAnalyticsId' })

    expect(screen.getByRole('button', { name: 'Move up' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Move down' })).toBeDisabled()
  })

  it('shows Edit, Style and Add only for chrome, names it in the breadcrumb, and Escape goes up to the campaign row', async () => {
    renderBar({ selectedBlockId: 'footerId' })

    expect(buttonNames()).toEqual(['Campaign', 'Edit', 'Style', 'Add'])
    expect(screen.getByTestId('CampaignBreadcrumb')).toHaveTextContent('Footer')
    expect(screen.getByTestId('CampaignBottomBar')).toHaveAttribute(
      'data-selection',
      'chrome'
    )

    await userEvent.keyboard('{Escape}')

    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('campaign')
    expect(buttonNames()).toEqual([
      'Settings',
      'Theme',
      'Languages',
      'Translations',
      'Add section'
    ])
  })

  it('names the header in the breadcrumb', () => {
    renderBar({ selectedBlockId: 'headerId' })

    expect(screen.getByTestId('CampaignBreadcrumb')).toHaveTextContent('Header')
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
    expect(screen.getByRole('button', { name: 'Size' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Style' })).toBeEnabled()
  })

  it('opens the Style panel for the selected section, and for an Extra’s host section', () => {
    renderBar({ selectedBlockId: 'journeyListNoteId' })

    fireEvent.click(screen.getByRole('button', { name: 'Style' }))

    expect(screen.getByTestId('CampaignStylePanel')).toHaveAttribute(
      'data-block-id',
      'landingJourneyListId'
    )
    expect(screen.getByRole('tab', { name: 'Background' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Colours' })).toBeInTheDocument()
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

  it('offers text or button, above or below, from a chrome block’s Add, and no section entries', async () => {
    renderBar({ selectedBlockId: 'headerId' })

    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(menuItemNames()).toEqual([
      'Text above',
      'Text below',
      'Button above',
      'Button below'
    ])

    fireEvent.click(screen.getByRole('menuitem', { name: 'Text below' }))

    await waitFor(() => expect(createMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('newId')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('adds a section above or below from a section’s Add, choosing the type from the page’s list', async () => {
    renderBar({ selectedBlockId: 'heroId' })

    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    expect(menuItemNames()).toEqual([
      'Text above',
      'Text below',
      'Button above',
      'Button below',
      'Section above',
      'Section below'
    ])

    fireEvent.click(screen.getByRole('menuitem', { name: 'Section below' }))

    // The landing page never offers the two region-only sections.
    await waitFor(() =>
      expect(menuItemNames()).toEqual([
        'Hero',
        'Region switcher',
        'Video carousel',
        'Journey list',
        'Analytics'
      ])
    )

    fireEvent.click(screen.getByRole('menuitem', { name: 'Hero' }))

    await waitFor(() => expect(heroBelowMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('newId')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('appends a section to the Region Page from the campaign row, offering all seven types', async () => {
    renderBar({ pageKind: CampaignPageKind.regionTemplate })

    fireEvent.click(screen.getByRole('button', { name: 'Add section' }))
    expect(menuItemNames()).toEqual([
      'Hero',
      'Region switcher',
      'Video carousel',
      'Journey list',
      'Analytics',
      'Region header',
      'Region share'
    ])

    fireEvent.click(screen.getByRole('menuitem', { name: 'Region share' }))

    await waitFor(() => expect(regionShareAppendMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('newId')
    expect(screen.getByTestId('PageKind')).toHaveTextContent('regionTemplate')
  })

  it('moves a section with the arrows', async () => {
    renderBar({ selectedBlockId: 'landingSwitcherId' })

    fireEvent.click(screen.getByRole('button', { name: 'Move up' }))

    await waitFor(() => expect(moveUpMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'landingSwitcherId'
    )
  })

  it('duplicates a section and selects the copy', async () => {
    vi.mocked(uuidv4)
      .mockImplementationOnce(() => 'heroCopyId')
      .mockImplementationOnce(() => 'heroButtonCopyId')
    renderBar({ selectedBlockId: 'heroId' })

    fireEvent.click(screen.getByRole('button', { name: 'Duplicate' }))

    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'heroCopyId'
    )
    await waitFor(() => expect(duplicateMock.result).toHaveBeenCalled())
  })

  it('asks for confirmation before deleting a section, pointing at undo', async () => {
    renderBar({ selectedBlockId: 'heroId' })

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

    const dialog = screen.getByTestId('CampaignSectionDeleteDialog')
    expect(dialog).toHaveTextContent('Delete section?')
    expect(dialog).toHaveTextContent('You can undo this afterwards.')
    expect(sectionDeleteMock.result).not.toHaveBeenCalled()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() =>
      expect(
        screen.queryByTestId('CampaignSectionDeleteDialog')
      ).not.toBeInTheDocument()
    )
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('heroId')

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
    fireEvent.click(
      within(screen.getByTestId('CampaignSectionDeleteDialog')).getByRole(
        'button',
        { name: 'Delete' }
      )
    )

    await waitFor(() => expect(sectionDeleteMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('campaign')
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
