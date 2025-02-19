import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import { TextResponseType } from '../../../../../../../../../../../__generated__/globalTypes'
import { JourneyFields as Journey } from '../../../../../../../../../../../__generated__/JourneyFields'
import { TextResponseTypeUpdate } from '../../../../../../../../../../../__generated__/TextResponseTypeUpdate'
import { journeyUpdatedAtCacheUpdate } from '../../../../../../../../../../libs/journeyUpdatedAtCacheUpdate'
import { CommandRedoItem } from '../../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../../Toolbar/Items/CommandUndoItem'

import { TEXT_RESPONSE_TYPE_UPDATE, Type } from './Type'

jest.mock(
  '../../../../../../../../../../libs/journeyUpdatedAtCacheUpdate',
  () => {
    return {
      journeyUpdatedAtCacheUpdate: jest.fn()
    }
  }
)

describe('Type', () => {
  const selectedBlock: TreeBlock<TextResponseBlock> = {
    __typename: 'TextResponseBlock',
    id: 'textResponse0.id',
    parentBlockId: '0',
    parentOrder: 0,
    label: 'Your answer here',
    hint: null,
    minRows: null,
    integrationId: null,
    routeId: null,
    type: TextResponseType.freeForm,
    children: []
  }

  const mockEmailUpdate: MockedResponse<TextResponseTypeUpdate> = {
    request: {
      query: TEXT_RESPONSE_TYPE_UPDATE,
      variables: {
        id: selectedBlock.id,
        input: {
          label: 'Email',
          type: TextResponseType.email
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          __typename: 'TextResponseBlock',
          id: selectedBlock.id,
          label: 'Email',
          type: TextResponseType.email,
          integrationId: null,
          routeId: null
        }
      }
    }))
  }

  const mockFreeformUpdate: MockedResponse<TextResponseTypeUpdate> = {
    request: {
      query: TEXT_RESPONSE_TYPE_UPDATE,
      variables: {
        id: selectedBlock.id,
        input: {
          label: 'Your answer here',
          type: TextResponseType.freeForm,
          integrationId: null,
          routeId: null
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          __typename: 'TextResponseBlock',
          id: selectedBlock.id,
          label: 'Your answer here',
          type: TextResponseType.freeForm,
          integrationId: null,
          routeId: null
        }
      }
    }))
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should change type to email', async () => {
    render(
      <MockedProvider mocks={[mockEmailUpdate]}>
        <JourneyProvider value={{ journey: {} as unknown as Journey }}>
          <EditorProvider initialState={{ selectedBlock }}>
            <Type />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Email' }))
    await waitFor(() => expect(mockEmailUpdate.result).toHaveBeenCalled())
    await waitFor(() => expect(journeyUpdatedAtCacheUpdate).toHaveBeenCalled())
  })

  it('should reset integrationId and routeId to null if type is freeform', async () => {
    render(
      <MockedProvider mocks={[mockFreeformUpdate]}>
        <JourneyProvider value={{ journey: {} as unknown as Journey }}>
          <EditorProvider
            initialState={{
              selectedBlock: {
                ...selectedBlock,
                type: TextResponseType.email,
                integrationId: 'integration',
                routeId: 'route'
              }
            }}
          >
            <Type />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Freeform' }))
    await waitFor(() => expect(mockFreeformUpdate.result).toHaveBeenCalled())
    await waitFor(() => expect(journeyUpdatedAtCacheUpdate).toHaveBeenCalled())
  })

  it('should undo the change to type', async () => {
    render(
      <MockedProvider mocks={[mockEmailUpdate, mockFreeformUpdate]}>
        <JourneyProvider value={{ journey: {} as unknown as Journey }}>
          <EditorProvider
            initialState={{
              selectedBlock
            }}
          >
            <CommandUndoItem variant="button" />
            <Type />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Email' }))
    await waitFor(() => expect(mockEmailUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockFreeformUpdate.result).toHaveBeenCalled())

    await waitFor(() => expect(journeyUpdatedAtCacheUpdate).toHaveBeenCalled())
  })

  it('should redo the change to type that was undone', async () => {
    const mockRedoUpdate = {
      ...mockEmailUpdate
    }

    render(
      <MockedProvider
        mocks={[mockEmailUpdate, mockFreeformUpdate, mockRedoUpdate]}
      >
        <JourneyProvider value={{ journey: {} as unknown as Journey }}>
          <EditorProvider initialState={{ selectedBlock }}>
            <CommandUndoItem variant="button" />
            <CommandRedoItem variant="button" />
            <Type />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Email' }))
    await waitFor(() => expect(mockEmailUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockFreeformUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockRedoUpdate.result).toHaveBeenCalled())

    await waitFor(() => expect(journeyUpdatedAtCacheUpdate).toHaveBeenCalled())
  })

  it('should not call mutation if there is no selected block', async () => {
    render(
      <MockedProvider mocks={[mockEmailUpdate]}>
        <EditorProvider initialState={{}}>
          <Type />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Email' }))
    await waitFor(() => expect(mockEmailUpdate.result).not.toHaveBeenCalled())
    await waitFor(() =>
      expect(journeyUpdatedAtCacheUpdate).not.toHaveBeenCalled()
    )
  })

  it('should retain integration and route when switching from email to name', async () => {
    const mockNameUpdate: MockedResponse<TextResponseTypeUpdate> = {
      request: {
        query: TEXT_RESPONSE_TYPE_UPDATE,
        variables: {
          id: selectedBlock.id,
          input: {
            label: 'Name',
            type: TextResponseType.name
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          textResponseBlockUpdate: {
            __typename: 'TextResponseBlock',
            id: selectedBlock.id,
            label: 'Name',
            type: TextResponseType.name,
            integrationId: 'integration',
            routeId: 'route'
          }
        }
      }))
    }

    render(
      <MockedProvider mocks={[mockNameUpdate]}>
        <JourneyProvider value={{ journey: {} as unknown as Journey }}>
          <EditorProvider
            initialState={{
              selectedBlock: {
                ...selectedBlock,
                type: TextResponseType.email,
                integrationId: 'integration',
                routeId: 'route'
              }
            }}
          >
            <Type />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Name' }))
    await waitFor(() => expect(mockNameUpdate.result).toHaveBeenCalled())
  })
})
