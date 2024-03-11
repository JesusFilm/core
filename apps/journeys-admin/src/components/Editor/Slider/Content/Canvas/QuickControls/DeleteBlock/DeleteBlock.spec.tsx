import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockDelete } from '../../../../../../../../__generated__/BlockDelete'
import {
  BlockFields_StepBlock as StepBlock,
  BlockFields_TypographyBlock as TypographyBlock
} from '../../../../../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../../../../../libs/TestEditorState'

import { BLOCK_DELETE, DeleteBlock } from './DeleteBlock'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

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

const deleteBlockMock: MockedResponse<BlockDelete> = {
  request: {
    query: BLOCK_DELETE,
    variables: {
      id: selectedBlock.id,
      parentBlockId: selectedBlock.parentBlockId,
      journeyId: 'journeyId'
    }
  },
  result: jest.fn(() => ({
    data: {
      blockDelete: [
        {
          __typename: 'TypographyBlock',
          id: selectedBlock.id,
          parentOrder: selectedBlock.parentOrder
        }
      ]
    }
  }))
}

const deleteCardMock: MockedResponse<BlockDelete> = {
  request: {
    query: BLOCK_DELETE,
    variables: {
      id: selectedStep.id,
      parentBlockId: selectedStep.parentBlockId,
      journeyId: 'journeyId'
    }
  },
  result: jest.fn(() => ({
    data: {
      blockDelete: [
        {
          __typename: 'StepBlock',
          id: selectedStep.id,
          parentOrder: selectedStep.parentOrder
        }
      ]
    }
  }))
}

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
    const { getByRole, getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider cache={cache} mocks={[deleteBlockMock]}>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedBlock, selectedStep }}>
              <DeleteBlock variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button')).toContainElement(getByTestId('Trash2Icon'))
    fireEvent.click(getByRole('button'))
    await waitFor(() => expect(deleteBlockMock.result).toHaveBeenCalled())
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
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider cache={cache} mocks={[deleteBlockMock]}>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedBlock, selectedStep }}>
              <DeleteBlock variant="list-item" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    await fireEvent.click(getByRole('menuitem', { name: 'Delete Block' }))
    await waitFor(() => expect(deleteBlockMock.result).toHaveBeenCalled())
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

    const { getByRole, getByTestId } = render(
      <SnackbarProvider>
        <MockedProvider cache={cache} mocks={[deleteCardMock]}>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedBlock }}>
              <DeleteBlock variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    expect(getByRole('button')).toContainElement(getByTestId('Trash2Icon'))
    fireEvent.click(getByRole('button'))

    expect(getByRole('dialog', { name: 'Delete Card?' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(deleteCardMock.result).toHaveBeenCalled())
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

    const { getByRole, queryByRole } = render(
      <SnackbarProvider>
        <MockedProvider cache={cache} mocks={[deleteCardMock]}>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedBlock }}>
              <DeleteBlock variant="list-item" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('menuitem', { name: 'Delete Card' }))

    expect(getByRole('dialog', { name: 'Delete Card?' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(deleteCardMock.result).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([])
    await waitFor(() => expect(queryByRole('menu')).not.toBeInTheDocument())
    await waitFor(() => expect(queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('should be disabled if nothing is selected', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <DeleteBlock variant="button" />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button')).toBeDisabled()
  })

  it('should be disabled if manually disabling button', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <DeleteBlock variant="button" disabled />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button')).toBeDisabled()
  })

  // should delete the card that is passed in
  it('should delete the card that is passed in', async () => {
    const passedInStep: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'passedInStepId',
      parentBlockId: 'journeyId',
      parentOrder: 0,
      locked: true,
      nextBlockId: null,
      children: [
        {
          id: 'card1.id',
          __typename: 'CardBlock',
          parentBlockId: 'passedInStepId',
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

    const passedInStepDeleteMock: MockedResponse<BlockDelete> = {
      request: {
        query: BLOCK_DELETE,
        variables: {
          id: passedInStep.id,
          parentBlockId: passedInStep.parentBlockId,
          journeyId: 'journeyId'
        }
      },
      result: jest.fn(() => ({
        data: {
          blockDelete: [
            {
              __typename: 'StepBlock',
              id: passedInStep.id,
              parentOrder: passedInStep.parentOrder
            }
          ]
        }
      }))
    }

    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [
          { __ref: `StepBlock:passedInStepId` },
          { __ref: `CardBlock:card1.id` },
          { __ref: `TypographyBlock:typography0.id` }
        ],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })

    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider cache={cache} mocks={[passedInStepDeleteMock]}>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedBlock: selectedStep }}>
              <DeleteBlock variant="list-item" block={passedInStep} />
              <TestEditorState />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )
    fireEvent.click(getByRole('menuitem', { name: 'Delete Card' }))

    expect(getByRole('dialog', { name: 'Delete Card?' })).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(passedInStepDeleteMock.result).toHaveBeenCalled()
    )
    await waitFor(() => expect(deleteCardMock.result).not.toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([])

    // assert that the selected block hasn't changed
    expect(getByText(`selectedBlock: ${selectedStep.id}`)).toBeInTheDocument()
  })
})
