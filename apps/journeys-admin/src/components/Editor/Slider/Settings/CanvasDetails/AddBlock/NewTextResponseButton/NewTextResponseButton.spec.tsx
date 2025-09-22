import { InMemoryCache } from '@apollo/client'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { TextResponseType } from '../../../../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../../../../__generated__/JourneyFields'
import { TextResponseBlockCreate } from '../../../../../../../../__generated__/TextResponseBlockCreate'
import { deleteBlockMock as deleteBlock } from '../../../../../../../libs/useBlockDeleteMutation/useBlockDeleteMutation.mock'
import { useBlockRestoreMutationMock as blockRestore } from '../../../../../../../libs/useBlockRestoreMutation/useBlockRestoreMutation.mock'
import { textResponseWithButtonCreateMock } from '../../../../../../../libs/useTextResponseWithButtonCreate/useTextResponseWithButtonCreate.mock'
import { textResponseWithButtonDeleteMock } from '../../../../../../../libs/useTextResponseWithButtonDelete/useTextResponseWithButtonDelete.mock'
import { textResponseWithButtonRestoreMock } from '../../../../../../../libs/useTextResponseWithButtonRestore/useTextResponseWithButtonRestore.mock'
import { CommandRedoItem } from '../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../Toolbar/Items/CommandUndoItem'

import { stepWithSubmitButton, stepWithoutSubmitButton } from './data'
import { TEXT_RESPONSE_BLOCK_CREATE } from './NewTextResponseButton'

import { NewTextResponseButton } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

export const textResponseBlockCreateMock: MockedResponse<TextResponseBlockCreate> =
  {
    request: {
      query: TEXT_RESPONSE_BLOCK_CREATE,
      variables: {
        input: {
          id: 'textResponseBlock.id',
          journeyId: 'journey.id',
          parentBlockId: 'card.id',
          label: 'Label'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockCreate: {
          __typename: 'TextResponseBlock',
          id: 'textResponseBlock.id',
          parentBlockId: 'card.id',
          parentOrder: 0,
          label: 'Label',
          hint: null,
          minRows: null,
          type: null,
          routeId: null,
          integrationId: null,
          placeholder: null,
          required: null,
          hideLabel: true
        }
      }
    }))
  }

