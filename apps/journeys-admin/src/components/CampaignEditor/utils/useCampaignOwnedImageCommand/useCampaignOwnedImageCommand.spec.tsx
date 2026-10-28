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
import { QueriedEditor } from '../../testing'

import { useCampaignOwnedImageCommand } from './useCampaignOwnedImageCommand'

vi.mock('uuid', () => ({ v4: () => 'newCoverId' }))

interface CoverFields {
  coverBlockId: string | null
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

const write = vi.fn(async () => undefined)

function Probe(): ReactElement {
  const { campaign } = useCampaignEditor()
  const { addOwnedImage, error } = useCampaignOwnedImageCommand()
  const hero = campaign.blocks.find((block) => block.id === 'heroId')
  if (hero == null) throw new Error('fixture')
  return (
    <>
      <span data-testid="Error">{error ?? ''}</span>
      <button
        onClick={() =>
          addOwnedImage<typeof hero, CoverFields>({
            owner: hero,
            slot: CampaignImageSlot.cover,
            src: 'https://imagedelivery.net/cover/public',
            input: (imageId) => ({ coverBlockId: imageId }),
            previous: { coverBlockId: 'oldCoverId' },
            imageIdOf: (fields) => fields.coverBlockId,
            write
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
        campaign.blocks.find((block) => block.id === 'heroId')!,
        createInput.input.src
      )
    }
  }))
}

describe('useCampaignOwnedImageCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('undoes a pick with the owner write alone, never campaignBlockRestore, and redoes it without a second create', async () => {
    render(
      <QueriedEditor mocks={[createdMock, restoreOldCoverMock]}>
        <CommandUndoItem variant="button" />
        <CommandRedoItem variant="button" />
        <Probe />
      </QueriedEditor>
    )
    fireEvent.click(await screen.findByRole('button', { name: 'Pick cover' }))
    await waitFor(() => expect(write).toHaveBeenCalledTimes(1))
    expect(write).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'heroId' }),
      { coverBlockId: 'newCoverId' }
    )

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(write).toHaveBeenCalledTimes(2))
    expect(write).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'heroId' }),
      { coverBlockId: 'oldCoverId' }
    )
    expect(restoreOldCoverMock.result).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))

    await waitFor(() => expect(write).toHaveBeenCalledTimes(3))
    expect(write).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'heroId' }),
      { coverBlockId: 'newCoverId' }
    )
    expect(createdMock.result).toHaveBeenCalledTimes(1)
    expect(restoreOldCoverMock.result).not.toHaveBeenCalled()
  })

  it('restores nothing and writes no cover on undo after a refused create, and retries the create on redo', async () => {
    render(
      <QueriedEditor
        mocks={[createRefusedMock, createdMock, restoreOldCoverMock]}
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
    expect(write).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(write).toHaveBeenCalledTimes(1))
    expect(write).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'heroId' }),
      { coverBlockId: 'oldCoverId' }
    )
    expect(restoreOldCoverMock.result).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))

    await waitFor(() => expect(write).toHaveBeenCalledTimes(2))
    expect(write).toHaveBeenLastCalledWith(
      expect.objectContaining({ id: 'heroId' }),
      { coverBlockId: 'newCoverId' }
    )
  })
})
