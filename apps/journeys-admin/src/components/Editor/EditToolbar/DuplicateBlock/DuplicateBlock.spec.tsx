import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import {
  GetJourney_journey as Journey,
  GetJourney_journey_blocks_StepBlock as StepBlock,
  GetJourney_journey_blocks_TypographyBlock as TypographyBlock
} from '../../../../../__generated__/GetJourney'
import {
  TypographyAlign,
  TypographyColor,
  TypographyVariant
} from '../../../../../__generated__/globalTypes'

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

  it('should duplicate a block on button click', async () => {
    const result = jest.fn(() => ({
      data: {
        blockDuplicate: {
          id: 'duplicatedId',
          parentOrder: 1
        }
      }
    }))
    const { getByRole, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BLOCK_DUPLICATE,
              variables: {
                id: block.id,
                journeyId: 'journeyId',
                parentOrder: blockOrder + 1
              }
            },
            result
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
            <EditorProvider initialState={{ selectedBlock: block }}>
              <DuplicateBlock variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    const button = getByRole('button')
    expect(button).toContainElement(getByTestId('CopyLeftIcon'))
    fireEvent.click(button)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should duplicate a block on menu click', async () => {
    const result = jest.fn(() => ({
      data: {
        blockDuplicate: {
          id: 'duplicatedId',
          parentOrder: 1
        }
      }
    }))
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BLOCK_DUPLICATE,
              variables: {
                id: block.id,
                journeyId: 'journeyId',
                parentOrder: blockOrder + 1
              }
            },
            result
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
            <EditorProvider initialState={{ selectedBlock: block }}>
              <DuplicateBlock variant="list-item" />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('menuitem', { name: 'Duplicate Block' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should duplicate a card on button click', async () => {
    const result = jest.fn(() => ({
      data: {
        blockDuplicate: {
          id: 'duplicatedId',
          parentOrder: 1
        }
      }
    }))
    const { getByRole, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BLOCK_DUPLICATE,
              variables: {
                id: step.id,
                journeyId: 'journeyId',
                parentOrder: null
              }
            },
            result
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
              <DuplicateBlock variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    const button = getByRole('button')
    expect(button).toContainElement(getByTestId('CopyLeftIcon'))
    fireEvent.click(button)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should duplicate a card on menu click', async () => {
    const result = jest.fn(() => ({
      data: {
        blockDuplicate: {
          id: 'duplicatedId',
          parentOrder: 1
        }
      }
    }))
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BLOCK_DUPLICATE,
              variables: {
                id: step.id,
                journeyId: 'journeyId',
                parentOrder: null
              }
            },
            result
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
              <DuplicateBlock variant="list-item" />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('menuitem', { name: 'Duplicate Card' }))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should call handleClick after clicking duplicate', async () => {
    const result = jest.fn(() => ({
      data: {
        blockDuplicate: {
          id: 'duplicatedId',
          parentOrder: 1
        }
      }
    }))
    
    const handleClickMock = jest.fn()
    const { getByRole } = render(
      // <MockedProvider mocks={[]} >
      <MockedProvider
      mocks={[
        {
          request: {
            query: BLOCK_DUPLICATE,
            variables: {
              id: step.id,
              journeyId: 'journeyId',
              parentOrder: null
            }
          },
          result
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
              <DuplicateBlock
                variant="list-item"
                handleClick={handleClickMock}
              />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )
    fireEvent.click(getByRole('menuitem', { name: 'Duplicate Card' }))
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
})
