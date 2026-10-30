import { MockLink } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement, useState } from 'react'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks_CampaignVideoCarouselBlock as CampaignVideoCarouselBlock
} from '../../../../../__generated__/GetCampaign'
import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
import { CAMPAIGN_BLOCK_DELETE } from '../../../../libs/useCampaignBlockDeleteMutation'
import { CAMPAIGN_BLOCK_RESTORE } from '../../../../libs/useCampaignBlockRestoreMutation'
import {
  CAMPAIGN_VIDEO_BLOCK_CREATE,
  CampaignVideoPick,
  newOwnedVideoBlock
} from '../../../../libs/useCampaignVideoBlockCreateMutation'
import { CAMPAIGN_VIDEO_CAROUSEL_BLOCK_PLAYLIST_IMPORT } from '../../../../libs/useCampaignVideoCarouselBlockPlaylistImportMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaign } from '../../data'
import { blockOf, blockUpdateMock } from '../../styleTesting'
import { BlocksProbe, QueriedEditor, SpyMock, UndoRedo } from '../../testing'

import {
  fitCampaignText,
  useCampaignCarouselCommand
} from './useCampaignCarouselCommand'

vi.mock('uuid', () => ({ v4: () => 'newItemId' }))

const carousel = blockOf<'CampaignVideoCarouselBlock'>('carouselId')
const YOUTUBE: CampaignVideoPick = {
  source: VideoBlockSource.youTube,
  videoId: 'jQaeIJOA6J0'
}
const PLAYLIST_URL =
  'https://www.youtube.com/playlist?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG'
const refusal = { errors: [{ message: 'The request was refused' }] }

/** The carousel expanded from a Watch video, as a pasted Watch link leaves it. */
const watchCarousel: CampaignVideoCarouselBlock = {
  ...carousel,
  videoId: 'watchVideoId',
  videoVariantLanguageId: '529'
}
const campaignWithWatchCarousel: Campaign = {
  ...campaign,
  blocks: campaign.blocks.map((block) =>
    block.id === carousel.id ? watchCarousel : block
  )
}

/** Mutations in the order they reached the API. */
const calls: string[] = []

const createMock = {
  delay: 100,
  request: {
    query: CAMPAIGN_VIDEO_BLOCK_CREATE,
    variables: {
      input: {
        id: 'newItemId',
        campaignId: campaign.id,
        parentBlockId: carousel.id,
        ...YOUTUBE
      }
    }
  },
  result: vi.fn(() => {
    calls.push('create newItemId')
    return {
      data: {
        campaignVideoBlockCreate: {
          ...newOwnedVideoBlock('newItemId', carousel, YOUTUBE),
          parentOrder: 0,
          title: 'Blessing and Curse',
          image: 'https://i.ytimg.com/vi/jQaeIJOA6J0/high.jpg',
          duration: 363
        }
      }
    }
  })
}

const refusedCreateMock = {
  ...createMock,
  result: vi.fn(() => {
    calls.push('create newItemId')
    return refusal
  })
}

const deleteMock = {
  request: { query: CAMPAIGN_BLOCK_DELETE, variables: { id: 'newItemId' } },
  result: vi.fn(() => {
    calls.push('delete newItemId')
    return { data: { campaignBlockDelete: [] } }
  })
}

const restoreMock: SpyMock = {
  request: { query: CAMPAIGN_BLOCK_RESTORE, variables: { id: 'newItemId' } },
  result: vi.fn(() => {
    calls.push('restore newItemId')
    return {
      data: {
        campaignBlockRestore: [
          {
            ...newOwnedVideoBlock('newItemId', carousel, YOUTUBE),
            parentOrder: 0,
            title: 'Blessing and Curse',
            image: 'https://i.ytimg.com/vi/jQaeIJOA6J0/high.jpg',
            duration: 363
          }
        ]
      }
    }
  })
}

const PLAYLIST_ITEM_IDS = ['playlistItem0', 'playlistItem1', 'playlistItem2']

