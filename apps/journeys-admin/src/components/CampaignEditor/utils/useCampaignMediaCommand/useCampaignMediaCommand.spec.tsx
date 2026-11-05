import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import {
  CampaignImageSlot,
  VideoBlockSource
} from '../../../../../__generated__/globalTypes'
import {
  CAMPAIGN_IMAGE_BLOCK_CREATE,
  newOwnedImageBlock
} from '../../../../libs/useCampaignImageBlockCreateMutation'
import {
  CAMPAIGN_HERO_BLOCK_UPDATE_MEDIA,
  CampaignMediaOwner
} from '../../../../libs/useCampaignMediaSlotMutation'
import {
  CAMPAIGN_VIDEO_BLOCK_CREATE,
  CampaignVideoPick,
  newOwnedVideoBlock
} from '../../../../libs/useCampaignVideoBlockCreateMutation'
import { CommandRedoItem } from '../../../Editor/Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../Editor/Toolbar/Items/CommandUndoItem'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { blockOf } from '../../styleTesting'
import { CommandProbe, QueriedEditor } from '../../testing'

import { useCampaignMediaCommand } from './useCampaignMediaCommand'

vi.mock('uuid', () => ({ v4: vi.fn() }))

const hero = blockOf<'CampaignHeroBlock'>('heroId')
const SRC = 'https://imagedelivery.net/accountHash/cfId/public'
const YOUTUBE: CampaignVideoPick = {
  source: VideoBlockSource.youTube,
  videoId: 'jQaeIJOA6J0'
}

function videoCreateMock(
  id: string,
  result: () => Record<string, unknown> = () => ({
    data: {
      campaignVideoBlockCreate: {
        ...newOwnedVideoBlock(id, hero, YOUTUBE),
        title: 'Blessing and Curse',
        image: 'https://i.ytimg.com/vi/jQaeIJOA6J0/high.jpg',
        duration: 363
      }
    }
  })
) {
  return {
    request: {
      query: CAMPAIGN_VIDEO_BLOCK_CREATE,
      variables: {
        input: {
          id,
          campaignId: 'campaignId',
          parentBlockId: 'heroId',
          ...YOUTUBE
        }
      }
    },
    result: vi.fn(result),
    delay: 50
  }
}

function imageCreateMock(id: string) {
  return {
    request: {
      query: CAMPAIGN_IMAGE_BLOCK_CREATE,
      variables: {
        input: {
          id,
          campaignId: 'campaignId',
          parentBlockId: 'heroId',
          slot: CampaignImageSlot.media,
          src: SRC
        }
      }
    },
    result: vi.fn(() => ({
      data: {
        campaignImageBlockCreate: {
          ...newOwnedImageBlock(id, hero, SRC),
          width: 1600,
          height: 900
        }
      }
    }))
  }
}

function heroMediaMock(mediaBlockId: string | null) {
  return {
    request: {
      query: CAMPAIGN_HERO_BLOCK_UPDATE_MEDIA,
      variables: { id: 'heroId', input: { mediaBlockId } }
    },
    result: vi.fn(() => ({
      data: {
        campaignHeroBlockUpdate: {
          __typename: 'CampaignHeroBlock',
          id: 'heroId',
          mediaBlockId
        }
      }
    }))
  }
}

/** Picks into the hero's Media Slot and shows what the slot holds as the cache has it. */
function HeroMedia(): ReactElement {
  const { campaign } = useCampaignEditor()
  const { addMediaPick, error } = useCampaignMediaCommand()
  const owner = campaign.blocks.find(
    (block) => block.id === 'heroId'
  ) as CampaignMediaOwner
  const media = campaign.blocks.find((block) => block.id === owner.mediaBlockId)
  return (
    <>
      <button type="button" onClick={() => addMediaPick(owner, YOUTUBE)}>
        Pick YouTube
      </button>
      <button type="button" onClick={() => addMediaPick(owner, { src: SRC })}>
        Pick image
      </button>
      <span data-testid="MediaBlockId">{owner.mediaBlockId ?? ''}</span>
      <span data-testid="MediaTypename">{media?.__typename ?? ''}</span>
      {error != null && <span role="alert">{error}</span>}
    </>
  )
}

function renderHook(mocks: Array<Record<string, unknown>>): void {
  render(
    <QueriedEditor mocks={mocks}>
      <CommandUndoItem variant="button" />
      <CommandRedoItem variant="button" />
      <CommandProbe />
      <HeroMedia />
    </QueriedEditor>
  )
}

describe('useCampaignMediaCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('makes a pick one Command shown at once; undo removes the slot block and redo restores it without a second create', async () => {
    vi.mocked(uuidv4).mockImplementation(() => 'videoId')
    const create = videoCreateMock('videoId')
    const clear = heroMediaMock(null)
    const restore = heroMediaMock('videoId')
    renderHook([create, clear, restore])

    fireEvent.click(await screen.findByRole('button', { name: 'Pick YouTube' }))

    // The optimistic create fills the slot before the server answers.
    await waitFor(() =>
      expect(screen.getByTestId('MediaTypename')).toHaveTextContent(
        'CampaignVideoBlock'
      )
    )
    expect(screen.getByTestId('MediaBlockId')).toHaveTextContent('videoId')
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    await waitFor(() => expect(create.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(clear.result).toHaveBeenCalled())
    expect(screen.getByTestId('MediaBlockId')).toHaveTextContent('')

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))

    await waitFor(() => expect(restore.result).toHaveBeenCalled())
    expect(screen.getByTestId('MediaBlockId')).toHaveTextContent('videoId')
    expect(create.result).toHaveBeenCalledTimes(1)
  })

  it('restores the previous media on undo of a swap', async () => {
    vi.mocked(uuidv4)
      .mockImplementationOnce(() => 'imageId')
      .mockImplementationOnce(() => 'videoId')
    const imageCreate = imageCreateMock('imageId')
    const videoCreate = videoCreateMock('videoId')
    const restoreImage = heroMediaMock('imageId')
    renderHook([imageCreate, videoCreate, restoreImage])

    fireEvent.click(await screen.findByRole('button', { name: 'Pick image' }))
    await waitFor(() => expect(imageCreate.result).toHaveBeenCalled())
    expect(screen.getByTestId('MediaTypename')).toHaveTextContent(
      'CampaignImageBlock'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Pick YouTube' }))
    await waitFor(() => expect(videoCreate.result).toHaveBeenCalled())
    expect(screen.getByTestId('MediaBlockId')).toHaveTextContent('videoId')
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('2')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(restoreImage.result).toHaveBeenCalled())
    expect(screen.getByTestId('MediaBlockId')).toHaveTextContent('imageId')
    expect(screen.getByTestId('MediaTypename')).toHaveTextContent(
      'CampaignImageBlock'
    )
    expect(imageCreate.result).toHaveBeenCalledTimes(1)
  })

  it('shows a refused pick’s message verbatim and rolls the slot back', async () => {
    vi.mocked(uuidv4).mockImplementation(() => 'videoId')
    const refused = videoCreateMock('videoId', () => ({
      errors: [{ message: 'videoId must be a valid YouTube videoId' }]
    }))
    renderHook([refused])

    fireEvent.click(await screen.findByRole('button', { name: 'Pick YouTube' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'videoId must be a valid YouTube videoId'
    )
    expect(screen.getByTestId('MediaBlockId')).toHaveTextContent('')
  })
})
