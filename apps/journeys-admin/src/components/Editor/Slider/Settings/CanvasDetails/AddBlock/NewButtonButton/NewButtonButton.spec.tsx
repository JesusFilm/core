import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import type {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../../__generated__/BlockFields'
import type { GetJourney_journey as Journey } from '../../../../../../../../__generated__/GetJourney'
import { deleteBlockMock as deleteBlock } from '../../../../../../../libs/useBlockDeleteMutation/useBlockDeleteMutation.mock'
import { useBlockRestoreMutationMock as blockRestore } from '../../../../../../../libs/useBlockRestoreMutation/useBlockRestoreMutation.mock'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import {
  buttonBlockCreateMock,
  createStepBlock,
  submitButtonBlock,
  submitButtonCreateMock,
  textResponseBlock
} from './utils/mocks'

import { NewButtonButton } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('NewButtonButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('regular button logic', () => {
    const selectedStep: TreeBlock<StepBlock> = {
      __typename: 'StepBlock',
      id: 'stepId',
      parentBlockId: null,
      parentOrder: 0,
      locked: true,
      nextBlockId: null,
      slug: null,
      children: [
        {
          id: 'cardId',
          __typename: 'CardBlock',
          parentBlockId: 'stepId',
          parentOrder: 0,
          coverBlockId: null,
          backgroundColor: null,
          themeMode: null,
          themeName: null,
          fullscreen: false,
          children: []
        } as TreeBlock<CardBlock>
      ]
    }

    const result = jest.fn(() => ({ ...buttonBlockCreateMock.result }))

    it('should check if the mutation gets called', async () => {
      mockUuidv4.mockReturnValueOnce('buttonBlockId')
      mockUuidv4.mockReturnValueOnce('startIconId')
      mockUuidv4.mockReturnValueOnce('endIconId')

      const { getByRole } = render(
        <MockedProvider
          mocks={[
            {
              ...buttonBlockCreateMock,
              result
            }
          ]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedStep }}>
              <NewButtonButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(getByRole('button'))
      await waitFor(() => expect(result).toHaveBeenCalled())
    })

    it('should remove block if undo clicked', async () => {
      mockUuidv4.mockReturnValueOnce('buttonBlockId')
      mockUuidv4.mockReturnValueOnce('startIconId')
      mockUuidv4.mockReturnValueOnce('endIconId')

      const deleteResult = jest
        .fn()
        .mockResolvedValue({ ...deleteBlock.result })
      const deleteBlockMock = {
        ...deleteBlock,
        request: {
          ...deleteBlock.request,
          variables: {
            id: 'buttonBlockId'
          }
        },
        result: deleteResult
      }

      const { getByRole } = render(
        <MockedProvider
          mocks={[
            {
              ...buttonBlockCreateMock,
              result
            },
            deleteBlockMock
          ]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedStep }}>
              <CommandUndoItem variant="button" />
              <NewButtonButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(getByRole('button', { name: 'Button' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
      fireEvent.click(getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(deleteResult).toHaveBeenCalled())
    })

    it('should restore block if redo clicked', async () => {
      mockUuidv4.mockReturnValueOnce('buttonBlockId')
      mockUuidv4.mockReturnValueOnce('startIconId')
      mockUuidv4.mockReturnValueOnce('endIconId')

      const deleteResult = jest
        .fn()
        .mockResolvedValue({ ...deleteBlock.result })
      const deleteBlockMock = {
        ...deleteBlock,
        request: {
          ...deleteBlock.request,
          variables: {
            id: 'buttonBlockId'
          }
        },
        result: deleteResult
      }

      const restoreResult = jest
        .fn()
        .mockResolvedValue({ ...blockRestore.result })
      const blockRestoreMock = {
        ...blockRestore,
        request: {
          ...blockRestore.request,
          variables: { id: 'buttonBlockId' }
        },
        result: restoreResult
      }

      const { getByRole } = render(
        <MockedProvider
          mocks={[
            {
              ...buttonBlockCreateMock,
              result
            },
            deleteBlockMock,
            blockRestoreMock
          ]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedStep }}>
              <CommandUndoItem variant="button" />
              <CommandRedoItem variant="button" />
              <NewButtonButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(getByRole('button', { name: 'Button' }))
      await waitFor(() => expect(result).toHaveBeenCalled())
      fireEvent.click(getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(deleteResult).toHaveBeenCalled())
      fireEvent.click(getByRole('button', { name: 'Redo' }))
      await waitFor(() => expect(restoreResult).toHaveBeenCalled())
    })

    it('should update the cache', async () => {
      mockUuidv4.mockReturnValueOnce('buttonBlockId')
      mockUuidv4.mockReturnValueOnce('startIconId')
      mockUuidv4.mockReturnValueOnce('endIconId')

      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journeyId': {
          blocks: [{ __ref: 'TypographyBlock:typographyBlockId' }],
          id: 'journeyId',
          __typename: 'Journey'
        }
      })

      const { getByRole } = render(
        <MockedProvider
          cache={cache}
          mocks={[
            {
              ...buttonBlockCreateMock,
              result
            }
          ]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedStep }}>
              <NewButtonButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(getByRole('button'))
      await waitFor(() => expect(result).toHaveBeenCalled())
      expect(cache.extract()['Journey:journeyId']?.blocks).toEqual([
        { __ref: 'TypographyBlock:typographyBlockId' },
        { __ref: 'IconBlock:startIconId' },
        { __ref: 'IconBlock:endIconId' },
        { __ref: 'ButtonBlock:buttonBlockId' }
      ])
    })

    it('should disable when loading', async () => {
      const { getByRole } = render(
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider initialState={{ selectedStep }}>
              <NewButtonButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(getByRole('button'))
      expect(getByRole('button')).toBeDisabled()
    })
  })

  describe('submit button logic', () => {
    it('should create button with submitEnabled when card has text input but no submit button', async () => {
      mockUuidv4.mockReturnValueOnce('buttonBlockId')
      mockUuidv4.mockReturnValueOnce('startIconId')
      mockUuidv4.mockReturnValueOnce('endIconId')

      const submitResult = jest.fn(() => ({ ...submitButtonCreateMock.result }))
      const regularResult = jest.fn(() => ({ ...buttonBlockCreateMock.result }))

      const { getByRole } = render(
        <MockedProvider
          mocks={[
            {
              ...submitButtonCreateMock,
              result: submitResult
            },
            {
              ...buttonBlockCreateMock,
              result: regularResult
            }
          ]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{
                selectedStep: createStepBlock([textResponseBlock])
              }}
            >
              <NewButtonButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(getByRole('button'))
      await waitFor(() => {
        expect(submitResult).toHaveBeenCalled()
        expect(regularResult).not.toHaveBeenCalled()
      })
    })

    it('should create regular button when card already has submit button', async () => {
      mockUuidv4.mockReturnValueOnce('buttonBlockId')
      mockUuidv4.mockReturnValueOnce('startIconId')
      mockUuidv4.mockReturnValueOnce('endIconId')

      const submitResult = jest.fn(() => ({ ...submitButtonCreateMock.result }))
      const regularResult = jest.fn(() => ({ ...buttonBlockCreateMock.result }))

      const { getByRole } = render(
        <MockedProvider
          mocks={[
            {
              ...submitButtonCreateMock,
              result: submitResult
            },
            {
              ...buttonBlockCreateMock,
              result: regularResult
            }
          ]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{
                selectedStep: createStepBlock([
                  textResponseBlock,
                  submitButtonBlock
                ])
              }}
            >
              <NewButtonButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(getByRole('button'))
      await waitFor(() => {
        expect(regularResult).toHaveBeenCalled()
        expect(submitResult).not.toHaveBeenCalled()
      })
    })
  })
})
