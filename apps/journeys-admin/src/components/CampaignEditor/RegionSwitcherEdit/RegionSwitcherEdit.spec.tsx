import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { CAMPAIGN_REGION_CREATE } from '../../../libs/useCampaignRegionCreateMutation'
import { CAMPAIGN_REGION_DELETE } from '../../../libs/useCampaignRegionDeleteMutation'
import { CAMPAIGN_REGION_UPDATE } from '../../../libs/useCampaignRegionUpdateMutation'
import { CampaignEditorState } from '../CampaignEditorProvider'
import { campaign, campaignWithRegions } from '../data'
import { Hotkeys } from '../Hotkeys'
import {
  CommandProbe,
  QueriedEditor,
  RegionsProbe,
  SelectionProbe
} from '../testing'
import { newRegion } from '../utils/useCampaignRegionCommand'

import { RegionSwitcherEdit } from './RegionSwitcherEdit'

vi.mock('uuid', () => ({ v4: vi.fn(() => 'newId') }))

const created = newRegion(campaign, 'newId')

const createMock = {
  request: {
    query: CAMPAIGN_REGION_CREATE,
    variables: { campaignId: 'campaignId', id: 'newId' }
  },
  result: vi.fn(() => ({ data: { campaignRegionCreate: created } }))
}

const unlistMock = {
  request: {
    query: CAMPAIGN_REGION_UPDATE,
    variables: { id: 'newId', input: { listed: false } }
  },
  result: vi.fn(() => ({
    data: {
      campaignRegionUpdate: {
        __typename: 'CampaignRegion',
        id: 'newId',
        name: 'New region',
        slug: 'new-region',
        listed: false
      }
    }
  }))
}

const deleteMock = {
  request: { query: CAMPAIGN_REGION_DELETE, variables: { id: 'newId' } },
  result: vi.fn(() => ({
    data: {
      campaignRegionDelete: { __typename: 'CampaignRegion', id: 'newId' }
    }
  }))
}

function renderSwitcher(
  campaignProp = campaign,
  initialState?: Partial<CampaignEditorState>
): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      campaignProp={campaignProp}
      initialState={initialState}
      mocks={[createMock, unlistMock, deleteMock]}
    >
      <Hotkeys />
      <SelectionProbe />
      <CommandProbe />
      <RegionsProbe />
      <RegionSwitcherEdit block={{ id: 'landingSwitcherId' }} />
    </QueriedEditor>
  )
}

describe('RegionSwitcherEdit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(uuidv4).mockImplementation(() => 'newId')
  })

  it('reads "Add your first region" with + Add when no region is listed', async () => {
    renderSwitcher()

    await waitFor(() =>
      expect(screen.getByTestId('RegionSwitcherEmpty')).toBeInTheDocument()
    )
    expect(screen.getByText('Add your first region')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
  })

  it('shows the listed regions as cards with name, lines and country chips, and the current region hidden', async () => {
    renderSwitcher(campaignWithRegions, {
      pageKind: CampaignPageKind.regionTemplate,
      regionId: 'afrRegionId'
    })

    await waitFor(() =>
      expect(
        screen.getByTestId('RegionCardEdit-eurRegionId')
      ).toBeInTheDocument()
    )
    expect(screen.getByTestId('RegionCardName')).toHaveTextContent('Europe')
    expect(screen.getByTestId('RegionLineEdit-eurLineId')).toHaveTextContent(
      'EUR'
    )
    expect(screen.getByTestId('CampaignRegionCountry')).toHaveTextContent(
      'France'
    )
    // Africa is unlisted; and the region being rendered never shows itself.
    expect(
      screen.queryByTestId('RegionCardEdit-afrRegionId')
    ).not.toBeInTheDocument()
  })

  it(`carries a "Needs journey" badge while any of the region's languages is unlinked`, async () => {
    renderSwitcher(
      {
        ...campaignWithRegions,
        regions: campaignWithRegions.regions.map((region) =>
          region.id === 'afrRegionId'
            ? {
                ...region,
                listed: true,
                languages: [{ ...region.languages[0], journeyId: 'journeyId' }]
              }
            : region
        )
      },
      { pageKind: CampaignPageKind.landing }
    )

    // Europe's French is unlinked; Africa's one language is linked.
    const europe = await screen.findByTestId('RegionCardEdit-eurRegionId')
    expect(within(europe).getByTestId('RegionNeedsJourney')).toHaveTextContent(
      'Needs journey'
    )
    const africa = screen.getByTestId('RegionCardEdit-afrRegionId')
    expect(
      within(africa).queryByTestId('RegionNeedsJourney')
    ).not.toBeInTheDocument()
  })

  it('hides the region whose page is being edited', async () => {
    renderSwitcher(campaignWithRegions, {
      pageKind: CampaignPageKind.regionTemplate,
      regionId: 'eurRegionId'
    })

    await waitFor(() =>
      expect(screen.getByTestId('RegionSwitcherEmpty')).toBeInTheDocument()
    )
  })

  it('runs campaignRegionCreate from + Add as a Command and selects the new card', async () => {
    renderSwitcher()

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))

    await waitFor(() => expect(createMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('Region-newId')).toHaveTextContent(
      'New region|new-region|0|true|'
    )
    expect(screen.getByTestId('RegionCardEdit-newId')).toHaveAttribute(
      'data-selected',
      'true'
    )
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('region')
    expect(screen.getByTestId('SelectedRegionId')).toHaveTextContent('newId')
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent(
      'landingSwitcherId'
    )
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
  })

  it('deletes a just-created, still-empty region on undo, unlisting it first', async () => {
    renderSwitcher()

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(createMock.result).toHaveBeenCalled())

    fireEvent.keyDown(document.body, { key: 'z', metaKey: true })

    await waitFor(() => expect(unlistMock.result).toHaveBeenCalled())
    await waitFor(() => expect(deleteMock.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(screen.queryByTestId('Region-newId')).not.toBeInTheDocument()
    )
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('campaign')
    expect(screen.getByTestId('RegionSwitcherEmpty')).toBeInTheDocument()
  })

  it('selects a card on click and a line on its own click', async () => {
    renderSwitcher(campaignWithRegions)

    await waitFor(() =>
      expect(
        screen.getByTestId('RegionCardEdit-eurRegionId')
      ).toBeInTheDocument()
    )
    fireEvent.click(screen.getByTestId('RegionCardName'))
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('region')
    expect(screen.getByTestId('SelectedRegionId')).toHaveTextContent(
      'eurRegionId'
    )

    fireEvent.click(screen.getByTestId('RegionLineEdit-eurLineId'))
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('text')
    expect(screen.getByTestId('SelectedBlockId')).toHaveTextContent('eurLineId')
    expect(screen.getByRole('textbox', { name: 'Your text' })).toHaveValue(
      'EUR'
    )

    // Escape steps a line up to its region, then the region to its switcher.
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('region')
    fireEvent.keyDown(document.body, { key: 'Escape' })
    expect(screen.getByTestId('SelectionKind')).toHaveTextContent('campaign')
  })
})
