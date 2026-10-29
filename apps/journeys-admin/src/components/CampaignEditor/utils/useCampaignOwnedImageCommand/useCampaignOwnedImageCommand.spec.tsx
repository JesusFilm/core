import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { ReactElement } from 'react'

import { CampaignImageSlot } from '../../../../../__generated__/globalTypes'
import { CAMPAIGN_BLOCK_RESTORE } from '../../../../libs/useCampaignBlockRestoreMutation'
import {
  CAMPAIGN_IMAGE_BLOCK_CREATE,
  newOwnedImageBlock
} from '../../../../libs/useCampaignImageBlockCreateMutation'
import { CommandRedoItem } from '../../../Editor/Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../Editor/Toolbar/Items/CommandUndoItem'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaign } from '../../data'
import { blockOf, blockUpdateMock } from '../../styleTesting'
import { QueriedEditor } from '../../testing'

import { useCampaignOwnedImageCommand } from './useCampaignOwnedImageCommand'

vi.mock('uuid', () => ({ v4: () => 'newCoverId' }))

const hero = {
  ...blockOf<'CampaignHeroBlock'>('heroId'),
  coverBlockId: 'oldCoverId'
}
const campaignWithCover = {
  ...campaign,
  blocks: campaign.blocks.map((block) => (block.id === hero.id ? hero : block))
}

const createInput = {
  input: {
    id: 'newCoverId',
    campaignId: 'campaignId',
    parentBlockId: 'heroId',
    slot: CampaignImageSlot.cover,
    src: 'https://imagedelivery.net/cover/public'
  }
}

const createRefusedMock = {
  request: { query: CAMPAIGN_IMAGE_BLOCK_CREATE, variables: createInput },
  result: vi.fn(() => ({
    errors: [new GraphQLError('Image address is not allowed')]
  }))
}

const restoreOldCoverMock = {
  request: { query: CAMPAIGN_BLOCK_RESTORE, variables: { id: 'oldCoverId' } },
  result: vi.fn(() => ({ data: { campaignBlockRestore: [] } }))
}

const pointAtNewMock = {
  ...blockUpdateMock(hero, { coverBlockId: 'newCoverId' }),
  maxUsageCount: 2
}
const pointAtOldMock = {
  ...blockUpdateMock(hero, { coverBlockId: 'oldCoverId' }),
  maxUsageCount: 2
}

function Probe(): ReactElement {
  const { campaign } = useCampaignEditor()
  const { addOwnedImage, error } = useCampaignOwnedImageCommand()
  const owner = campaign.blocks.find((block) => block.id === 'heroId')
  if (owner?.__typename !== 'CampaignHeroBlock') throw new Error('fixture')
  return (
    <>
      <span data-testid="Error">{error ?? ''}</span>
      <button
        onClick={() =>
          addOwnedImage({
            owner,
            slot: CampaignImageSlot.cover,
            src: 'https://imagedelivery.net/cover/public',
            input: (imageId) => ({ coverBlockId: imageId }),
            imageIdOf: (fields) => fields.coverBlockId
          })
        }
      >
        Pick cover
      </button>
    </>
  )
}

const createdMock = {
  ...createRefusedMock,
  result: vi.fn(() => ({
    data: {
      campaignImageBlockCreate: newOwnedImageBlock(
        'newCoverId',
        hero,
        createInput.input.src
      )
    }
  }))
}

describe('useCampaignOwnedImageCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('undoes a pick with the owner write alone, never campaignBlockRestore, and redoes it without a second create', async () => {
    render(
      <QueriedEditor
        campaignData={campaignWithCover}
        mocks={[
          createdMock,
          restoreOldCoverMock,
          pointAtNewMock,
          pointAtOldMock
        ]}
      >
        <CommandUndoItem variant="button" />
        <CommandRedoItem variant="button" />
        <Probe />
      </QueriedEditor>
    )
    fireEvent.click(await screen.findByRole('button', { name: 'Pick cover' }))
    await waitFor(() => expect(pointAtNewMock.result).toHaveBeenCalledTimes(1))

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(pointAtOldMock.result).toHaveBeenCalledTimes(1))
    expect(restoreOldCoverMock.result).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))

    await waitFor(() => expect(pointAtNewMock.result).toHaveBeenCalledTimes(2))
    expect(createdMock.result).toHaveBeenCalledTimes(1)
    expect(restoreOldCoverMock.result).not.toHaveBeenCalled()
  })

  it('restores nothing and writes no cover on undo after a refused create, and retries the create on redo', async () => {
    render(
      <QueriedEditor
        campaignData={campaignWithCover}
        mocks={[
          createRefusedMock,
          createdMock,
          restoreOldCoverMock,
          pointAtNewMock,
          pointAtOldMock
        ]}
      >
        <CommandUndoItem variant="button" />
        <CommandRedoItem variant="button" />
        <Probe />
      </QueriedEditor>
    )
    fireEvent.click(await screen.findByRole('button', { name: 'Pick cover' }))
    await waitFor(() =>
      expect(screen.getByTestId('Error')).toHaveTextContent(
        'Image address is not allowed'
      )
    )
    expect(pointAtNewMock.result).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(pointAtOldMock.result).toHaveBeenCalledTimes(1))
    expect(restoreOldCoverMock.result).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))

    await waitFor(() => expect(pointAtNewMock.result).toHaveBeenCalledTimes(1))
    expect(createdMock.result).toHaveBeenCalledTimes(1)
  })
})
