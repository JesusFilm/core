import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { v4 as uuidv4 } from 'uuid'

import { youTubeVideoBlock } from '@core/journeys/ui/Campaign/testData'

import { GetCampaign_campaign_blocks } from '../../../../__generated__/GetCampaign'
import { TypographyAlign } from '../../../../__generated__/globalTypes'
import { CAMPAIGN_BLOCK_DELETE } from '../../../libs/useCampaignBlockDeleteMutation'
import { CAMPAIGN_BLOCK_DUPLICATE } from '../../../libs/useCampaignBlockDuplicateMutation'
import { CAMPAIGN_BLOCK_ORDER_UPDATE } from '../../../libs/useCampaignBlockOrderUpdateMutation'
import { CAMPAIGN_COLUMNS_BLOCK_UPDATE_RATIO } from '../../../libs/useCampaignColumnsBlockRatioMutation'
import { GET_CAMPAIGN_COUNTRIES } from '../../../libs/useCampaignCountriesQuery'
import {
  CAMPAIGN_HERO_BLOCK_CREATE,
  CAMPAIGN_RICH_TEXT_BLOCK_CREATE
} from '../../../libs/useCampaignSectionCreateMutation'
import { CAMPAIGN_TYPOGRAPHY_BLOCK_UPDATE_STYLE } from '../../../libs/useCampaignTypographyBlockUpdateMutation'
import { CampaignEditorState } from '../CampaignEditorProvider'
import {
  campaign,
  campaignWithColumns,
  campaignWithRegions,
  withEmptyTranslations
} from '../data'
import { Hotkeys } from '../Hotkeys'
import { newSectionBlock } from '../sectionTypes'
import {
  BlocksProbe,
  CommandProbe,
  QueriedEditor,
  SelectionProbe,
  StaticEditor
} from '../testing'
import { duplicateBlocks } from '../utils/useCampaignBlockDuplicateCommand'
import { textStyleRow } from '../utils/useCampaignExtraStyleCommand'

import { Inspector } from './Inspector'

vi.mock('uuid', () => ({ v4: vi.fn(() => 'newId') }))

const countriesMock = {
  request: { query: GET_CAMPAIGN_COUNTRIES },
  result: { data: { countries: [] } }
}

const hero = campaign.blocks.find((block) => block.id === 'heroId')!

const noteDeleteMock = {
  request: {
    query: CAMPAIGN_BLOCK_DELETE,
    variables: { id: 'journeyListNoteId' }
  },
  result: vi.fn(() => ({ data: { campaignBlockDelete: [] } }))
}

const journeyCardDeleteMock = {
  request: {
    query: CAMPAIGN_BLOCK_DELETE,
    variables: { id: 'landingJourneyId' }
  },
  result: vi.fn(() => ({ data: { campaignBlockDelete: [] } }))
}

const journeyCardMoveLeftMock = {
  request: {
    query: CAMPAIGN_BLOCK_ORDER_UPDATE,
    variables: { id: 'landingDraftJourneyId', parentOrder: 1 }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockOrderUpdate: [
        {
          __typename: 'CampaignTypographyBlock',
          id: 'journeyListNoteId',
          parentOrder: 0,
          placement: 'above'
        },
        {
          __typename: 'CampaignJourneyBlock',
          id: 'landingDraftJourneyId',
          parentOrder: 1
        },
        {
          __typename: 'CampaignJourneyBlock',
          id: 'landingJourneyId',
          parentOrder: 2
        }
      ]
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

const slotRichTextDeleteMock = {
  request: {
    query: CAMPAIGN_BLOCK_DELETE,
    variables: { id: 'slotRichTextId' }
  },
  result: vi.fn(() => ({ data: { campaignBlockDelete: [] } }))
}

const swapMock = {
  request: {
    query: CAMPAIGN_BLOCK_ORDER_UPDATE,
    variables: { id: 'slotLeftId', parentOrder: 1 }
  },
  result: vi.fn(() => ({
    data: {
      campaignBlockOrderUpdate: [
        {
          __typename: 'CampaignColumnBlock',
          id: 'slotRightId',
          parentOrder: 0
        },
        { __typename: 'CampaignColumnBlock', id: 'slotLeftId', parentOrder: 1 }
      ]
    }
  }))
}

const ratioMock = {
  request: {
    query: CAMPAIGN_COLUMNS_BLOCK_UPDATE_RATIO,
    variables: { id: 'columnsId', input: { ratio: 'wideRight' } }
  },
  result: vi.fn(() => ({
    data: {
      campaignColumnsBlockUpdate: {
        __typename: 'CampaignColumnsBlock',
        id: 'columnsId',
        ratio: 'wideRight'
      }
    }
  }))
}

const heroInSlotMock = {
  request: {
    query: CAMPAIGN_HERO_BLOCK_CREATE,
    variables: {
      input: {
        id: 'newId',
        campaignId: 'campaignId',
        pageId: 'landingPageId',
        parentBlockId: 'slotLeftId',
        parentOrder: 0
      }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignHeroBlockCreate: newSectionBlock('CampaignHeroBlock', {
        id: 'newId',
        campaignId: 'campaignId',
        pageId: 'landingPageId',
        parentBlockId: 'slotLeftId',
        parentOrder: 0
      })
    }
  }))
}

