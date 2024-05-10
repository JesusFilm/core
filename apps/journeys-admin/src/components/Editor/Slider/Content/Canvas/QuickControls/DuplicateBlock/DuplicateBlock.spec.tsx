import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockDuplicate } from '../../../../../../../../__generated__/BlockDuplicate'
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

import { BLOCK_DUPLICATE, DuplicateBlock } from './DuplicateBlock'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('DuplicateBlock', () => {
  const block: TreeBlock<TypographyBlock> = {
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

  const step: TreeBlock<StepBlock> = {
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
        children: [block]
      }
    ]
  }

  const blockOrder = block?.parentOrder != null ? block.parentOrder : 0

  const duplicateBlockMock: MockedResponse<BlockDuplicate> = {
    request: {
      query: BLOCK_DUPLICATE,
      variables: {
        id: block.id,
        journeyId: 'journeyId',
        parentOrder: blockOrder + 1
      }
    },
    result: {
      data: {
        blockDuplicate: [
          {
            __typename: 'TypographyBlock',
            id: 'duplicatedId'
          }
        ]
      }
    }
  }

  const duplicateCardMock: MockedResponse<BlockDuplicate> = {
    request: {
      query: BLOCK_DUPLICATE,
      variables: {
        id: step.id,
        journeyId: 'journeyId',
        parentOrder: null
      }
    },
    result: {
      data: {
        blockDuplicate: [
          {
            __typename: 'StepBlock',
            id: 'duplicatedId'
          }
        ]
      }
    }
  }

  it('should duplicate a block on button click', async () => {
    const duplicateBlockResultMock = jest.fn(() => ({
      ...duplicateBlockMock.result
    }))
    render(
      <MockedProvider
        mocks={[{ ...duplicateBlockMock, result: duplicateBlockResultMock }]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedBlock: block }}>
              <DuplicateBlock variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    const button = screen.getByRole('button')
    expect(button).toContainElement(screen.getByTestId('CopyLeftIcon'))
    await userEvent.click(button)
    await waitFor(() => expect(duplicateBlockResultMock).toHaveBeenCalled())
  })

  it('should duplicate a block on menu click', async () => {
    const duplicateBlockResultMock = jest.fn(() => ({
      ...duplicateBlockMock.result
    }))
    const { getByRole } = render(
      <MockedProvider
        mocks={[{ ...duplicateBlockMock, result: duplicateBlockResultMock }]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedBlock: block }}>
              <DuplicateBlock variant="list-item" />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await userEvent.click(getByRole('menuitem', { name: 'Duplicate Block' }))
    await waitFor(() => expect(duplicateBlockResultMock).toHaveBeenCalled())
  })

  it('should duplicate a card on button click', async () => {
    const duplicateCardResultMock = jest.fn(() => ({
      ...duplicateCardMock.result
    }))
    render(
      <MockedProvider
        mocks={[{ ...duplicateCardMock, result: duplicateCardResultMock }]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedBlock: step }}>
              <DuplicateBlock variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    const button = screen.getByRole('button')
    expect(button).toContainElement(screen.getByTestId('CopyLeftIcon'))
    await userEvent.click(button)
    await waitFor(() => expect(duplicateCardResultMock).toHaveBeenCalled())
  })

  it('should duplicate a card on menu click', async () => {
    const duplicateCardResultMock = jest.fn(() => ({
      ...duplicateCardMock.result
    }))
    render(
      <MockedProvider
        mocks={[{ ...duplicateCardMock, result: duplicateCardResultMock }]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedBlock: step }}>
              <DuplicateBlock variant="list-item" />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Duplicate Card' })
    )
    await waitFor(() => expect(duplicateCardResultMock).toHaveBeenCalled())
  })

  it('should call handleClick after clicking duplicate', async () => {
    const handleClickMock = jest.fn()
    const duplicateCardResultMock = jest.fn(() => ({
      ...duplicateCardMock.result
    }))
    render(
      <MockedProvider
        mocks={[{ ...duplicateCardMock, result: duplicateCardResultMock }]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedBlock: step }}>
              <DuplicateBlock
                variant="list-item"
                handleClick={handleClickMock}
              />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Duplicate Card' })
    )
    await waitFor(() => expect(duplicateCardResultMock).toHaveBeenCalled())
    await waitFor(() => expect(handleClickMock).toHaveBeenCalled())
  })

  it('should be disabled if nothing is selected', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <DuplicateBlock variant="button" />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should be disabled if manually disabling button', () => {
    render(
      <SnackbarProvider>
        <MockedProvider>
          <DuplicateBlock variant="button" disabled />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should update cache on block duplication', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: `TypographyBlock:${block.id}` }],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })

    const duplicateBlockResultMock = jest.fn(() => ({
      data: {
        blockDuplicate: [
          { __typename: 'TypographyBlock', id: block.id },
          {
            __typename: 'TypographyBlock',
            id: 'duplicatedId'
          }
        ]
      }
    }))
    render(
      <MockedProvider
        cache={cache}
        mocks={[{ ...duplicateBlockMock, result: duplicateBlockResultMock }]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedBlock: block }}>
              <DuplicateBlock variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    const button = screen.getByRole('button')
    expect(button).toContainElement(screen.getByTestId('CopyLeftIcon'))
    await userEvent.click(button)
    await waitFor(() => expect(duplicateBlockResultMock).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: `TypographyBlock:${block.id}` },
      { __ref: 'TypographyBlock:duplicatedId' }
    ])
  })

  it('should update cache on card duplication', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [
          { __ref: `StepBlock:${step.id}` },
          { __ref: `CardBlock:${step.children[0].id}` },
          { __ref: `TypographyBlock:${block.id}` }
        ],
        id: 'journeyId',
        __typename: 'Journey'
      }
    })

    const duplicateCardResultMock = jest.fn(() => ({
      data: {
        blockDuplicate: [
          { __typename: 'StepBlock', id: step.id },
          {
            __typename: 'StepBlock',
            id: 'duplicatedId'
          },
          { __typename: 'CardBlock', id: step.children[0].id },
          { __typename: 'TypographyBlock', id: block.id }
        ]
      }
    }))
    render(
      <MockedProvider
        cache={cache}
        mocks={[{ ...duplicateCardMock, result: duplicateCardResultMock }]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedBlock: step }}>
              <DuplicateBlock variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    const button = screen.getByRole('button')
    expect(button).toContainElement(screen.getByTestId('CopyLeftIcon'))
    await userEvent.click(button)
    await waitFor(() => expect(duplicateCardResultMock).toHaveBeenCalled())
    expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
      { __ref: 'StepBlock:stepId' },
      { __ref: `CardBlock:card1.id` },
      { __ref: `TypographyBlock:typography0.id` },
      { __ref: 'StepBlock:duplicatedId' }
    ])
  })
})
