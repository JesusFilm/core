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
import { blockOf, blockUpdateMock } from '../../styleTesting'
import {
  CommandProbe,
  QueriedEditor,
  RegionsProbe,
  SpyMock,
  UndoRedo
} from '../../testing'
import { useCampaignBlockFieldsCommand } from '../useCampaignBlockFieldsCommand'

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
      <Button onClick={() => setListed(eur, true)}>List on switcher</Button>
      <Button onClick={() => reorderRegion(eur, eur.order + 1)}>
        Move down
      </Button>
      <Button onClick={() => addRegion()}>Add region</Button>
    </>
  )
}

function QueuedRegionMoves(): ReactElement {
  const { campaign } = useCampaignEditor()
  const { reorderRegion } = useCampaignRegionCommand()
  const { addFields } = useCampaignBlockFieldsCommand()
  return (
    <>
      <Button
        onClick={() =>
          addFields(blockOf<'CampaignHeroBlock'>('heroId'), { minHeight: 70 })
        }
      >
        Slow unrelated edit
      </Button>
      {[
        { name: 'First move', id: 'eurRegionId', order: 1 },
        { name: 'Move sibling', id: 'usaRegionId', order: 2 },
        { name: 'Second move', id: 'eurRegionId', order: 2 }
      ].map(({ name, id, order }) => (
        <Button
          key={name}
          onClick={() =>
            reorderRegion(
              campaign.regions.find((region) => region.id === id)!,
              order
            )
          }
        >
          {name}
        </Button>
      ))}
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

  it('captures queued List undo state at execution and retains it through replay', async () => {
    const unlist = { ...updateMock(false), delay: 500, maxUsageCount: 2 }
    const list = { ...updateMock(true), maxUsageCount: 6 }
    renderCommands([unlist, list])
    await screen.findByTestId('Region-eurRegionId')

    fireEvent.click(screen.getByRole('button', { name: 'Toggle listed' }))
    fireEvent.click(screen.getByRole('button', { name: 'List on switcher' }))
    fireEvent.click(screen.getByRole('button', { name: 'List on switcher' }))
    expect(unlist.result).not.toHaveBeenCalled()
    expect(list.result).not.toHaveBeenCalled()
    await waitFor(() => expect(list.result).toHaveBeenCalledTimes(2))

    for (let replay = 0; replay < 2; replay++) {
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() =>
        expect(list.result).toHaveBeenCalledTimes(3 + replay * 2)
      )
      expect(screen.getByTestId('Region-eurRegionId')).toHaveTextContent(
        'Europe|eur|0|true|FR'
      )
      if (replay === 1) break
      fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
      await waitFor(() => expect(list.result).toHaveBeenCalledTimes(4))
    }

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(unlist.result).toHaveBeenCalledTimes(2))
    expect(screen.getByTestId('Region-eurRegionId')).toHaveTextContent(
      'Europe|eur|0|false|FR'
    )
  })

  it('captures queued region positions at execution and preserves current siblings through replay', async () => {
    const data = {
      ...campaignWithRegions,
      regions: [
        ...campaignWithRegions.regions,
        ...['asia', 'usa'].map((slug, index) => ({
          ...eurRegion,
          id: `${slug}RegionId`,
          name: slug,
          slug,
          order: index + 2,
          countries: [],
          languages: []
        }))
      ]
    }
    function move(
      id: string,
      order: number,
      ids: string[],
      delay = 20
    ): SpyMock {
      return {
        request: {
          query: CAMPAIGN_REGION_ORDER_UPDATE,
          variables: { id, order }
        },
        result: vi.fn(() => ({
          data: {
            campaignRegionOrderUpdate: ids.map((id, order) => ({
              __typename: 'CampaignRegion',
              id,
              order
            }))
          }
        })),
        delay,
        maxUsageCount: 3
      }
    }
    const slow = {
      ...blockUpdateMock(blockOf<'CampaignHeroBlock'>('heroId'), {
        minHeight: 70
      }),
      delay: 300
    }
    const first = move('eurRegionId', 1, [
      'afrRegionId',
      'eurRegionId',
      'asiaRegionId',
      'usaRegionId'
    ])
    const sibling = move('usaRegionId', 2, [
      'afrRegionId',
      'eurRegionId',
      'usaRegionId',
      'asiaRegionId'
    ])
    const second = move(
      'eurRegionId',
      2,
      ['afrRegionId', 'usaRegionId', 'eurRegionId', 'asiaRegionId'],
      300
    )
    const undo = move('eurRegionId', 1, [
      'afrRegionId',
      'eurRegionId',
      'usaRegionId',
      'asiaRegionId'
    ])
    render(
      <QueriedEditor
        campaign={data}
        mocks={[slow, { ...first, maxUsageCount: 1 }, sibling, second, undo]}
      >
        <QueuedRegionMoves />
        <RegionsProbe />
        <UndoRedo />
      </QueriedEditor>
    )
    fireEvent.click(
      await screen.findByRole('button', { name: 'Slow unrelated edit' })
    )
    fireEvent.click(screen.getByRole('button', { name: 'First move' }))
    fireEvent.click(screen.getByRole('button', { name: 'Move sibling' }))
    fireEvent.click(screen.getByRole('button', { name: 'Second move' }))
    expect(slow.result).not.toHaveBeenCalled()
    expect(first.result).not.toHaveBeenCalled()
    const regionIds = () =>
      screen
        .getAllByTestId(/^Region-/)
        .map((item) => item.getAttribute('data-testid'))

    await waitFor(() =>
      expect(regionIds()).toEqual([
        'Region-afrRegionId',
        'Region-usaRegionId',
        'Region-eurRegionId',
        'Region-asiaRegionId'
      ])
    )
    expect(second.result).not.toHaveBeenCalled()
    await waitFor(() => expect(second.result).toHaveBeenCalledTimes(1))

    for (let replay = 1; replay <= 2; replay++) {
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(undo.result).toHaveBeenCalledTimes(replay))
      expect(regionIds()).toEqual([
        'Region-afrRegionId',
        'Region-eurRegionId',
        'Region-usaRegionId',
        'Region-asiaRegionId'
      ])
      if (replay === 2) break
      fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
      await waitFor(() => expect(second.result).toHaveBeenCalledTimes(2))
    }
  })

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