const richTextInSlotMock = {
  request: {
    query: CAMPAIGN_RICH_TEXT_BLOCK_CREATE,
    variables: {
      input: {
        id: 'newId',
        campaignId: 'campaignId',
        pageId: 'landingPageId',
        parentBlockId: 'slotRightId',
        parentOrder: 0
      }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignRichTextBlockCreate: newSectionBlock('CampaignRichTextBlock', {
        id: 'newId',
        campaignId: 'campaignId',
        pageId: 'landingPageId',
        parentBlockId: 'slotRightId',
        parentOrder: 0
      })
    }
  }))
}

function renderInspector(
  initialState?: Partial<CampaignEditorState>,
  campaignProp = campaign,
  extraMocks: Array<Record<string, unknown>> = []
): ReturnType<typeof render> {
  return render(
    <StaticEditor
      initialState={initialState}
      campaignProp={campaignProp}
      mocks={[
        ...extraMocks,
        noteDeleteMock,
        journeyCardDeleteMock,
        journeyCardMoveLeftMock,
        moveUpMock,
        duplicateMock,
        sectionDeleteMock
      ]}
    >
      <Hotkeys />
      <SelectionProbe />
      <CommandProbe />
      <Inspector isManager={false} />
    </StaticEditor>
  )
}

function menuItemNames(): string[] {
  return screen.getAllByRole('menuitem').map((item) => item.textContent ?? '')
}

function actionNames(): string[] {
  return within(screen.getByTestId('CampaignInspectorActions'))
    .getAllByRole('button')
    .map((button) => button.getAttribute('aria-label') ?? '')
}

