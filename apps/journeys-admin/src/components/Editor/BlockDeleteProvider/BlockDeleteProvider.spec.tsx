import { InMemoryCache } from '@apollo/client'
import { MockLink } from '@apollo/client/testing'
import { MockedProvider } from '@apollo/client/testing/react'
import MenuList from '@mui/material/MenuList'
import { render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'
import { ReactElement } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { ActiveSlide, EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { BlockEventLabel } from '../../../../__generated__/globalTypes'
import { BLOCK_DELETE } from '../../../libs/useBlockDeleteMutation'
import { BLOCK_RESTORE } from '../../../libs/useBlockRestoreMutation/useBlockRestoreMutation'
import { MuxVideoUploadProvider } from '../../MuxVideoUploadProvider'
import { ThemeProvider } from '../../ThemeProvider'
import { DeleteBlock } from '../Slider/Content/Canvas/QuickControls/DeleteBlock'
import { useDeleteOnKeyPress } from '../Slider/JourneyFlow/libs/useDeleteOnKeyPress'
import { CommandUndoItem } from '../Toolbar/Items/CommandUndoItem'

import { BlockDeleteProvider } from './BlockDeleteProvider'
import {
  otherStep,
  trackedButton,
  trackedCard,
  trackedOption,
  trackedStep,
  trackedVideo,
  untrackedButton,
  untrackedVideo
} from './data'

function KeyboardDelete(): ReactElement {
  useDeleteOnKeyPress()
  return <></>
}

function flatten(block: TreeBlock): TreeBlock[] {
  return [block, ...block.children.flatMap(flatten)]
}

function renderDelete({
  target,
  selected = trackedStep,
  variant = 'button',
  keyboard = false
}: {
  target: TreeBlock
  selected?: typeof trackedStep
  variant?: 'button' | 'list-item'
  keyboard?: boolean
}): {
  cache: InMemoryCache
  deleteResult: ReturnType<typeof vi.fn>
  restoreResult: ReturnType<typeof vi.fn>
} {
  const blocks = flatten(trackedStep)
  if (!blocks.some(({ id }) => id === target.id))
    blocks.push(...flatten(target))
  blocks.push(otherStep)
  const cache = new InMemoryCache({
    possibleTypes: {
      Block: [...new Set(blocks.map(({ __typename }) => __typename))]
    }
  })
  cache.restore({
    'Journey:journey-id': {
      __typename: 'Journey',
      id: 'journey-id',
      blocks: blocks.map(({ __typename, id }) => ({
        __ref: `${__typename}:${id}`
      }))
    },
    ...Object.fromEntries(
      blocks.map((block) => [`${block.__typename}:${block.id}`, block])
    )
  })
  const deleteResult = vi.fn(() => ({ data: { blockDelete: [] } }))
  const restoreResult = vi.fn(() => ({
    data: {
      blockRestore: flatten(target).map((block) => ({
        ...block,
        ...(block.__typename === 'StepBlock' ? { x: null, y: null } : {})
      }))
    }
  }))
  const mocks: MockLink.MockedResponse[] = [
    {
      request: { query: BLOCK_DELETE, variables: { id: target.id } },
      result: deleteResult
    },
    {
      request: { query: BLOCK_RESTORE, variables: { id: target.id } },
      result: restoreResult
    }
  ]

  render(
    <MockedProvider cache={cache} mocks={mocks}>
      <SnackbarProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journey-id' } as Journey,
              renderMode: 'admin'
            }}
          >
            <EditorProvider
              initialState={{
                steps: [trackedStep, otherStep],
                selectedStep: selected,
                selectedBlock: keyboard ? selected : target,
                activeSlide: keyboard
                  ? ActiveSlide.JourneyFlow
                  : ActiveSlide.Content
              }}
            >
              <MuxVideoUploadProvider>
                <BlockDeleteProvider>
                  <MenuList>
                    <DeleteBlock
                      variant={variant}
                      block={variant === 'list-item' ? target : undefined}
                    />
                  </MenuList>
                  <CommandUndoItem variant="button" />
                  {keyboard && <KeyboardDelete />}
                </BlockDeleteProvider>
              </MuxVideoUploadProvider>
            </EditorProvider>
          </JourneyProvider>
        </ThemeProvider>
      </SnackbarProvider>
    </MockedProvider>
  )
  return { cache, deleteResult, restoreResult }
}

