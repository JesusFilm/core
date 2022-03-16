import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { InMemoryCache } from '@apollo/client'
import { SnackbarProvider } from 'notistack'
import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_TypographyBlock as TypographyBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../__generated__/GetJourney'
import {
  TypographyVariant,
  TypographyAlign,
  TypographyColor
} from '../../../../../__generated__/globalTypes'
import { JourneyProvider } from '../../../../libs/context'
import { DeleteBlock, BLOCK_DELETE, setDispatchObject } from './DeleteBlock'

const selectedBlock: TreeBlock<TypographyBlock> = {
  id: 'typography0.id',
  __typename: 'TypographyBlock',
  parentBlockId: 'card1.id',
  parentOrder: 0,
  content: 'Title',
  variant: TypographyVariant.h1,
  color: TypographyColor.primary,
  align: TypographyAlign.center,
  children: []
}
const block1: TreeBlock<TypographyBlock> = {
  ...selectedBlock,
  id: 'typography1.id',
  parentOrder: 1
}
const block2: TreeBlock<TypographyBlock> = {
  ...selectedBlock,
  id: 'typography2.id',
  parentOrder: 2
}

const selectedStep: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'stepId',
  parentBlockId: 'journeyId',
  parentOrder: 0,
  locked: true,
  nextBlockId: null,
  children: [
    {
      id: 'card1.id',
      __typename: 'CardBlock',
      parentBlockId: 'stepId',
      parentOrder: 0,
      coverBlockId: null,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      children: [selectedBlock, block1, block2]
    }
  ]
}

const step1: TreeBlock<StepBlock> = {
  __typename: 'StepBlock',
  id: 'step1.id',
  parentBlockId: 'journeyId',
  parentOrder: 1,
  locked: true,
  nextBlockId: 'step2.id',
  children: []
}

const step2: TreeBlock<StepBlock> = {
  ...step1,
  id: 'step2.id',
  parentOrder: 2,
  nextBlockId: 'stepId'
}
const steps: Array<TreeBlock<StepBlock>> = [selectedStep, step1, step2]

