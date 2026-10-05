import Button from '@mui/material/Button'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'

import { CAMPAIGN_REGION_ORDER_UPDATE } from '../../../../libs/useCampaignRegionOrderUpdateMutation'
import { CAMPAIGN_REGION_UPDATE } from '../../../../libs/useCampaignRegionUpdateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaignWithRegions, eurRegion } from '../../data'
import { Hotkeys } from '../../Hotkeys'
import { CommandProbe, QueriedEditor, RegionsProbe } from '../../testing'

import {
  isEmptyRegion,
  nextRegionSlug,
  reorderedRegions,
  useCampaignRegionCommand
} from './useCampaignRegionCommand'

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

function Controls(): ReactElement {
  const { campaign } = useCampaignEditor()
  const { setListed, reorderRegion } = useCampaignRegionCommand()
  const eur = campaign.regions.find((region) => region.id === 'eurRegionId')
  if (eur == null) return <></>
  return (
    <>
      <Button onClick={() => setListed(eur, !eur.listed)}>Toggle listed</Button>
      <Button onClick={() => reorderRegion(eur, eur.order + 1)}>
        Move down
      </Button>
    </>
  )
}

function renderCommands(): ReturnType<typeof render> {
  return render(
    <QueriedEditor
      campaignProp={campaignWithRegions}
      mocks={[unlistMock, listMock, moveDownMock, moveBackMock]}
    >
      <Hotkeys />
      <CommandProbe />
      <RegionsProbe />
      <Controls />
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

    it('treats a region with lines or countries as no longer empty', () => {
      expect(isEmptyRegion(campaignWithRegions, 'eurRegionId')).toBe(false)
      expect(isEmptyRegion(campaignWithRegions, 'afrRegionId')).toBe(true)
      expect(isEmptyRegion(campaignWithRegions, 'missing')).toBe(false)
    })
  })
})