const playlistMock: SpyMock = {
  request: {
    query: CAMPAIGN_VIDEO_CAROUSEL_BLOCK_PLAYLIST_IMPORT,
    variables: { id: carousel.id, url: PLAYLIST_URL }
  },
  result: vi.fn(() => {
    calls.push('import playlist')
    return {
      data: {
        campaignVideoCarouselBlockPlaylistImport: PLAYLIST_ITEM_IDS.map(
          (id, parentOrder) => ({
            ...newOwnedVideoBlock(id, carousel, {
              source: VideoBlockSource.youTube,
              videoId: `youTube-${id}`
            }),
            parentOrder,
            title: `Reading ${parentOrder + 1}`
          })
        )
      }
    }
  })
}

/** The delete of one imported item, answered with the items left after it, renumbered. */
function playlistItemDeleteMock(index: number): SpyMock {
  const id = PLAYLIST_ITEM_IDS[index]
  return {
    request: { query: CAMPAIGN_BLOCK_DELETE, variables: { id } },
    result: vi.fn(() => {
      calls.push(`delete ${id}`)
      return {
        data: {
          campaignBlockDelete: PLAYLIST_ITEM_IDS.slice(index + 1).map(
            (sibling, parentOrder) => ({
              __typename: 'CampaignVideoBlock',
              id: sibling,
              parentOrder
            })
          )
        }
      }
    })
  }
}

/** Adds a YouTube item, imports a playlist or drops the Watch video on the carousel as the provider holds it, and shows its Watch video and the hook's error inline. */
function CarouselHarness(): ReactElement {
  const { campaign: current } = useCampaignEditor()
  const { addItem, importPlaylist, clearWatchVideo, error } =
    useCampaignCarouselCommand()
  const currentCarousel = current.blocks.find(
    (block) => block.id === carousel.id
  ) as CampaignVideoCarouselBlock
  return (
    <>
      <button type="button" onClick={() => addItem(currentCarousel, YOUTUBE)}>
        Add YouTube item
      </button>
      <button
        type="button"
        onClick={() => importPlaylist(currentCarousel, PLAYLIST_URL)}
      >
        Import playlist
      </button>
      <button type="button" onClick={() => clearWatchVideo(currentCarousel)}>
        Use my own videos
      </button>
      <span data-testid="CarouselVideoId">{currentCarousel.videoId ?? ''}</span>
      <span data-testid="CarouselError">{error ?? ''}</span>
    </>
  )
}

/** The harness with a way to unmount it, as selecting another block does. */
function RemovableHarness(): ReactElement {
  const [mounted, setMounted] = useState(true)
  return (
    <>
      <button type="button" onClick={() => setMounted(false)}>
        Unmount panel
      </button>
      {mounted && <CarouselHarness />}
    </>
  )
}

function renderHarness(
  mocks: MockLink.MockedResponse[],
  campaignData?: Campaign
): ReturnType<typeof render> {
  return render(
    <QueriedEditor mocks={mocks} campaign={campaignData}>
      <UndoRedo />
      <BlocksProbe />
      <CarouselHarness />
    </QueriedEditor>
  )
}

