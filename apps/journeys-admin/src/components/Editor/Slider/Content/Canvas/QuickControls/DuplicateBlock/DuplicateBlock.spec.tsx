import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { render, waitFor } from '@testing-library/react'
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
import userEvent from '@testing-library/user-event'

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
            __typename: 'ButtonBlock',
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
    const { getByRole, getByTestId } = render(
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
    const button = getByRole('button')
    expect(button).toContainElement(getByTestId('CopyLeftIcon'))
    userEvent.click(button)
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
    userEvent.click(getByRole('menuitem', { name: 'Duplicate Block' }))
    await waitFor(() => expect(duplicateBlockResultMock).toHaveBeenCalled())
  })

  it('should duplicate a card on button click', async () => {
    const duplicateCardResultMock = jest.fn(() => ({
      ...duplicateCardMock.result
    }))
    const { getByRole, getByTestId } = render(
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
    const button = getByRole('button')
    expect(button).toContainElement(getByTestId('CopyLeftIcon'))
    userEvent.click(button)
    await waitFor(() => expect(duplicateCardResultMock).toHaveBeenCalled())
  })

  it('should duplicate a card on menu click', async () => {
    const duplicateCardResultMock = jest.fn(() => ({
      ...duplicateCardMock.result
    }))
    const { getByRole } = render(
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
    userEvent.click(getByRole('menuitem', { name: 'Duplicate Card' }))
    await waitFor(() => expect(duplicateCardResultMock).toHaveBeenCalled())
  })

  it('should call handleClick after clicking duplicate', async () => {
    const handleClickMock = jest.fn()
    const duplicateCardResultMock = jest.fn(() => ({
      ...duplicateCardMock.result
    }))
    const { getByRole } = render(
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
    userEvent.click(getByRole('menuitem', { name: 'Duplicate Card' }))
    await waitFor(() => expect(duplicateCardResultMock).toHaveBeenCalled())
    await waitFor(() => expect(handleClickMock).toHaveBeenCalled())
  })

  it('should be disabled if nothing is selected', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <DuplicateBlock variant="button" />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button')).toBeDisabled()
  })

  it('should be disabled if manually disabling button', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider>
          <DuplicateBlock variant="button" disabled />
        </MockedProvider>
      </SnackbarProvider>
    )
    expect(getByRole('button')).toBeDisabled()
  })

  it('should duplicate the card that is passed in', async () => {
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
          children: [block]
        }
      ]
    }

    const passedInStepDuplicateMock: MockedResponse<BlockDuplicate> = {
      request: {
        query: BLOCK_DUPLICATE,
        variables: {
          id: passedInStep.id,
          journeyId: 'journeyId',
          parentOrder: null
        }
      },
      result: jest.fn(() => ({
        data: {
          blockDuplicate: [
            {
              __typename: 'StepBlock',
              id: 'duplicatedId'
            }
          ]
        }
      }))
    }

    const selectedStepDuplicateMock = duplicateCardMock
    const selectedStepDuplicateResultMock = jest.fn(() => ({
      ...selectedStepDuplicateMock.result
    }))

    const { getByRole, getByTestId } = render(
      <MockedProvider
        mocks={[
          passedInStepDuplicateMock,
          {
            ...selectedStepDuplicateMock,
            result: selectedStepDuplicateResultMock
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedBlock: step }}>
              <DuplicateBlock variant="button" block={passedInStep} />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    const button = getByRole('button')
    expect(button).toContainElement(getByTestId('CopyLeftIcon'))
    userEvent.click(button)
    await waitFor(() =>
      expect(passedInStepDuplicateMock.result).toHaveBeenCalled()
    )
    await waitFor(() =>
      expect(selectedStepDuplicateResultMock).not.toHaveBeenCalled()
    )
  })
})
