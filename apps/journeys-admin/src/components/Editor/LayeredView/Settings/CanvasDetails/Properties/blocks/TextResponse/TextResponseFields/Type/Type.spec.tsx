import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import { TextResponseType } from '../../../../../../../../../../../__generated__/globalTypes'
import { TextResponseTypeUpdate } from '../../../../../../../../../../../__generated__/TextResponseTypeUpdate'
import { CommandRedoItem } from '../../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../../Toolbar/Items/CommandUndoItem'

import { TEXT_RESPONSE_TYPE_UPDATE, Type } from './Type'

describe('Type', () => {
  const selectedBlock: TreeBlock<TextResponseBlock> = {
    __typename: 'TextResponseBlock',
    id: 'textResponse0.id',
    parentBlockId: '0',
    parentOrder: 0,
    label: 'Label',
    placeholder: null,
    hint: null,
    minRows: null,
    integrationId: null,
    routeId: null,
    type: TextResponseType.freeForm,
    required: null,
    children: [],
    hideLabel: false
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

  const mockPhoneUpdate: MockedResponse<TextResponseTypeUpdate> = {
    request: {
      query: TEXT_RESPONSE_TYPE_UPDATE,
      variables: {
        id: selectedBlock.id,
        input: {
          label: 'Phone',
          type: TextResponseType.phone,
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
          label: 'Phone',
          type: TextResponseType.phone,
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
          label: 'Label',
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
          label: 'Label',
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
        <EditorProvider initialState={{ selectedBlock }}>
          <Type />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Email' }))
    await waitFor(() => expect(mockEmailUpdate.result).toHaveBeenCalled())
  })

  it('should change type to phone', async () => {
    render(
      <MockedProvider mocks={[mockPhoneUpdate]}>
        <EditorProvider initialState={{ selectedBlock }}>
          <Type />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Phone' }))
    await waitFor(() => expect(mockPhoneUpdate.result).toHaveBeenCalled())
  })

  it('should reset integrationId and routeId to null if type is freeform', async () => {
    render(
      <MockedProvider mocks={[mockFreeformUpdate]}>
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
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Freeform' }))
    await waitFor(() => expect(mockFreeformUpdate.result).toHaveBeenCalled())
  })

  it('should undo the change to type', async () => {
    render(
      <MockedProvider mocks={[mockEmailUpdate, mockFreeformUpdate]}>
        <EditorProvider
          initialState={{
            selectedBlock
          }}
        >
          <CommandUndoItem variant="button" />
          <Type />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Email' }))
    await waitFor(() => expect(mockEmailUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockFreeformUpdate.result).toHaveBeenCalled())
  })

  it('should redo the change to type that was undone', async () => {
    const mockRedoUpdate = {
      ...mockEmailUpdate
    }

    render(
      <MockedProvider
        mocks={[mockEmailUpdate, mockFreeformUpdate, mockRedoUpdate]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <CommandRedoItem variant="button" />
          <Type />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Email' }))
    await waitFor(() => expect(mockEmailUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(mockFreeformUpdate.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() => expect(mockRedoUpdate.result).toHaveBeenCalled())
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
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Name' }))
    await waitFor(() => expect(mockNameUpdate.result).toHaveBeenCalled())
  })
})