async function clickTrash(): Promise<void> {
  await userEvent.click(
    screen.getByRole('button', { name: 'Delete Block Actions' })
  )
}

describe('BlockDeleteProvider', () => {
  it.each([
    ['RSVP button', trackedButton],
    ['completion-only video', trackedVideo]
  ])(
    'keeps a %s and its labels when cancelled or dismissed',
    async (_name, target) => {
      const { cache, deleteResult } = renderDelete({ target })
      const before = cache.extract()
      const undoButton = screen.getByRole('button', { name: 'Undo' })

      for (const dismissal of ['cancel', 'escape', 'backdrop']) {
        await clickTrash()
        expect(screen.getByRole('dialog')).toHaveTextContent(
          'Delete content with tracking?'
        )
        expect(undoButton).toBeDisabled()
        expect(deleteResult).not.toHaveBeenCalled()

        if (dismissal === 'cancel') {
          await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
        } else if (dismissal === 'escape') {
          await userEvent.keyboard('{Escape}')
        } else {
          await userEvent.click(screen.getByRole('dialog').parentElement!)
        }
        await waitFor(() =>
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        )
        expect(deleteResult).not.toHaveBeenCalled()
        expect(undoButton).toBeDisabled()
        expect(cache.extract()).toEqual(before)
      }
    }
  )

  it.each([
    [
      'card',
      { ...trackedCard, eventLabel: BlockEventLabel.custom2, children: [] }
    ],
    ['radio option', trackedOption],
    [
      'video start',
      {
        ...trackedVideo,
        eventLabel: BlockEventLabel.custom3,
        endEventLabel: null
      }
    ]
  ])(
    'warns for saved tracking on a %s without a Tracking control',
    async (_name, target) => {
      const { deleteResult } = renderDelete({ target })
      await clickTrash()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(deleteResult).not.toHaveBeenCalled()
    }
  )

  it('deletes the requested card once while another card is selected and restores tracking on undo', async () => {
    const { cache, deleteResult, restoreResult } = renderDelete({
      target: trackedStep,
      selected: otherStep,
      variant: 'list-item'
    })
    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete Card' }))
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    expect(deleteResult).not.toHaveBeenCalled()
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(deleteResult).toHaveBeenCalledTimes(1))
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
    expect(cache.extract()['Journey:journey-id']?.blocks).toEqual([
      { __ref: 'StepBlock:otherStep.id' }
    ])
    expect(cache.extract()['ButtonBlock:button.id']).toBeUndefined()
    expect(cache.extract()['VideoBlock:video.id']).toBeUndefined()

    await userEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(restoreResult).toHaveBeenCalledTimes(1))
    expect(cache.extract()['Journey:journey-id']?.blocks).toEqual(
      expect.arrayContaining([{ __ref: 'StepBlock:stepId' }])
    )
    expect(cache.extract()['ButtonBlock:button.id']?.eventLabel).toBe(
      BlockEventLabel.rsvp
    )
    expect(cache.extract()['VideoBlock:video.id']?.endEventLabel).toBe(
      BlockEventLabel.specialVideoComplete
    )
    expect(deleteResult).toHaveBeenCalledTimes(1)
  })

  it.each([untrackedButton, untrackedVideo])(
    'deletes an untracked $__typename immediately despite tracked siblings',
    async (target) => {
      const { cache, deleteResult } = renderDelete({ target })
      await clickTrash()
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      await waitFor(() => expect(deleteResult).toHaveBeenCalledTimes(1))
      expect(cache.extract()[`${target.__typename}:${target.id}`]).toBeUndefined()
      expect(cache.extract()['VideoBlock:video.id']?.endEventLabel).toBe(
        BlockEventLabel.specialVideoComplete
      )
    }
  )

  it.each(['Delete', 'Backspace'])(
    'confirms selected-card deletion for %s',
    async (key) => {
      const { deleteResult } = renderDelete({
        target: trackedStep,
        keyboard: true
      })
      await userEvent.keyboard(`{${key}}`)
      expect(screen.getAllByRole('dialog')).toHaveLength(1)
      expect(deleteResult).not.toHaveBeenCalled()
      await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
      await waitFor(() => expect(deleteResult).toHaveBeenCalledTimes(1))
    }
  )
})
