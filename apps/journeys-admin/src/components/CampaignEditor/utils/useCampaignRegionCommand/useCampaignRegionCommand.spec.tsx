import { MockLink } from '@apollo/client/testing'
import Button from '@mui/material/Button'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import { CAMPAIGN_REGION_CREATE } from '../../../../libs/useCampaignRegionCreateMutation'
import { CAMPAIGN_REGION_DELETE } from '../../../../libs/useCampaignRegionDeleteMutation'
import { CAMPAIGN_REGION_ORDER_UPDATE } from '../../../../libs/useCampaignRegionOrderUpdateMutation'
import { CAMPAIGN_REGION_UPDATE } from '../../../../libs/useCampaignRegionUpdateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaignWithRegions, eurRegion } from '../../data'
import { Hotkeys } from '../../Hotkeys'
import {
  CommandProbe,
  QueriedEditor,
  RegionsProbe,
  SpyMock,
  UndoRedo
} from '../../testing'

import {
  isEmptyRegion,
  newRegion,
  nextRegionSlug,
  reorderedRegions,
  useCampaignRegionCommand
} from './useCampaignRegionCommand'

vi.mock('uuid', () => ({ v4: () => 'newRegionId' }))

function updateMock(listed: boolean) {
  return {
    request: {
      query: CAMPAIGN_REGION_UPDATE,
      variables: { id: 'eurRegionId', input: { listed } }
    },
    result: vi.fn(() => ({
      data: {
        campaignRegionUpdate: {
          __typename: 'CampaignRegion',
          id: 'eurRegionId',
          name: 'Europe',
          slug: 'eur',
          listed
        }
      }
    }))
  }
}

function orderMock(order: number, rows: Array<[string, number]>) {
  return {
    request: {
      query: CAMPAIGN_REGION_ORDER_UPDATE,
      variables: { id: 'eurRegionId', order }
    },
    result: vi.fn(() => ({
      data: {
        campaignRegionOrderUpdate: rows.map(([id, rowOrder]) => ({
          __typename: 'CampaignRegion',
          id,
          order: rowOrder
        }))
      }
    }))
  }
}

const unlistMock = updateMock(false)
const listMock = updateMock(true)
const moveDownMock = orderMock(1, [
  ['afrRegionId', 0],
  ['eurRegionId', 1]
])
const moveBackMock = orderMock(0, [
  ['eurRegionId', 0],
  ['afrRegionId', 1]
])

const addedRegion = newRegion(campaignWithRegions, 'newRegionId')

const createMock: SpyMock = {
  request: {
    query: CAMPAIGN_REGION_CREATE,
    variables: { campaignId: campaignWithRegions.id, id: 'newRegionId' }
  },
  result: vi.fn(() => ({ data: { campaignRegionCreate: addedRegion } })),
  maxUsageCount: 2
}

const unlistAddedMock: SpyMock = {
  request: {
    query: CAMPAIGN_REGION_UPDATE,
    variables: { id: 'newRegionId', input: { listed: false } }
  },
  result: vi.fn(() => ({
    data: { campaignRegionUpdate: { ...addedRegion, listed: false } }
  }))
}

const deleteAddedMock: SpyMock = {
  request: { query: CAMPAIGN_REGION_DELETE, variables: { id: 'newRegionId' } },
  result: vi.fn(() => ({
    data: {
      campaignRegionDelete: { __typename: 'CampaignRegion', id: 'newRegionId' }
    }
  }))
}

function Controls(): ReactElement {
  const { campaign } = useCampaignEditor()
  const { addRegion, setListed, reorderRegion } = useCampaignRegionCommand()
  const eur = campaign.regions.find((region) => region.id === 'eurRegionId')
  if (eur == null) return <></>
  return (
    <>
      <Button onClick={() => setListed(eur, !eur.listed)}>Toggle listed</Button>
      <Button onClick={() => reorderRegion(eur, eur.order + 1)}>
        Move down
      </Button>
      <Button onClick={() => addRegion()}>Add region</Button>
    </>
  )
}

const refusal = { errors: [{ message: 'The request was refused' }] }

function renderCommands(
  mocks: MockLink.MockedResponse[] = [
    unlistMock,
    listMock,
    moveDownMock,
    moveBackMock
  ]
): ReturnType<typeof render> {
  return render(
    <QueriedEditor campaign={campaignWithRegions} mocks={mocks}>
      <Hotkeys />
      <CommandProbe />
      <RegionsProbe />
      <Controls />
      <UndoRedo />
    </QueriedEditor>
  )
}