describe('DeleteBlock', () => {
  it('should delete a block on button click', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [
          { __ref: `CardBlock:card1.id` },
          { __ref: `TypographyBlock:typography0.id` }
        ],
        id: 'journeyId',
        __typename: 'Journey'
      },
      'CardBlock:card1.id': {
        ...selectedStep.children[0]
      },
      'TypographyBlock:typography0.id': {
        ...selectedBlock
      }
    })
    const result = jest.fn(() => ({
      data: {
        blockDelete: [
          {
            id: selectedBlock.id,
            parentBlockId: selectedBlock.parentBlockId,
            parentOrder: selectedBlock.parentOrder,
            journeyId: 'journeyId'
          }
        ]
      }
    }))
    const { getByRole, getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: BLOCK_DELETE,
                variables: {
                  id: selectedBlock.id,
                  parentBlockId: selectedBlock.parentBlockId,
                  journeyId: 'journeyId'
                }
              },
              result
            }
          ]}
        >
          <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
            <EditorProvider initialState={{ selectedBlock, selectedStep }}>
              <DeleteBlock variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button')).toContainElement(
      getByTestId('DeleteOutlineRoundedIcon')
    )
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'CardBlock:card1.id' }
    ])
  })

  it('should delete a block on menu item click', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [
          { __ref: `CardBlock:card1.id` },
          { __ref: `TypographyBlock:typography0.id` }
        ],
        id: 'journeyId',
        __typename: 'Journey'
      },
      'CardBlock:card1.id': {
        ...selectedStep.children[0]
      },
      'TypographyBlock:typography0.id': {
        ...selectedBlock
      }
    })
    const result = jest.fn(() => ({
      data: {
        blockDelete: [
          {
            id: selectedBlock.id,
            parentBlockId: selectedBlock.parentBlockId,
            parentOrder: selectedBlock.parentOrder,
            journeyId: 'journeyId'
          }
        ]
      }
    }))
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: BLOCK_DELETE,
                variables: {
                  id: selectedBlock.id,
                  parentBlockId: selectedBlock.parentBlockId,
                  journeyId: 'journeyId'
                }
              },
              result
            }
          ]}
        >
          <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
            <EditorProvider initialState={{ selectedBlock, selectedStep }}>
              <DeleteBlock variant="list-item" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('menuitem', { name: 'Delete Block' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'CardBlock:card1.id' }
    ])
  })

  it('should delete card on button click', async () => {
    const selectedBlock = selectedStep

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [
          { __ref: `StepBlock:stepId` },
          { __ref: `CardBlock:card1.id` },
          { __ref: `TypographyBlock:typography0.id` }
        ],
        id: 'journeyId',
        __typename: 'Journey'
      },
      'StepBlock:stepId': {
        ...selectedStep
      },
      'CardBlock:card1.id': {
        ...selectedStep.children[0]
      },
      'TypographyBlock:typography0.id': {
        ...selectedBlock
      }
    })

    const result = jest.fn(() => ({
      data: {
        blockDelete: []
      }
    }))

    const { getByRole, getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: BLOCK_DELETE,
                variables: {
                  id: selectedBlock.id,
                  parentBlockId: selectedBlock.parentBlockId,
                  journeyId: 'journeyId'
                }
              },
              result
            }
          ]}
        >
          <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
            <EditorProvider initialState={{ selectedBlock }}>
              <DeleteBlock variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(getByRole('button')).toContainElement(
      getByTestId('DeleteOutlineRoundedIcon')
    )
    fireEvent.click(getByRole('button'))
    fireEvent.click(getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([])
  })

  it('should delete card on menu click', async () => {
    const selectedBlock = selectedStep

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [
          { __ref: `StepBlock:stepId` },
          { __ref: `CardBlock:card1.id` },
          { __ref: `TypographyBlock:typography0.id` }
        ],
        id: 'journeyId',
        __typename: 'Journey'
      },
      'StepBlock:stepId': {
        ...selectedStep
      },
      'CardBlock:card1.id': {
        ...selectedStep.children[0]
      },
      'TypographyBlock:typography0.id': {
        ...selectedBlock
      }
    })

    const result = jest.fn(() => ({
      data: {
        blockDelete: []
      }
    }))

    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider
          cache={cache}
          mocks={[
            {
              request: {
                query: BLOCK_DELETE,
                variables: {
                  id: selectedBlock.id,
                  parentBlockId: selectedBlock.parentBlockId,
                  journeyId: 'journeyId'
                }
              },
              result
            }
          ]}
        >
          <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
            <EditorProvider initialState={{ selectedBlock }}>
              <DeleteBlock variant="list-item" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('menuitem', { name: 'Delete Card' }))
    fireEvent.click(getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([])
  })

  it('should be disabled if nothing is selected', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <DeleteBlock variant={'button'} />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button')).toBeDisabled()
  })

  describe('updatedSelected', () => {
    it('should select the next child block', () => {
      const input = {
        parentOrder: 1,
        siblings: selectedStep.children[0].children,
        type: 'TypographyBlock',
        steps
      }
      expect(setDispatchObject(input)).toEqual({
        type: 'SetSelectedBlockByIdAction',
        id: 'typography1.id'
      })
    })
    it('should select the new last block when last block deleted', () => {
      const input = {
        parentOrder: 2,
        siblings: selectedStep.children[0].children,
        type: 'TypographyBlock',
        steps
      }
      expect(setDispatchObject(input)).toEqual({
        type: 'SetSelectedBlockByIdAction',
        id: 'typography2.id'
      })
    })
    it('should select the parent block when all children blocks deleted', () => {
      const input = {
        parentOrder: 0,
        siblings: [],
        type: 'TypographyBlock',
        steps,
        toDeleteStep: selectedStep
      }
      expect(setDispatchObject(input)).toEqual({
        type: 'SetSelectedStepAction',
        step: selectedStep
      })
    })
    it('should select the previous linked step when entire step deleted', () => {
      const input = {
        parentOrder: 2,
        siblings: [],
        type: 'StepBlock',
        steps,
        toDeleteStep: step2
      }
      expect(setDispatchObject(input)).toEqual({
        type: 'SetSelectedStepAction',
        step: step1
      })
    })
    it('should select the last step when an unlinked step is deleted', () => {
      const input = {
        parentOrder: 1,
        siblings: [],
        type: 'StepBlock',
        steps,
        toDeleteStep: step1
      }
      expect(setDispatchObject(input)).toEqual({
        type: 'SetSelectedStepAction',
        step: step2
      })
    })

    it('should return null when last card is deleted', () => {
      const input = {
        parentOrder: 0,
        siblings: [],
        type: 'StepBlock',
        steps: [selectedStep],
        toDeleteStep: selectedStep
      }
      expect(setDispatchObject(input)).toEqual(null)
    })
  })
})