describe('useCampaignCarouselCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    calls.length = 0
  })

  describe('addItem', () => {
    it('adds the item at the end of the carousel; undo removes it and redo restores it', async () => {
      renderHarness([createMock, deleteMock, restoreMock])
      expect(await screen.findByTestId('Block-carouselId')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Add YouTube item' }))

      expect(await screen.findByTestId('Block-newItemId')).toHaveTextContent(
        'CampaignVideoBlock|carouselId|0|'
      )
      await waitFor(() => expect(calls).toEqual(['create newItemId']))

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

      await waitFor(() =>
        expect(screen.queryByTestId('Block-newItemId')).not.toBeInTheDocument()
      )
      await waitFor(() =>
        expect(calls).toEqual(['create newItemId', 'delete newItemId'])
      )

      fireEvent.click(screen.getByRole('button', { name: 'Redo' }))

      expect(await screen.findByTestId('Block-newItemId')).toHaveTextContent(
        'CampaignVideoBlock|carouselId|0|'
      )
      await waitFor(() =>
        expect(calls).toEqual([
          'create newItemId',
          'delete newItemId',
          'restore newItemId'
        ])
      )
      expect(createMock.result).toHaveBeenCalledTimes(1)
      expect(screen.getByTestId('CarouselError')).toHaveTextContent('')
    })

    it('adding to an expanded (Watch) carousel removes its Watch video; undo removes the item and writes the Watch video back', async () => {
      const clearVideoMock = blockUpdateMock(watchCarousel, { videoId: null })
      const restoreVideoMock = blockUpdateMock(watchCarousel, {
        videoId: 'watchVideoId',
        videoVariantLanguageId: '529'
      })
      renderHarness(
        [clearVideoMock, createMock, deleteMock, restoreVideoMock],
        campaignWithWatchCarousel
      )
      expect(await screen.findByTestId('CarouselVideoId')).toHaveTextContent(
        'watchVideoId'
      )

      fireEvent.click(screen.getByRole('button', { name: 'Add YouTube item' }))

      await waitFor(() => expect(calls).toEqual(['create newItemId']))
      expect(screen.getByTestId('Block-newItemId')).toBeInTheDocument()
      expect(screen.getByTestId('CarouselVideoId')).toHaveTextContent(/^$/)
      expect(clearVideoMock.result).toHaveBeenCalledTimes(1)
      expect(restoreVideoMock.result).not.toHaveBeenCalled()

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

      await waitFor(() =>
        expect(screen.getByTestId('CarouselVideoId')).toHaveTextContent(
          'watchVideoId'
        )
      )
      await waitFor(() => expect(restoreVideoMock.result).toHaveBeenCalled())
      expect(calls).toEqual(['create newItemId', 'delete newItemId'])
      expect(screen.queryByTestId('Block-newItemId')).not.toBeInTheDocument()
    })

    it('undo pressed before the item create resolves waits for it, then removes the item once it lands', async () => {
      renderHarness([createMock, deleteMock])
      expect(await screen.findByTestId('Block-carouselId')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Add YouTube item' }))
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

      await waitFor(() =>
        expect(calls).toEqual(['create newItemId', 'delete newItemId'])
      )
      await waitFor(() =>
        expect(screen.queryByTestId('Block-newItemId')).not.toBeInTheDocument()
      )
      expect(screen.getByTestId('CarouselError')).toHaveTextContent('')
    })

    it('undo pressed before the create resolves, then the create is refused: one error shown, no stray delete', async () => {
      renderHarness([refusedCreateMock, deleteMock])
      expect(await screen.findByTestId('Block-carouselId')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Add YouTube item' }))
      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

      await waitFor(() =>
        expect(screen.getByTestId('CarouselError')).toHaveTextContent(
          'The request was refused'
        )
      )
      await waitFor(() =>
        expect(screen.queryByTestId('Block-newItemId')).not.toBeInTheDocument()
      )
      expect(screen.getAllByText('The request was refused')).toHaveLength(1)
      expect(calls).toEqual(['create newItemId'])
      expect(deleteMock.result).not.toHaveBeenCalled()
    })

    it('a refused create on an expanded (Watch) carousel writes its videoId back', async () => {
      const clearVideoMock = blockUpdateMock(watchCarousel, { videoId: null })
      const restoreVideoMock = blockUpdateMock(watchCarousel, {
        videoId: 'watchVideoId',
        videoVariantLanguageId: '529'
      })
      renderHarness(
        [clearVideoMock, refusedCreateMock, restoreVideoMock],
        campaignWithWatchCarousel
      )
      expect(await screen.findByTestId('Block-carouselId')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Add YouTube item' }))

      await waitFor(() =>
        expect(screen.getByTestId('CarouselError')).toHaveTextContent(
          'The request was refused'
        )
      )
      await waitFor(() => expect(restoreVideoMock.result).toHaveBeenCalled())
      expect(clearVideoMock.result).toHaveBeenCalledTimes(1)
      expect(refusedCreateMock.result).toHaveBeenCalledTimes(1)
      expect(screen.getAllByText('The request was refused')).toHaveLength(1)
    })

    it('a refused undo after the panel has unmounted reaches the snackbar', async () => {
      render(
        <QueriedEditor
          mocks={[
            { ...createMock, delay: 0 },
            { ...deleteMock, result: refusal }
          ]}
        >
          <UndoRedo />
          <BlocksProbe />
          <RemovableHarness />
        </QueriedEditor>
      )
      fireEvent.click(
        await screen.findByRole('button', { name: 'Add YouTube item' })
      )
      await waitFor(() => expect(createMock.result).toHaveBeenCalled())
      fireEvent.click(screen.getByRole('button', { name: 'Unmount panel' }))

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

      expect(
        await screen.findByText('The request was refused')
      ).toBeInTheDocument()
    })
  })

  describe('importPlaylist', () => {
    it('adds the playlist’s videos as items; undo removes every one of them', async () => {
      renderHarness([playlistMock, ...[0, 1, 2].map(playlistItemDeleteMock)])
      expect(await screen.findByTestId('Block-carouselId')).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: 'Import playlist' }))

      await waitFor(() =>
        expect(screen.getByTestId('Block-playlistItem2')).toBeInTheDocument()
      )
      PLAYLIST_ITEM_IDS.forEach((id, parentOrder) =>
        expect(screen.getByTestId(`Block-${id}`)).toHaveTextContent(
          `CampaignVideoBlock|carouselId|${parentOrder}|`
        )
      )
      expect(calls).toEqual(['import playlist'])

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

      await waitFor(() =>
        expect(calls).toEqual([
          'import playlist',
          'delete playlistItem0',
          'delete playlistItem1',
          'delete playlistItem2'
        ])
      )
      await waitFor(() =>
        PLAYLIST_ITEM_IDS.forEach((id) =>
          expect(screen.queryByTestId(`Block-${id}`)).not.toBeInTheDocument()
        )
      )
      expect(screen.getByTestId('CarouselError')).toHaveTextContent('')
    })
  })

  describe('clearWatchVideo', () => {
    it('removes the Watch video, leaving explicit mode; undo writes the Watch video back', async () => {
      const clearVideoMock = blockUpdateMock(watchCarousel, { videoId: null })
      const restoreVideoMock = blockUpdateMock(watchCarousel, {
        videoId: 'watchVideoId',
        videoVariantLanguageId: '529'
      })
      renderHarness(
        [clearVideoMock, restoreVideoMock],
        campaignWithWatchCarousel
      )
      expect(await screen.findByTestId('CarouselVideoId')).toHaveTextContent(
        'watchVideoId'
      )

      fireEvent.click(screen.getByRole('button', { name: 'Use my own videos' }))

      await waitFor(() =>
        expect(screen.getByTestId('CarouselVideoId')).toHaveTextContent(/^$/)
      )
      await waitFor(() => expect(clearVideoMock.result).toHaveBeenCalled())
      expect(restoreVideoMock.result).not.toHaveBeenCalled()

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

      await waitFor(() =>
        expect(screen.getByTestId('CarouselVideoId')).toHaveTextContent(
          'watchVideoId'
        )
      )
      await waitFor(() => expect(restoreVideoMock.result).toHaveBeenCalled())
      expect(clearVideoMock.result).toHaveBeenCalledTimes(1)
    })
  })
})

describe('fitCampaignText', () => {
  it('leaves text within the cap unchanged', () => {
    expect(fitCampaignText('Films for the season', 150)).toBe(
      'Films for the season'
    )
    expect(fitCampaignText('Advent', 6)).toBe('Advent')
  })

  it('trims surrounding whitespace before measuring', () => {
    expect(fitCampaignText('  Outreach films \n', 150)).toBe('Outreach films')
    expect(fitCampaignText(' Advent ', 6)).toBe('Advent')
  })

  it('cuts text over the cap on a code-point boundary and ends it with an ellipsis', () => {
    // The emoji is two UTF-16 units straddling the cut: a UTF-16 slice to
    // five units would keep only its high surrogate.
    const fitted = fitCampaignText('abcd🎬efg', 6)

    expect(fitted).toBe('abcd🎬…')
    expect([...fitted]).toHaveLength(6)
    expect(fitted.endsWith('…')).toBe(true)
  })

  it('drops whitespace left at the cut before the ellipsis', () => {
    const fitted = fitCampaignText('Advent readings', 8)

    expect(fitted).toBe('Advent…')
    expect([...fitted].length).toBeLessThanOrEqual(8)
  })
})
