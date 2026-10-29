import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement, useState } from 'react'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks_CampaignVideoCarouselBlock as CampaignVideoCarouselBlock
} from '../../../../../__generated__/GetCampaign'
import { VideoBlockSource } from '../../../../../__generated__/globalTypes'
import { CAMPAIGN_BLOCK_DELETE } from '../../../../libs/useCampaignBlockDeleteMutation'
import {
  CAMPAIGN_VIDEO_BLOCK_CREATE,
  CampaignVideoPick,
  newOwnedVideoBlock
} from '../../../../libs/useCampaignVideoBlockCreateMutation'
import { CommandRedoItem } from '../../../Editor/Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../Editor/Toolbar/Items/CommandUndoItem'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaign } from '../../data'
import { blockOf, blockUpdateMock } from '../../styleTesting'
import { BlocksProbe, QueriedEditor } from '../../testing'

import { useCampaignCarouselCommand } from './useCampaignCarouselCommand'

vi.mock('uuid', () => ({ v4: () => 'newItemId' }))

const carousel = blockOf<'CampaignVideoCarouselBlock'>('carouselId')
const YOUTUBE: CampaignVideoPick = {
  source: VideoBlockSource.youTube,
  videoId: 'jQaeIJOA6J0'
}
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

/** Adds a YouTube item to the carousel as the provider holds it, and shows the hook's error inline. */
function CarouselHarness(): ReactElement {
  const { campaign: current } = useCampaignEditor()
  const { addItem, error } = useCampaignCarouselCommand()
  const currentCarousel = current.blocks.find(
    (block) => block.id === carousel.id
  ) as CampaignVideoCarouselBlock
  return (
    <>
      <button type="button" onClick={() => addItem(currentCarousel, YOUTUBE)}>
        Add YouTube item
      </button>
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
  mocks: Array<Record<string, unknown>>,
  campaignData?: Campaign
): ReturnType<typeof render> {
  return render(
    <QueriedEditor mocks={mocks} campaignData={campaignData}>
      <CommandUndoItem variant="button" />
      <CommandRedoItem variant="button" />
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
          <CommandUndoItem variant="button" />
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
})