describe('useCampaignRegionCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('unlists and lists as a Command with no confirmation, and undo reverses it', async () => {
    renderCommands()

    await waitFor(() =>
      expect(screen.getByTestId('Region-eurRegionId')).toHaveTextContent(
        'Europe|eur|0|true|FR'
      )
    )
    fireEvent.click(screen.getByRole('button', { name: 'Toggle listed' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(unlistMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('Region-eurRegionId')).toHaveTextContent(
      'Europe|eur|0|false|FR'
    )
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')

    fireEvent.keyDown(document.body, { key: 'z', metaKey: true })
    await waitFor(() => expect(listMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('Region-eurRegionId')).toHaveTextContent(
      'Europe|eur|0|true|FR'
    )
  })

  it('reorders as a Command with every region renumbered, and undo restores the order', async () => {
    renderCommands()

    await waitFor(() =>
      expect(screen.getByTestId('Region-eurRegionId')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Move down' }))

    await waitFor(() => expect(moveDownMock.result).toHaveBeenCalled())
    expect(
      screen
        .getAllByTestId(/^Region-/)
        .map((item) => item.getAttribute('data-testid'))
    ).toEqual(['Region-afrRegionId', 'Region-eurRegionId'])
    expect(screen.getByTestId('Region-eurRegionId')).toHaveTextContent(
      'Europe|eur|1|true|FR'
    )
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')

    fireEvent.keyDown(document.body, { key: 'z', metaKey: true })
    await waitFor(() => expect(moveBackMock.result).toHaveBeenCalled())
    expect(
      screen
        .getAllByTestId(/^Region-/)
        .map((item) => item.getAttribute('data-testid'))
    ).toEqual(['Region-eurRegionId', 'Region-afrRegionId'])
  })

  it('adds a region as a Command; undo unlists and deletes it while empty, and redo recreates it', async () => {
    renderCommands([createMock, unlistAddedMock, deleteAddedMock])
    await waitFor(() =>
      expect(screen.getByTestId('Region-eurRegionId')).toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Add region' }))

    await waitFor(() =>
      expect(screen.getByTestId('Region-newRegionId')).toHaveTextContent(
        'New region|new-region|2|true|'
      )
    )
    await waitFor(() => expect(createMock.result).toHaveBeenCalledTimes(1))
    expect(createMock.result).toHaveBeenCalledWith({
      campaignId: campaignWithRegions.id,
      id: 'newRegionId'
    })
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() =>
      expect(screen.queryByTestId('Region-newRegionId')).not.toBeInTheDocument()
    )
    expect(unlistAddedMock.result).toHaveBeenCalledTimes(1)
    expect(deleteAddedMock.result).toHaveBeenCalledWith({ id: 'newRegionId' })
    expect(
      screen
        .getAllByTestId(/^Region-/)
        .map((item) => item.getAttribute('data-testid'))
    ).toEqual(['Region-eurRegionId', 'Region-afrRegionId'])

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))

    await waitFor(() =>
      expect(screen.getByTestId('Region-newRegionId')).toHaveTextContent(
        'New region|new-region|2|true|'
      )
    )
    await waitFor(() => expect(createMock.result).toHaveBeenCalledTimes(2))
  })

  it('raises the API message in the error snackbar when a list or unlist is refused', async () => {
    renderCommands([{ ...unlistMock, result: refusal }])
    await waitFor(() =>
      expect(screen.getByTestId('Region-eurRegionId')).toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Toggle listed' }))

    expect(
      await screen.findByText('The request was refused')
    ).toBeInTheDocument()
  })

  it('raises the API message when a reorder is refused', async () => {
    renderCommands([{ ...moveDownMock, result: refusal }])
    await waitFor(() =>
      expect(screen.getByTestId('Region-eurRegionId')).toBeInTheDocument()
    )

    fireEvent.click(screen.getByRole('button', { name: 'Move down' }))

    expect(
      await screen.findByText('The request was refused')
    ).toBeInTheDocument()
  })

  describe('helpers', () => {
    it('derives the next new-region slug the way the API does', () => {
      expect(nextRegionSlug([])).toBe('new-region')
      expect(nextRegionSlug([{ slug: 'new-region' }])).toBe('new-region-2')
      expect(
        nextRegionSlug([{ slug: 'new-region' }, { slug: 'new-region-2' }])
      ).toBe('new-region-3')
    })

    it('computes the renumbered rows of a move, clamped to the end', () => {
      expect(
        reorderedRegions(campaignWithRegions.regions, eurRegion, 5)
      ).toEqual([
        { __typename: 'CampaignRegion', id: 'afrRegionId', order: 0 },
        { __typename: 'CampaignRegion', id: 'eurRegionId', order: 1 }
      ])
    })

    it('treats a region with lines, countries, another Share Language or an edited name or slug as no longer empty', () => {
      const afr = campaignWithRegions.regions.find(
        (region) => region.id === 'afrRegionId'
      )
      if (afr == null) throw new Error('fixture needs afrRegionId')
      const born = { name: afr.name, slug: afr.slug, languages: afr.languages }
      const renamed = (patch: Partial<typeof afr>) => ({
        ...campaignWithRegions,
        regions: campaignWithRegions.regions.map((region) =>
          region.id === 'afrRegionId' ? { ...region, ...patch } : region
        )
      })

      expect(isEmptyRegion(campaignWithRegions, 'eurRegionId', born)).toBe(
        false
      )
      expect(isEmptyRegion(campaignWithRegions, 'afrRegionId', born)).toBe(true)
      expect(isEmptyRegion(campaignWithRegions, 'missing', born)).toBe(false)
      expect(
        isEmptyRegion(renamed({ name: 'Europe' }), 'afrRegionId', born)
      ).toBe(false)
      expect(isEmptyRegion(renamed({ slug: 'eur' }), 'afrRegionId', born)).toBe(
        false
      )
      // An unlinked Share Language added since can hold a QR code.
      const french = {
        ...afr.languages[0],
        id: 'afrRegionId-496',
        languageId: '496'
      }
      expect(
        isEmptyRegion(
          renamed({ languages: [...afr.languages, french] }),
          'afrRegionId',
          born
        )
      ).toBe(false)
      expect(
        isEmptyRegion(
          renamed({
            languages: [{ ...afr.languages[0], qrCodeId: 'qrCodeId' }]
          }),
          'afrRegionId',
          born
        )
      ).toBe(false)
      expect(
        isEmptyRegion(
          renamed({
            languages: [{ ...afr.languages[0], journeyId: 'journeyId' }]
          }),
          'afrRegionId',
          born
        )
      ).toBe(false)
    })
  })
})