describe('Inspector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(uuidv4).mockImplementation(() => 'newId')
  })

  describe('shell', () => {
    it('is 328 px wide, styled as a panel, with a Style and a Settings tab', () => {
      renderInspector()

      expect(screen.getByTestId('CampaignInspector')).toHaveStyle({
        width: '328px'
      })
      expect(screen.getByRole('tab', { name: 'Style' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
      expect(screen.getByRole('tab', { name: 'Settings' })).toHaveAttribute(
        'aria-selected',
        'false'
      )
    })

    it('opens on the tab the editor state names and switches on click', () => {
      renderInspector({ inspectorTab: 'settings' })
      expect(screen.getByTestId('CampaignSettings')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('tab', { name: 'Style' }))

      expect(screen.getByTestId('CampaignThemePanel')).toBeInTheDocument()
      expect(screen.queryByTestId('CampaignSettings')).not.toBeInTheDocument()
    })

    it('switches tab with S and D, and leaves the letters to a focused input', async () => {
      render(
        <StaticEditor>
          <Hotkeys />
          <input aria-label="Shell field" />
          <Inspector isManager={false} />
        </StaticEditor>
      )

      await userEvent.keyboard('d')
      expect(screen.getByTestId('CampaignSettings')).toBeInTheDocument()
      await userEvent.keyboard('s')
      expect(screen.getByTestId('CampaignThemePanel')).toBeInTheDocument()

      screen.getByRole('textbox', { name: 'Shell field' }).focus()
      await userEvent.keyboard('d')
      expect(screen.getByTestId('CampaignThemePanel')).toBeInTheDocument()
    })

    it('selects each earlier level from the header breadcrumb', () => {
      renderInspector({ selectedBlockId: 'heroButtonId' })

      const header = screen.getByTestId('CampaignInspector')
      expect(
        within(header).getByTestId('CampaignBreadcrumb')
      ).toHaveTextContent('Campaign›Hero›Button')
      expect(screen.getByTestId('CampaignInspectorLabel')).toHaveTextContent(
        'Button'
      )

      fireEvent.click(within(header).getByRole('button', { name: 'Hero' }))
      expect(screen.getByTestId('SelectionKind')).toHaveTextContent('section')
      expect(screen.getByTestId('CampaignInspectorLabel')).toHaveTextContent(
        'Hero'
      )

      fireEvent.click(within(header).getByRole('button', { name: 'Campaign' }))
      expect(screen.getByTestId('SelectionKind')).toHaveTextContent('campaign')
    })
  })

  describe('nothing selected', () => {
    it('shows the Theme on Style and no actions row', () => {
      renderInspector()

      expect(screen.getByTestId('CampaignInspectorLabel')).toHaveTextContent(
        'Campaign'
      )
      expect(screen.getByTestId('CampaignThemePanel')).toBeInTheDocument()
      expect(
        screen.queryByTestId('CampaignInspectorActions')
      ).not.toBeInTheDocument()
    })

    it('shows the campaign settings on Settings, with no Languages or Translations buttons', () => {
      renderInspector({ inspectorTab: 'settings' })

      expect(screen.getByTestId('CampaignSettings')).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue(
        campaign.title
      )
      expect(
        screen.queryByRole('button', { name: 'Languages' })
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Translations' })
      ).not.toBeInTheDocument()
    })
  })

  describe('section', () => {
    it('shows its type in the header and Background and Colours on Style', () => {
      renderInspector({ selectedBlockId: 'heroId' })

      expect(screen.getByTestId('CampaignInspector')).toHaveAttribute(
        'data-selection',
        'section'
      )
      expect(screen.getByTestId('CampaignInspectorLabel')).toHaveTextContent(
        'Hero'
      )
      expect(screen.getByTestId('CampaignStylePanel')).toHaveAttribute(
        'data-block-id',
        'heroId'
      )
      expect(
        screen.getByRole('tab', { name: 'Background' })
      ).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: 'Colours' })).toBeInTheDocument()
    })

    it('shows the media editor of a hero on Settings', () => {
      renderInspector({ selectedBlockId: 'heroId', inspectorTab: 'settings' })

      expect(screen.getByTestId('CampaignMediaSectionEdit')).toHaveAttribute(
        'data-block-id',
        'heroId'
      )
      expect(
        screen.getByRole('textbox', { name: 'Watch or YouTube link' })
      ).toBeInTheDocument()
    })

    it('shows the map toggle of the Analytics section on Settings', () => {
      renderInspector({
        selectedBlockId: 'landingAnalyticsId',
        inspectorTab: 'settings'
      })

      expect(screen.getByTestId('AnalyticsSettings')).toBeInTheDocument()
      expect(screen.getByRole('switch', { name: 'Show map' })).toBeChecked()
    })

    it('shows the variant of the Region Switcher on Settings', () => {
      renderInspector({
        selectedBlockId: 'landingSwitcherId',
        inspectorTab: 'settings'
      })

      expect(screen.getByRole('button', { name: 'Cards' })).toHaveAttribute(
        'aria-pressed',
        'true'
      )
    })

    it('shows the display of the Journey List on Settings', () => {
      renderInspector({
        selectedBlockId: 'landingJourneyListId',
        inspectorTab: 'settings'
      })

      expect(screen.getByRole('button', { name: 'Grid' })).toHaveAttribute(
        'aria-pressed',
        'true'
      )
    })

    it('points a section without an editor at the page on Settings', () => {
      renderInspector({
        selectedBlockId: 'footerId',
        inspectorTab: 'settings'
      })

      expect(
        screen.getByText('Edit its text directly on the page.')
      ).toBeInTheDocument()
    })

    it('offers move up, move down, duplicate and delete', () => {
      renderInspector({ selectedBlockId: 'heroId' })

      expect(actionNames()).toEqual([
        'Move up',
        'Move down',
        'Duplicate',
        'Delete'
      ])
      // The hero is first on the page, so only Move down applies.
      expect(screen.getByRole('button', { name: 'Move up' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Move down' })).toBeEnabled()
    })

    it('disables Move down for the last section on the page', () => {
      renderInspector({ selectedBlockId: 'landingAnalyticsId' })

      expect(screen.getByRole('button', { name: 'Move up' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Move down' })).toBeDisabled()
    })

    it('moves a section with the arrows as one order update', async () => {
      renderInspector({ selectedBlockId: 'landingSwitcherId' })

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
      renderInspector({ selectedBlockId: 'heroId' })

      fireEvent.click(screen.getByRole('button', { name: 'Duplicate' }))

      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'heroCopyId'
      )
      await waitFor(() => expect(duplicateMock.result).toHaveBeenCalled())
    })

    it('asks for confirmation before deleting, pointing at undo', async () => {
      renderInspector({ selectedBlockId: 'heroId' })

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

    it('swaps the content when the selection changes', () => {
      renderInspector({ selectedBlockId: 'heroId' })
      expect(screen.getByTestId('CampaignStylePanel')).toHaveAttribute(
        'data-block-id',
        'heroId'
      )

      fireEvent.click(screen.getByRole('button', { name: 'Campaign' }))

      expect(screen.getByTestId('CampaignThemePanel')).toBeInTheDocument()
    })
  })

  describe('chrome', () => {
    it('shows the logo editor of the header on Settings and has no actions', () => {
      renderInspector({ selectedBlockId: 'headerId', inspectorTab: 'settings' })

      expect(screen.getByTestId('CampaignInspector')).toHaveAttribute(
        'data-selection',
        'chrome'
      )
      expect(screen.getByTestId('CampaignChromeEdit')).toHaveAttribute(
        'data-block-id',
        'headerId'
      )
      expect(
        screen.queryByTestId('CampaignInspectorActions')
      ).not.toBeInTheDocument()
    })

    it('styles the footer on Style, and Escape goes up to the campaign', async () => {
      renderInspector({ selectedBlockId: 'footerId' })

      expect(screen.getByTestId('CampaignInspectorLabel')).toHaveTextContent(
        'Footer'
      )
      expect(screen.getByTestId('CampaignStylePanel')).toHaveAttribute(
        'data-block-id',
        'footerId'
      )

      await userEvent.keyboard('{Escape}')

      expect(screen.getByTestId('SelectionKind')).toHaveTextContent('campaign')
      expect(screen.getByTestId('CampaignThemePanel')).toBeInTheDocument()
    })
  })

  describe('Inherits from', () => {
    it('names the host of a text Extra and selects it on click', () => {
      renderInspector({ selectedBlockId: 'journeyListNoteId' })

      const link = within(screen.getByTestId('CampaignInspector')).getByRole(
        'button',
        { name: 'Inherits from Journey list' }
      )
      fireEvent.click(link)

      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'landingJourneyListId'
      )
      expect(
        screen.queryByTestId('InspectorInheritsFrom')
      ).not.toBeInTheDocument()
    })

    it('names the host of a button Extra and selects it on click', () => {
      renderInspector({ selectedBlockId: 'heroButtonId' })

      fireEvent.click(
        screen.getByRole('button', { name: 'Inherits from Hero' })
      )

      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('heroId')
    })

    it('is not shown for a section', () => {
      renderInspector({ selectedBlockId: 'heroId' })

      expect(
        screen.queryByTestId('InspectorInheritsFrom')
      ).not.toBeInTheDocument()
    })
  })

  describe('text Extra', () => {
    it('shows size, align and colour as inline rows on Style and a delete without confirmation', async () => {
      renderInspector({ selectedBlockId: 'journeyListNoteId' })

      expect(screen.getByRole('combobox', { name: 'Size' })).toBeEnabled()
      expect(screen.getByRole('group', { name: 'Align' })).toBeVisible()
      expect(screen.getByTestId('TextColourRow-color')).toBeVisible()
      expect(actionNames()).toEqual(['Delete'])

      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      await waitFor(() => expect(noteDeleteMock.result).toHaveBeenCalled())
      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'landingJourneyListId'
      )
    })

    it('clicks Reset on an Align that was set and writes null as one Command', async () => {
      const centred = {
        ...campaign,
        blocks: campaign.blocks.map((block) =>
          block.id === 'journeyListNoteId'
            ? { ...block, align: TypographyAlign.center }
            : block
        )
      }
      const resetMock = {
        request: {
          query: CAMPAIGN_TYPOGRAPHY_BLOCK_UPDATE_STYLE,
          variables: { id: 'journeyListNoteId', input: { align: null } }
        },
        result: vi.fn(() => ({
          data: {
            campaignTypographyBlockUpdate: textStyleRow(
              centred.blocks.find(
                (block) => block.id === 'journeyListNoteId'
              ) as Parameters<typeof textStyleRow>[0],
              { align: null }
            )
          }
        }))
      }
      renderInspector({ selectedBlockId: 'journeyListNoteId' }, centred, [
        resetMock
      ])

      fireEvent.click(screen.getByRole('button', { name: 'Reset Align' }))

      await waitFor(() => expect(resetMock.result).toHaveBeenCalled())
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    })

    it('edits text on the page, so Settings points there', () => {
      renderInspector({
        selectedBlockId: 'journeyListNoteId',
        inspectorTab: 'settings'
      })

      expect(
        screen.getByText('Edit this text directly on the page.')
      ).toBeInTheDocument()
    })

    it('shows a Region Line as text in its region, with a delete and no section host', () => {
      renderInspector({ selectedBlockId: 'eurLineId' }, campaignWithRegions)

      expect(screen.getByTestId('CampaignInspector')).toHaveAttribute(
        'data-selection',
        'text'
      )
      expect(
        within(screen.getByTestId('CampaignInspector')).getByTestId(
          'CampaignBreadcrumb'
        )
      ).toHaveTextContent('Campaign›Europe›Region Line')
      expect(screen.getByRole('combobox', { name: 'Size' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Delete' })).toBeEnabled()
      expect(
        screen.queryByTestId('InspectorInheritsFrom')
      ).not.toBeInTheDocument()

      fireEvent.keyDown(document.body, { key: 'Escape' })
      expect(screen.getByTestId('SelectionKind')).toHaveTextContent('region')
    })
  })

  describe('button Extra', () => {
    it('shows variant, size, align and both colours as inline rows on Style', () => {
      renderInspector({ selectedBlockId: 'heroButtonId' })

      expect(screen.getByRole('group', { name: 'Variant' })).toBeVisible()
      expect(screen.getByRole('group', { name: 'Size' })).toBeVisible()
      expect(screen.getByRole('group', { name: 'Align' })).toBeVisible()
      expect(screen.getByTestId('ButtonColourRow-color')).toBeVisible()
      expect(screen.getByTestId('ButtonColourRow-labelColor')).toBeVisible()
      expect(actionNames()).toEqual(['Delete'])
    })

    it('shows the host’s inherited colours in orange and no host controls on its own tab', () => {
      renderInspector({ selectedBlockId: 'heroButtonId' })

      expect(
        within(screen.getByTestId('ButtonColourRow-color')).getByTestId(
          'ValueIndicator'
        )
      ).toHaveAttribute('data-source', 'inherited')
      expect(
        screen.queryByRole('tab', { name: 'Background' })
      ).not.toBeInTheDocument()
      expect(screen.queryByTestId('CampaignStylePanel')).not.toBeInTheDocument()
    })

    it('shows the link on Settings', () => {
      renderInspector({
        selectedBlockId: 'heroButtonId',
        inspectorTab: 'settings'
      })

      expect(screen.getByTestId('LinkCurrent')).toHaveTextContent(
        'Choose your region'
      )
      expect(
        screen.getByRole('button', { name: 'Remove link' })
      ).toBeInTheDocument()
    })
  })

  describe('column child and column slot', () => {
    const mocks = [
      ratioMock,
      slotRichTextDeleteMock,
      swapMock,
      heroInSlotMock,
      richTextInSlotMock
    ]

    function renderColumns(
      selectedBlockId: string,
      inspectorTab: 'style' | 'settings' = 'settings'
    ): ReturnType<typeof render> {
      return renderInspector(
        { selectedBlockId, inspectorTab },
        campaignWithColumns,
        mocks
      )
    }

    it('shows Ratio above Background and Colours for a Columns section, one Command to change it', async () => {
      renderColumns('columnsId', 'style')

      const ratio = screen.getByTestId('ColumnsRatio')
      expect(
        within(ratio)
          .getAllByRole('button')
          .map((button) => button.textContent)
      ).toEqual(['Equal', 'Wide left', 'Wide right'])
      expect(screen.getByTestId('CampaignStylePanel')).toHaveAttribute(
        'data-block-id',
        'columnsId'
      )

      fireEvent.click(within(ratio).getByRole('button', { name: 'Wide right' }))

      await waitFor(() => expect(ratioMock.result).toHaveBeenCalled())
    })

    it('leaves Ratio to the Columns section, not the section in a slot', () => {
      renderColumns('slotRichTextId', 'style')

      expect(screen.queryByTestId('ColumnsRatio')).not.toBeInTheDocument()
    })

    it('styles the section in a slot on Style, under Columns › Column in the breadcrumb', () => {
      renderColumns('slotRichTextId', 'style')

      expect(screen.getByTestId('CampaignInspector')).toHaveAttribute(
        'data-selection',
        'column'
      )
      expect(
        within(screen.getByTestId('CampaignInspector')).getByTestId(
          'CampaignBreadcrumb'
        )
      ).toHaveTextContent('Campaign›Columns›Column›Rich text')
      expect(screen.getByTestId('CampaignStylePanel')).toHaveAttribute(
        'data-block-id',
        'slotRichTextId'
      )
    })

    it('offers Change type and swap on Settings, and the emptying bin', () => {
      renderColumns('slotRichTextId')

      expect(
        screen.getByRole('button', { name: 'Change type' })
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Swap columns' })).toBeEnabled()
      expect(actionNames()).toEqual(['Empty column'])
    })

    it('empties the column after a confirmation, soft-deleting the slot’s section and keeping the slot', async () => {
      renderColumns('slotRichTextId')

      fireEvent.click(screen.getByRole('button', { name: 'Empty column' }))

      const dialog = screen.getByTestId('CampaignSectionDeleteDialog')
      expect(dialog).toHaveTextContent('Empty column?')
      expect(dialog).toHaveTextContent('the column stays')
      expect(slotRichTextDeleteMock.result).not.toHaveBeenCalled()

      fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
      await waitFor(() =>
        expect(
          screen.queryByTestId('CampaignSectionDeleteDialog')
        ).not.toBeInTheDocument()
      )
      expect(slotRichTextDeleteMock.result).not.toHaveBeenCalled()

      fireEvent.click(screen.getByRole('button', { name: 'Empty column' }))
      fireEvent.click(
        within(screen.getByTestId('CampaignSectionDeleteDialog')).getByRole(
          'button',
          { name: 'Empty' }
        )
      )

      await waitFor(() =>
        expect(slotRichTextDeleteMock.result).toHaveBeenCalled()
      )
      expect(screen.getByTestId('SelectionKind')).toHaveTextContent('slot')
      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'slotLeftId'
      )
    })

    it('swaps the two slots with one order update, keeping the selection', async () => {
      renderColumns('slotRichTextId')

      fireEvent.click(screen.getByRole('button', { name: 'Swap columns' }))

      await waitFor(() => expect(swapMock.result).toHaveBeenCalled())
      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'slotRichTextId'
      )
    })

    it('changes the type: the menu leaves out the current type, Columns and Region share', async () => {
      renderColumns('slotRichTextId')

      fireEvent.click(screen.getByRole('button', { name: 'Change type' }))
      expect(menuItemNames()).toEqual([
        'Hero',
        'Region switcher',
        'Video carousel',
        'Journey list',
        'Analytics',
        'Featured media'
      ])

      fireEvent.click(screen.getByRole('menuitem', { name: 'Hero' }))

      await waitFor(() =>
        expect(slotRichTextDeleteMock.result).toHaveBeenCalled()
      )
      await waitFor(() => expect(heroInSlotMock.result).toHaveBeenCalled())
      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('newId')
    })

    it('says an empty slot is styled by its section, linking to Columns', () => {
      renderColumns('slotRightId', 'style')

      expect(screen.getByTestId('CampaignInspector')).toHaveAttribute(
        'data-selection',
        'slot'
      )
      expect(screen.getByText('Styled by its section')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Select Columns' }))

      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'columnsId'
      )
    })

    it('offers an empty slot a type picker without Columns or Region share', async () => {
      renderColumns('slotRightId')

      expect(
        screen.queryByRole('button', { name: 'Change type' })
      ).not.toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Choose type' }))
      expect(menuItemNames()).toEqual([
        'Hero',
        'Region switcher',
        'Video carousel',
        'Journey list',
        'Analytics',
        'Rich text',
        'Featured media'
      ])

      fireEvent.click(screen.getByRole('menuitem', { name: 'Rich text' }))

      await waitFor(() => expect(richTextInSlotMock.result).toHaveBeenCalled())
      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('newId')
    })

    it('offers a slot that holds a section only the swap', () => {
      renderColumns('slotLeftId')

      expect(
        screen.queryByRole('button', { name: 'Choose type' })
      ).not.toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Swap columns' })
      ).toBeInTheDocument()
    })
  })

  describe('journey card', () => {
    it('says it is styled by its list, under the list in the breadcrumb', () => {
      renderInspector({ selectedBlockId: 'landingJourneyId' })

      expect(screen.getByTestId('SelectionKind')).toHaveTextContent('journey')
      expect(
        within(screen.getByTestId('CampaignInspector')).getByTestId(
          'CampaignBreadcrumb'
        )
      ).toHaveTextContent('Campaign›Journey list›Journey')
      expect(screen.getByText('Styled by its section')).toBeInTheDocument()
      expect(actionNames()).toEqual(['Move left', 'Move right', 'Delete'])

      fireEvent.click(
        screen.getByRole('button', { name: 'Select Journey list' })
      )

      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'landingJourneyListId'
      )
    })

    it('shows the snapshot title and description with Refresh from journey on Settings', () => {
      renderInspector({
        selectedBlockId: 'landingJourneyId',
        inspectorTab: 'settings'
      })

      expect(screen.getByTestId('JourneyCardSettings')).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: 'Title' })).toHaveValue(
        'The outreach story'
      )
      expect(
        screen.getByRole('textbox', { name: 'Description' })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Refresh from journey' })
      ).toBeEnabled()
    })

    it('disables Move left on the first card and Move right on the last, counting only cards', () => {
      const { unmount } = renderInspector({
        selectedBlockId: 'landingJourneyId'
      })
      expect(screen.getByRole('button', { name: 'Move left' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Move right' })).toBeEnabled()
      unmount()

      renderInspector({ selectedBlockId: 'landingDraftJourneyId' })
      expect(screen.getByRole('button', { name: 'Move left' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Move right' })).toBeDisabled()
    })

    it('moves a card past its neighbour card as one order update', async () => {
      renderInspector({ selectedBlockId: 'landingDraftJourneyId' })

      fireEvent.click(screen.getByRole('button', { name: 'Move left' }))

      await waitFor(() =>
        expect(journeyCardMoveLeftMock.result).toHaveBeenCalled()
      )
      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'landingDraftJourneyId'
      )
    })

    it('deletes a card without confirmation and selects its list', async () => {
      renderInspector({ selectedBlockId: 'landingJourneyId' })

      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      await waitFor(() =>
        expect(journeyCardDeleteMock.result).toHaveBeenCalled()
      )
      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'landingJourneyListId'
      )
    })
  })

  describe('region card', () => {
    const regionState = {
      selectedRegionId: 'eurRegionId',
      selectedBlockId: 'landingSwitcherId'
    }

    it('says it is styled by its section, naming the region in the header', () => {
      renderInspector(regionState, campaignWithRegions)

      expect(screen.getByTestId('CampaignInspector')).toHaveAttribute(
        'data-selection',
        'region'
      )
      expect(screen.getByTestId('CampaignInspectorLabel')).toHaveTextContent(
        'Europe'
      )
      expect(
        within(screen.getByTestId('CampaignInspector')).getByTestId(
          'CampaignBreadcrumb'
        )
      ).toHaveTextContent('Campaign›Region switcher›Europe')
      expect(screen.getByText('Styled by its section')).toBeInTheDocument()
      expect(
        within(screen.getByTestId('CampaignInspector')).getByTestId(
          'Globe1Icon'
        )
      ).toBeInTheDocument()
      expect(
        within(screen.getByTestId('CampaignInspector')).queryByTestId(
          'Home3Icon'
        )
      ).not.toBeInTheDocument()

      fireEvent.click(
        screen.getByRole('button', { name: 'Select Region switcher' })
      )

      expect(screen.getByTestId('SelectionKind')).toHaveTextContent('section')
      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'landingSwitcherId'
      )
    })

    it('moves in the region order', () => {
      renderInspector(regionState, campaignWithRegions)

      expect(actionNames()).toEqual(['Move up', 'Move down'])
      expect(screen.getByRole('button', { name: 'Move up' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Move down' })).toBeEnabled()
    })

    it('shows the region settings with list / unlist on Settings, and Edit page switches the editor to that region page', () => {
      renderInspector(
        { ...regionState, inspectorTab: 'settings' },
        campaignWithRegions,
        [countriesMock]
      )

      expect(screen.getByTestId('RegionSettings')).toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Open page' })).toBeNull()
      expect(screen.getByRole('button', { name: 'Unlist' })).toBeEnabled()

      fireEvent.click(screen.getByRole('button', { name: 'Edit page' }))

      expect(screen.getByTestId('PageKind')).toHaveTextContent(
        'regionTemplate'
      )
    })
  })

  describe('carousel and its cards', () => {
    function carouselItem(
      id: string,
      parentOrder: number
    ): GetCampaign_campaign_blocks {
      return {
        ...withEmptyTranslations(youTubeVideoBlock),
        id,
        videoId: `${id}YouTube`,
        parentBlockId: 'carouselId',
        parentOrder
      } as GetCampaign_campaign_blocks
    }

    const carouselCampaign = {
      ...campaign,
      blocks: [
        ...campaign.blocks,
        carouselItem('firstItemId', 0),
        carouselItem('secondItemId', 1),
        carouselItem('thirdItemId', 2)
      ]
    }

    const moveRightMock = {
      request: {
        query: CAMPAIGN_BLOCK_ORDER_UPDATE,
        variables: { id: 'firstItemId', parentOrder: 1 }
      },
      result: vi.fn(() => ({
        data: {
          campaignBlockOrderUpdate: [
            {
              __typename: 'CampaignVideoBlock',
              id: 'secondItemId',
              parentOrder: 0
            },
            {
              __typename: 'CampaignVideoBlock',
              id: 'firstItemId',
              parentOrder: 1
            },
            {
              __typename: 'CampaignVideoBlock',
              id: 'thirdItemId',
              parentOrder: 2
            }
          ]
        }
      }))
    }

    const moveLeftMock = {
      request: {
        query: CAMPAIGN_BLOCK_ORDER_UPDATE,
        variables: { id: 'thirdItemId', parentOrder: 1 }
      },
      result: vi.fn(() => ({ data: { campaignBlockOrderUpdate: [] } }))
    }

    const cardDeleteMock = {
      request: {
        query: CAMPAIGN_BLOCK_DELETE,
        variables: { id: 'secondItemId' }
      },
      result: vi.fn(() => ({ data: { campaignBlockDelete: [] } }))
    }

    function renderCarousel(
      selectedBlockId: string,
      inspectorTab: 'style' | 'settings' = 'style'
    ): ReturnType<typeof render> {
      return render(
        <StaticEditor
          campaignProp={carouselCampaign}
          initialState={{ selectedBlockId, inspectorTab }}
          mocks={[moveRightMock, moveLeftMock, cardDeleteMock]}
        >
          <Hotkeys />
          <SelectionProbe />
          <CommandProbe />
          <Inspector isManager={false} />
        </StaticEditor>
      )
    }

    it('says a card is styled by its carousel, with move arrows and a delete', () => {
      renderCarousel('secondItemId')

      expect(screen.getByTestId('CampaignInspector')).toHaveAttribute(
        'data-selection',
        'card'
      )
      expect(
        within(screen.getByTestId('CampaignInspector')).getByTestId(
          'CampaignBreadcrumb'
        )
      ).toHaveTextContent('Campaign›Video carousel›Video')
      expect(screen.getByText('Styled by its section')).toBeInTheDocument()
      expect(actionNames()).toEqual(['Move left', 'Move right', 'Delete'])
      expect(screen.getByRole('button', { name: 'Move left' })).toBeEnabled()
      expect(screen.getByRole('button', { name: 'Move right' })).toBeEnabled()

      fireEvent.click(
        screen.getByRole('button', { name: 'Select Video carousel' })
      )

      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'carouselId'
      )
    })

    it('shows the title and description of a card on Settings', () => {
      renderCarousel('secondItemId', 'settings')

      expect(screen.getByTestId('CampaignCarouselCardEdit')).toHaveAttribute(
        'data-block-id',
        'secondItemId'
      )
    })

    it('shows the carousel editor on the carousel’s Settings', () => {
      renderCarousel('carouselId', 'settings')

      expect(screen.getByTestId('CampaignCarouselEdit')).toHaveAttribute(
        'data-block-id',
        'carouselId'
      )
    })

    it('disables ← on the first card and → on the last', () => {
      const { unmount } = renderCarousel('firstItemId')
      expect(screen.getByRole('button', { name: 'Move left' })).toBeDisabled()
      unmount()

      renderCarousel('thirdItemId')
      expect(screen.getByRole('button', { name: 'Move right' })).toBeDisabled()
    })

    it('moves a card right past its neighbour as one order Command', async () => {
      renderCarousel('firstItemId')

      fireEvent.click(screen.getByRole('button', { name: 'Move right' }))

      await waitFor(() => expect(moveRightMock.result).toHaveBeenCalled())
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'firstItemId'
      )
    })

    it('moves a card left to its neighbour’s position as one order Command', async () => {
      renderCarousel('thirdItemId')

      fireEvent.click(screen.getByRole('button', { name: 'Move left' }))

      await waitFor(() => expect(moveLeftMock.result).toHaveBeenCalled())
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    })

    it('deletes a card as one Command, with no confirmation', async () => {
      renderCarousel('secondItemId')

      fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      await waitFor(() => expect(cardDeleteMock.result).toHaveBeenCalled())
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'carouselId'
      )
    })

    it('steps up from a card to its carousel on Escape', async () => {
      renderCarousel('secondItemId')

      await userEvent.keyboard('{Escape}')

      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
        'carouselId'
      )
    })
  })

  describe('choosing a type for an empty column slot', () => {
    it('trees the new child under the slot from the cache, and selects it', async () => {
      render(
        <QueriedEditor
          initialState={{
            selectedBlockId: 'slotRightId',
            inspectorTab: 'settings'
          }}
          campaignProp={campaignWithColumns}
          mocks={[richTextInSlotMock]}
        >
          <SelectionProbe />
          <BlocksProbe />
          <Inspector isManager={false} />
        </QueriedEditor>
      )

      await waitFor(() =>
        expect(screen.getByTestId('SelectionKind')).toHaveTextContent('slot')
      )
      fireEvent.click(screen.getByRole('button', { name: 'Choose type' }))
      fireEvent.click(screen.getByRole('menuitem', { name: 'Rich text' }))

      await waitFor(() =>
        expect(screen.getByTestId('Block-newId')).toHaveTextContent(
          'CampaignRichTextBlock|slotRightId|0'
        )
      )
      expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('newId')
      expect(screen.getByTestId('SelectionKind')).toHaveTextContent('column')
    })
  })
})
