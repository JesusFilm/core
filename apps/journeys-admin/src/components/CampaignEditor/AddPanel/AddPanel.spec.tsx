import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import {
  CAMPAIGN_COLUMNS_BLOCK_CREATE,
  CAMPAIGN_HERO_BLOCK_CREATE,
  CAMPAIGN_REGION_SHARE_BLOCK_CREATE
} from '../../../libs/useCampaignSectionCreateMutation'
import { CAMPAIGN_TYPOGRAPHY_BLOCK_CREATE } from '../../../libs/useCampaignTypographyBlockCreateMutation'
import { CampaignEditorState } from '../CampaignEditorProvider'
import { campaign, campaignWithColumns, campaignWithRegions } from '../data'
import { newSectionBlock } from '../sectionTypes'
import { SelectionProbe, StaticEditor } from '../testing'

import { AddPanel } from './AddPanel'

vi.mock('uuid', () => ({ v4: vi.fn(() => 'newId') }))

const typographyResult = (
  overrides: Record<string, unknown>
): Record<string, unknown> => ({
  __typename: 'CampaignTypographyBlock',
  id: 'newId',
  campaignId: 'campaignId',
  pageId: null,
  regionId: null,
  parentBlockId: null,
  parentOrder: 2,
  content: '',
  contentTranslations: [],
  typographyVariant: null,
  align: null,
  color: null,
  placement: null,
  ...overrides
})

const extraBelowMock = {
  request: {
    query: CAMPAIGN_TYPOGRAPHY_BLOCK_CREATE,
    variables: {
      input: {
        id: 'newId',
        campaignId: 'campaignId',
        parentBlockId: 'footerId',
        placement: 'below'
      }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignTypographyBlockCreate: typographyResult({
        parentBlockId: 'footerId',
        placement: 'below'
      })
    }
  }))
}

const extraAboveMock = {
  request: {
    query: CAMPAIGN_TYPOGRAPHY_BLOCK_CREATE,
    variables: {
      input: {
        id: 'newId',
        campaignId: 'campaignId',
        parentBlockId: 'heroId',
        placement: 'above'
      }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignTypographyBlockCreate: typographyResult({
        pageId: 'landingPageId',
        parentBlockId: 'heroId',
        placement: 'above'
      })
    }
  }))
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

