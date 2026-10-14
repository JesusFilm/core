import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
import { Hotkeys } from '../Hotkeys'
import { newSectionBlock } from '../sectionTypes'
import { SelectionProbe, StaticEditor } from '../testing'

import { BottomBar } from './BottomBar'

vi.mock('uuid', () => ({ v4: vi.fn(() => 'newId') }))

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

const lineCreateMock = {
  request: {
    query: CAMPAIGN_TYPOGRAPHY_BLOCK_CREATE,
    variables: {
      input: { id: 'newId', campaignId: 'campaignId', regionId: 'eurRegionId' }
    }
  },
  result: vi.fn(() => ({
    data: {
      campaignTypographyBlockCreate: {
        __typename: 'CampaignTypographyBlock',
        id: 'newId',
        campaignId: 'campaignId',
        pageId: null,
        regionId: 'eurRegionId',
        parentBlockId: null,
        parentOrder: 1,
        content: '',
        typographyVariant: null,
        align: null,
        color: null,
        placement: null
      }
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

function renderBar(
  initialState?: Partial<CampaignEditorState>,
  campaignProp = campaign,
  props: Parameters<typeof BottomBar>[0] = {}
): ReturnType<typeof render> {
  return render(
    <StaticEditor
      initialState={initialState}
      campaignProp={campaignProp}
      mocks={[
        createMock,
        heroBelowMock,
        regionShareAppendMock,
        lineCreateMock,
        columnsCreateMock
      ]}
    >
      <Hotkeys />
      <SelectionProbe />
      <BottomBar {...props} />
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

  it('shows Languages, Translations and Add section on the campaign row, and no Settings or Theme', () => {
    renderBar()

    expect(screen.getByTestId('CampaignBottomBar')).toHaveAttribute(
      'data-selection',
      'campaign'
    )
    expect(buttonNames()).toEqual(['Languages', 'Translations', 'Add section'])
    expect(screen.getByRole('button', { name: 'Add section' })).toBeEnabled()
  })

  it('opens the Languages and Translations views through their callbacks', () => {
    const onLanguagesClick = vi.fn()
    const onTranslationsClick = vi.fn()
    renderBar(undefined, campaign, { onLanguagesClick, onTranslationsClick })

    fireEvent.click(screen.getByRole('button', { name: 'Languages' }))
    expect(onLanguagesClick).toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Translations' }))
    expect(onTranslationsClick).toHaveBeenCalled()
  })

  it('keeps only the breadcrumb and Add line for a selected region card', () => {
    renderBar(
      { selectedRegionId: 'eurRegionId', selectedBlockId: 'landingSwitcherId' },
      campaignWithRegions
    )

    expect(screen.getByTestId('CampaignBottomBar')).toHaveAttribute(
      'data-selection',
      'region'
    )
    expect(screen.getByTestId('CampaignBreadcrumb')).toHaveTextContent(
      'Campaign›Region switcher›Europe'
    )
    expect(buttonNames()).toEqual(['Campaign', 'Region switcher', 'Add line'])
    expect(screen.queryByRole('link', { name: 'Open page' })).toBeNull()
  })

  it('adds a Region Line as a Command and selects it for inline editing', async () => {
    renderBar(
      { selectedRegionId: 'eurRegionId', selectedBlockId: 'landingSwitcherId' },
      campaignWithRegions
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add line' }))

    await waitFor(() => expect(lineCreateMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('newId')
  })

  it('shows a Region Line as text in its region, with only the breadcrumb', () => {
    renderBar({ selectedBlockId: 'eurLineId' }, campaignWithRegions)

    expect(screen.getByTestId('CampaignBottomBar')).toHaveAttribute(
      'data-selection',
      'text'
    )
    expect(screen.getByTestId('CampaignBreadcrumb')).toHaveTextContent(
      'Campaign›Europe›Text'
    )
    expect(buttonNames()).toEqual(['Campaign', 'Europe'])

    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('region')
  })

  it('loses Edit, Style, move, duplicate and delete for a section, keeping Add', () => {
    renderBar({ selectedBlockId: 'heroId' })

    expect(buttonNames()).toEqual(['Campaign', 'Add'])
  })

  it('loses every control for an Extra, a card and a slot but the breadcrumb', () => {
    const { unmount } = renderBar({ selectedBlockId: 'heroButtonId' })
    expect(buttonNames()).toEqual(['Campaign', 'Hero'])
    unmount()

    const columns = renderBar(
      { selectedBlockId: 'slotRightId' },
      campaignWithColumns
    )
    expect(buttonNames()).toEqual(['Campaign', 'Columns'])
    columns.unmount()

    renderBar({ selectedBlockId: 'landingJourneyId' })
    expect(buttonNames()).toEqual(['Campaign', 'Journey list'])
  })

  it('shows Add only for chrome, names it in the breadcrumb, and Escape goes up to the campaign row', async () => {
    renderBar({ selectedBlockId: 'footerId' })

    expect(buttonNames()).toEqual(['Campaign', 'Add'])
    expect(screen.getByTestId('CampaignBreadcrumb')).toHaveTextContent('Footer')
    expect(screen.getByTestId('CampaignBottomBar')).toHaveAttribute(
      'data-selection',
      'chrome'
    )

    await userEvent.keyboard('{Escape}')

    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('campaign')
    expect(buttonNames()).toEqual(['Languages', 'Translations', 'Add section'])
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
        'Analytics',
        'Rich text',
        'Columns',
        'Image',
        'Featured media'
      ])
    )

    fireEvent.click(screen.getByRole('menuitem', { name: 'Hero' }))

    await waitFor(() => expect(heroBelowMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('newId')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('appends a section to the Region Page from the campaign row, offering all eleven types', async () => {
    renderBar({ pageKind: CampaignPageKind.regionTemplate })

    fireEvent.click(screen.getByRole('button', { name: 'Add section' }))
    expect(menuItemNames()).toEqual([
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

    fireEvent.click(screen.getByRole('menuitem', { name: 'Region share' }))

    await waitFor(() => expect(regionShareAppendMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('newId')
    expect(screen.getByTestId('PageKind')).toHaveTextContent('regionTemplate')
  })

  it('adds a Columns section with the ids of its two slots', async () => {
    vi.mocked(uuidv4)
      .mockImplementationOnce(() => 'columnsNewId')
      .mockImplementationOnce(() => 'slotANewId')
      .mockImplementationOnce(() => 'slotBNewId')
    renderBar()

    fireEvent.click(screen.getByRole('button', { name: 'Add section' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Columns' }))

    await waitFor(() => expect(columnsCreateMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'columnsNewId'
    )
  })

  it('offers extras only from a slot section’s Add', () => {
    renderBar({ selectedBlockId: 'slotRichTextId' }, campaignWithColumns)

    expect(buttonNames()).toEqual(['Campaign', 'Columns', 'Column', 'Add'])
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    expect(menuItemNames()).toEqual([
      'Text above',
      'Text below',
      'Button above',
      'Button below'
    ])
  })
})