describe('NewTextResponseButton', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('TextResponseBlock', () => {
    it('should create a new TextResponseBlock', async () => {
      mockUuidv4.mockReturnValueOnce('textResponseBlock.id')

      const { getByRole } = render(
        <MockedProvider mocks={[textResponseBlockCreateMock]}>
          <JourneyProvider
            value={{
              journey: { id: 'journey.id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{ selectedStep: stepWithSubmitButton }}
            >
              <NewTextResponseButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      fireEvent.click(getByRole('button', { name: 'Response Field' }))
      await waitFor(() =>
        expect(textResponseBlockCreateMock.result).toHaveBeenCalled()
      )
    })

    it('should undo when undo clicked', async () => {
      mockUuidv4.mockReturnValueOnce('textResponseBlock.id')
      const deleteResult = jest.fn().mockResolvedValue({
        ...deleteBlock.result,
        type: TextResponseType.freeForm
      })
      const deleteBlockMock = {
        ...deleteBlock,
        request: {
          ...deleteBlock.request,
          variables: {
            id: 'textResponseBlock.id'
          }
        },
        result: deleteResult
      }

      const { getByRole } = render(
        <MockedProvider mocks={[textResponseBlockCreateMock, deleteBlockMock]}>
          <JourneyProvider
            value={{
              journey: { id: 'journey.id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{ selectedStep: stepWithSubmitButton }}
            >
              <CommandUndoItem variant="button" />
              <NewTextResponseButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      fireEvent.click(getByRole('button', { name: 'Response Field' }))
      await waitFor(() =>
        expect(textResponseBlockCreateMock.result).toHaveBeenCalled()
      )
      fireEvent.click(getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(deleteResult).toHaveBeenCalled())
    })

    it('should redo when redo clicked', async () => {
      mockUuidv4.mockReturnValueOnce('textResponseBlock.id')
      const deleteResult = jest
        .fn()
        .mockResolvedValue({ ...deleteBlock.result })
      const deleteBlockMock = {
        ...deleteBlock,
        request: {
          ...deleteBlock.request,
          variables: {
            id: 'textResponseBlock.id'
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
          variables: { id: 'textResponseBlock.id' }
        },
        result: restoreResult
      }

      const { getByRole } = render(
        <MockedProvider
          mocks={[
            textResponseBlockCreateMock,
            deleteBlockMock,
            blockRestoreMock
          ]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journey.id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{ selectedStep: stepWithSubmitButton }}
            >
              <CommandRedoItem variant="button" />
              <CommandUndoItem variant="button" />
              <NewTextResponseButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      fireEvent.click(getByRole('button', { name: 'Response Field' }))
      await waitFor(() =>
        expect(textResponseBlockCreateMock.result).toHaveBeenCalled()
      )
      fireEvent.click(getByRole('button', { name: 'Undo' }))
      await waitFor(() => expect(deleteResult).toHaveBeenCalled())
      fireEvent.click(getByRole('button', { name: 'Redo' }))
      await waitFor(() => expect(restoreResult).toHaveBeenCalled())
    })

    it('should update cache', async () => {
      mockUuidv4.mockReturnValueOnce('textResponseBlock.id')

      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journey.id': {
          blocks: [],
          id: 'journey.id',
          __typename: 'Journey'
        }
      })

      const { getByRole } = render(
        <MockedProvider cache={cache} mocks={[textResponseBlockCreateMock]}>
          <JourneyProvider
            value={{
              journey: { id: 'journey.id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{ selectedStep: stepWithSubmitButton }}
            >
              <NewTextResponseButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      fireEvent.click(getByRole('button', { name: 'Response Field' }))
      await waitFor(() =>
        expect(textResponseBlockCreateMock.result).toHaveBeenCalled()
      )
      await waitFor(() =>
        expect(cache.extract()['Journey:journey.id']?.blocks).toEqual([
          { __ref: 'TextResponseBlock:textResponseBlock.id' }
        ])
      )
    })
  })

  describe('TextResponseWithButton', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should create text response with button and update cache', async () => {
      mockUuidv4
        .mockReturnValueOnce('textResponse.id')
        .mockReturnValueOnce('button.id')
        .mockReturnValueOnce('startIcon.id')
        .mockReturnValueOnce('endIcon.id')

      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journey.id': {
          blocks: [
            { __ref: 'StepBlock:step.id' },
            { __ref: 'CardBlock:card.id' }
          ],
          id: 'journey.id',
          __typename: 'Journey'
        }
      })

      const { getByRole } = render(
        <MockedProvider
          cache={cache}
          mocks={[textResponseWithButtonCreateMock]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journey.id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{ selectedStep: stepWithoutSubmitButton }}
            >
              <NewTextResponseButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      fireEvent.click(getByRole('button', { name: 'Response Field' }))

      await waitFor(() => {
        expect(cache.extract()['Journey:journey.id']?.blocks).toEqual([
          { __ref: 'StepBlock:step.id' },
          { __ref: 'CardBlock:card.id' },
          { __ref: 'TextResponseBlock:textResponse.id' },
          { __ref: 'ButtonBlock:button.id' },
          { __ref: 'IconBlock:startIcon.id' },
          { __ref: 'IconBlock:endIcon.id' }
        ])
      })
    })

    it('should undo text response with button creation', async () => {
      mockUuidv4
        .mockReturnValueOnce('textResponse.id')
        .mockReturnValueOnce('button.id')
        .mockReturnValueOnce('startIcon.id')
        .mockReturnValueOnce('endIcon.id')

      const { getByRole } = render(
        <MockedProvider
          mocks={[
            textResponseWithButtonCreateMock,
            textResponseWithButtonDeleteMock
          ]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journey.id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{ selectedStep: stepWithoutSubmitButton }}
            >
              <CommandUndoItem variant="button" />
              <NewTextResponseButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      fireEvent.click(getByRole('button', { name: 'Response Field' }))
      await waitFor(() =>
        expect(textResponseWithButtonCreateMock.result).toHaveBeenCalled()
      )

      fireEvent.click(getByRole('button', { name: 'Undo' }))
      await waitFor(() =>
        expect(textResponseWithButtonDeleteMock.result).toHaveBeenCalled()
      )
    })

    it('should redo text response with button creation', async () => {
      mockUuidv4
        .mockReturnValueOnce('textResponse.id')
        .mockReturnValueOnce('button.id')
        .mockReturnValueOnce('startIcon.id')
        .mockReturnValueOnce('endIcon.id')

      const { getByRole } = render(
        <MockedProvider
          mocks={[
            textResponseWithButtonCreateMock,
            textResponseWithButtonDeleteMock,
            textResponseWithButtonRestoreMock
          ]}
        >
          <JourneyProvider
            value={{
              journey: { id: 'journey.id' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{ selectedStep: stepWithoutSubmitButton }}
            >
              <CommandRedoItem variant="button" />
              <CommandUndoItem variant="button" />
              <NewTextResponseButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      fireEvent.click(getByRole('button', { name: 'Response Field' }))
      await waitFor(() =>
        expect(textResponseWithButtonCreateMock.result).toHaveBeenCalled()
      )

      fireEvent.click(getByRole('button', { name: 'Undo' }))
      await waitFor(() =>
        expect(textResponseWithButtonDeleteMock.result).toHaveBeenCalled()
      )

      fireEvent.click(getByRole('button', { name: 'Redo' }))
      await waitFor(() =>
        expect(textResponseWithButtonRestoreMock.result).toHaveBeenCalled()
      )
    })
  })

  describe('loading state', () => {
    it('textResponseBlock: should disable when loading', async () => {
      const { getByRole } = render(
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{ selectedStep: stepWithSubmitButton }}
            >
              <NewTextResponseButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(getByRole('button', { name: 'Response Field' }))
      expect(getByRole('button', { name: 'Response Field' })).toBeDisabled()
    })

    it('textResponseWithButton: should disable when loading', async () => {
      const { getByRole } = render(
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              variant: 'admin'
            }}
          >
            <EditorProvider
              initialState={{ selectedStep: stepWithoutSubmitButton }}
            >
              <NewTextResponseButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
      fireEvent.click(getByRole('button', { name: 'Response Field' }))
      expect(getByRole('button', { name: 'Response Field' })).toBeDisabled()
    })
  })
})