const heroIntoSlotMock = {
  request: {
    query: CAMPAIGN_HERO_BLOCK_CREATE,
    variables: {
      input: {
        id: 'newId',
        campaignId: 'campaignId',
        pageId: 'landingPageId',
        parentOrder: 0,
        parentBlockId: 'slotLeftId'
      }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignHeroBlockCreate: newSectionBlock('CampaignHeroBlock', {
        id: 'newId',
        campaignId: 'campaignId',
        pageId: 'landingPageId',
        parentOrder: 0,
        parentBlockId: 'slotLeftId'
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

const lineCreateMock = {
  request: {
    query: CAMPAIGN_TYPOGRAPHY_BLOCK_CREATE,
    variables: {
      input: { id: 'newId', campaignId: 'campaignId', regionId: 'eurRegionId' }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignTypographyBlockCreate: typographyResult({
        regionId: 'eurRegionId',
        parentOrder: 1
      })
    }
  }))
}

const columnsCreateMock = {
  request: {
    query: CAMPAIGN_COLUMNS_BLOCK_CREATE,
    variables: {
      input: {
        id: 'columnsNewId',
        campaignId: 'campaignId',
        pageId: 'landingPageId',
        parentOrder: 5,
        slotIds: ['slotANewId', 'slotBNewId']
      }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignColumnsBlockCreate: newSectionBlock('CampaignColumnsBlock', {
        id: 'columnsNewId',
        campaignId: 'campaignId',
        pageId: 'landingPageId',
        parentOrder: 5
      })
    }
  }))
}

function renderPanel(
  initialState?: Partial<CampaignEditorState>,
  campaignProp = campaign
): ReturnType<typeof render> {
  return render(
    <StaticEditor
      initialState={initialState}
      campaignProp={campaignProp}
      mocks={[
        extraBelowMock,
        extraAboveMock,
        heroBelowMock,
        heroIntoSlotMock,
        regionShareAppendMock,
        lineCreateMock,
        columnsCreateMock
      ]}
    >
      <SelectionProbe />
      <AddPanel />
    </StaticEditor>
  )
}

function buttonNames(): string[] {
  return screen
    .getAllByRole('button')
    .map((button) => button.getAttribute('aria-label') ?? button.textContent)
    .filter((name): name is string => name != null && name !== '')
}

const LANDING_SECTIONS = [
  'Hero',
  'Region switcher',
  'Video carousel',
  'Journey list',
  'Analytics',
  'Rich text',
  'Columns',
  'Image',
  'Featured media'
]

describe('AddPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(uuidv4).mockImplementation(() => 'newId')
  })

  it('lists the landing page’s section types with nothing selected, and says Extras need a section', () => {
    renderPanel()

    expect(buttonNames()).toEqual(LANDING_SECTIONS)
    expect(
      screen.getByText('Select a section to add text or a button to it.')
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Add line' })).toBeNull()
  })

  it('appends a section to the Region Page with nothing selected, offering all eleven types', async () => {
    renderPanel({ pageKind: CampaignPageKind.regionTemplate })

    expect(buttonNames()).toEqual([
      'Hero',
      'Region switcher',
      'Video carousel',
      'Journey list',
      'Analytics',
      'Region header',
      'Region share',
      'Rich text',
      'Columns',
      'Image',
      'Featured media'
    ])

    fireEvent.click(screen.getByRole('button', { name: 'Region share' }))

    await waitFor(() => expect(regionShareAppendMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('newId')
    expect(screen.getByTestId('PageKind')).toHaveTextContent('regionTemplate')
  })

  it('adds a Columns section with the ids of its two slots', async () => {
    vi.mocked(uuidv4)
      .mockImplementationOnce(() => 'columnsNewId')
      .mockImplementationOnce(() => 'slotANewId')
      .mockImplementationOnce(() => 'slotBNewId')
    renderPanel()

    fireEvent.click(screen.getByRole('button', { name: 'Columns' }))

    await waitFor(() => expect(columnsCreateMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'columnsNewId'
    )
  })

  it('adds a section below the selected section', async () => {
    renderPanel({ selectedBlockId: 'heroId' })

    fireEvent.click(screen.getByRole('button', { name: 'Hero' }))

    await waitFor(() => expect(heroBelowMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('newId')
  })

  it('adds an Extra into the selected section, above its text when chosen', async () => {
    renderPanel({ selectedBlockId: 'heroId' })

    expect(screen.getByRole('button', { name: 'Below text' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Above text' }))
    fireEvent.click(screen.getByRole('button', { name: 'Text' }))

    await waitFor(() => expect(extraAboveMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('newId')
  })

  it('offers only Button for the header, whose nav renders buttons only', () => {
    renderPanel({ selectedBlockId: 'headerId' })

    const extras = screen.getByRole('list', { name: 'Extras' })
    expect(
      within(extras).getByRole('button', { name: 'Button' })
    ).toBeInTheDocument()
    expect(within(extras).queryByRole('button', { name: 'Text' })).toBeNull()
  })

  it('adds a text Extra below the footer, with the chrome block’s page-wide section list', async () => {
    renderPanel({ selectedBlockId: 'footerId' })

    const extras = screen.getByRole('list', { name: 'Extras' })
    expect(
      within(extras).getByRole('button', { name: 'Button' })
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Text' }))

    await waitFor(() => expect(extraBelowMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('newId')
  })

  it('has no placement choice for an Extra, which repeats the selected Extra’s placement', () => {
    renderPanel({ selectedBlockId: 'heroButtonId' })

    expect(screen.queryByRole('button', { name: 'Above text' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Text' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Button' })).toBeInTheDocument()
    expect(
      screen.getByText('Select an empty column, or a section not in a column.')
    ).toBeInTheDocument()
  })

  it('adds a section into an empty Column Slot, offering only the types that fit a column', async () => {
    renderPanel({ selectedBlockId: 'slotRightId' }, campaignWithColumns)

    expect(buttonNames()).toEqual([
      'Hero',
      'Region switcher',
      'Video carousel',
      'Journey list',
      'Analytics',
      'Rich text',
      'Featured media'
    ])
    expect(screen.queryByRole('button', { name: 'Columns' })).toBeNull()
  })

  it('adds a Hero into the selected slot as its one section', async () => {
    renderPanel(
      { selectedBlockId: 'slotLeftId' },
      {
        ...campaignWithColumns,
        blocks: campaignWithColumns.blocks.filter(
          (block) => block.id !== 'slotRichTextId'
        )
      }
    )

    fireEvent.click(screen.getByRole('button', { name: 'Hero' }))

    await waitFor(() => expect(heroIntoSlotMock.result).toHaveBeenCalled())
  })

  it('offers no section for a slot that already holds one', () => {
    renderPanel({ selectedBlockId: 'slotLeftId' }, campaignWithColumns)

    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('shows the Region group with Add line for a selected region card and adds a Region Line', async () => {
    renderPanel(
      { selectedRegionId: 'eurRegionId', selectedBlockId: 'landingSwitcherId' },
      campaignWithRegions
    )

    expect(buttonNames()).toEqual(['Add line'])
    fireEvent.click(screen.getByRole('button', { name: 'Add line' }))

    await waitFor(() => expect(lineCreateMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('newId')
  })
})
