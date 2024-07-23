import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { TreeBlock } from '@core/journeys/ui/block'

import { BlockFields_TextResponseBlock as TextResponseBlock } from '../../../../../../../../../../../__generated__/BlockFields'
import { TextResponseLabelUpdate } from '../../../../../../../../../../../__generated__/TextResponseLabelUpdate'
import { TextResponseTypeUpdate } from '../../../../../../../../../../../__generated__/TextResponseTypeUpdate'
import { TextResponseType } from '../../../../../../../../../../../__generated__/globalTypes'

import { CommandRedoItem } from '../../../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../../../Toolbar/Items/CommandUndoItem'
import { TEXT_RESPONSE_LABEL_UPDATE } from '../Label/Label'
import { TEXT_RESPONSE_TYPE_UPDATE, Type } from './Type'

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

  const textResponseLabelUpdateMock: MockedResponse<TextResponseLabelUpdate> = {
    request: {
      query: TEXT_RESPONSE_LABEL_UPDATE,
      variables: {
        id: selectedBlock.id,
        input: {
          label: 'Updated label'
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          __typename: 'TextResponseBlock',
          id: selectedBlock.id,
          label: 'Updated label'
        }
      }
    }))
  }

  const textResponseTypeUpdateMock: MockedResponse<TextResponseTypeUpdate> = {
    request: {
      query: TEXT_RESPONSE_TYPE_UPDATE,
      variables: {
        id: selectedBlock.id,
        input: {
          type: TextResponseType.email
        }
      }
    },
    result: jest.fn(() => ({
      data: {
        textResponseBlockUpdate: {
          id: selectedBlock.id,
          __typename: 'TextResponseBlock',
          type: TextResponseType.email,
          integrationId: null,
          routeId: null
        }
      }
    }))
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should change type of text response', async () => {
    const emailLabelUpdateMock: MockedResponse<TextResponseLabelUpdate> = {
      ...textResponseLabelUpdateMock,
      request: {
        query: TEXT_RESPONSE_LABEL_UPDATE,
        variables: {
          id: selectedBlock.id,
          input: {
            label: 'Email'
          }
        }
      }
    }

    const emailTextResponseTypeUpdateMock = {
      ...textResponseTypeUpdateMock,
      request: {
        query: TEXT_RESPONSE_TYPE_UPDATE,
        variables: {
          id: selectedBlock.id,
          input: {
            type: TextResponseType.email
          }
        }
      }
    }

    render(
      <MockedProvider
        mocks={[emailLabelUpdateMock, emailTextResponseTypeUpdateMock]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <Type />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Email' }))
    await waitFor(() =>
      expect(emailTextResponseTypeUpdateMock.result).toHaveBeenCalled()
    )
    await waitFor(() => expect(emailLabelUpdateMock.result).toHaveBeenCalled())
  })

  it('should reset integrationId and routeId to null if type is not email', async () => {
    const freeFormTypeUpdateMock = {
      ...textResponseTypeUpdateMock,
      request: {
        query: TEXT_RESPONSE_TYPE_UPDATE,
        variables: {
          id: selectedBlock.id,
          input: {
            type: TextResponseType.freeForm,
            integrationId: null,
            routeId: null
          }
        }
      }
    }

    const freeFormLabelUpdateMock = {
      ...textResponseLabelUpdateMock,
      request: {
        query: TEXT_RESPONSE_LABEL_UPDATE,
        variables: {
          id: selectedBlock.id,
          input: {
            label: 'Your answer here'
          }
        }
      }
    }

    render(
      <MockedProvider mocks={[freeFormTypeUpdateMock, freeFormLabelUpdateMock]}>
        <EditorProvider
          initialState={{
            selectedBlock: { ...selectedBlock, type: TextResponseType.email }
          }}
        >
          <Type />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Freeform' }))
    await waitFor(() =>
      expect(freeFormTypeUpdateMock.result).toHaveBeenCalled()
    )
  })

  it('should undo the change to type', async () => {
    const emailLabelUpdateMock: MockedResponse<TextResponseLabelUpdate> = {
      ...textResponseLabelUpdateMock,
      request: {
        query: TEXT_RESPONSE_LABEL_UPDATE,
        variables: {
          id: selectedBlock.id,
          input: {
            label: 'Email'
          }
        }
      }
    }

    const emailTextResponseTypeUpdateMock = {
      ...textResponseTypeUpdateMock,
      request: {
        query: TEXT_RESPONSE_TYPE_UPDATE,
        variables: {
          id: selectedBlock.id,
          input: {
            type: TextResponseType.email
          }
        }
      }
    }

    const undoLabelUpdateMock: MockedResponse<TextResponseLabelUpdate> = {
      ...textResponseLabelUpdateMock,
      request: {
        query: TEXT_RESPONSE_LABEL_UPDATE,
        variables: {
          id: selectedBlock.id,
          input: {
            label: 'Your answer here'
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          textResponseBlockUpdate: {
            __typename: 'TextResponseBlock',
            id: selectedBlock.id,
            label: 'Updated label'
          }
        }
      }))
    }

    const undoTextResponseTypeUpdateMock = {
      ...textResponseTypeUpdateMock,
      request: {
        query: TEXT_RESPONSE_TYPE_UPDATE,
        variables: {
          id: selectedBlock.id,
          input: {
            type: TextResponseType.freeForm
          }
        }
      }
    }

    render(
      <MockedProvider
        mocks={[
          emailLabelUpdateMock,
          emailTextResponseTypeUpdateMock,
          undoLabelUpdateMock,
          undoTextResponseTypeUpdateMock
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <Type />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Email' }))
    await waitFor(() =>
      expect(emailTextResponseTypeUpdateMock.result).toHaveBeenCalled()
    )
    await waitFor(() => expect(emailLabelUpdateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() =>
      expect(undoTextResponseTypeUpdateMock.result).toHaveBeenCalled()
    )
    await waitFor(() => expect(undoLabelUpdateMock.result).toHaveBeenCalled())
  })

  it('should redo the change to type that was undone', async () => {
    const emailLabelUpdateMock: MockedResponse<TextResponseLabelUpdate> = {
      ...textResponseLabelUpdateMock,
      request: {
        query: TEXT_RESPONSE_LABEL_UPDATE,
        variables: {
          id: selectedBlock.id,
          input: {
            label: 'Email'
          }
        }
      },
      maxUsageCount: 2
    }

    const emailTextResponseTypeUpdateMock = {
      ...textResponseTypeUpdateMock,
      request: {
        query: TEXT_RESPONSE_TYPE_UPDATE,
        variables: {
          id: selectedBlock.id,
          input: {
            type: TextResponseType.email
          }
        }
      },
      maxUsageCount: 2
    }

    const undoLabelUpdateMock: MockedResponse<TextResponseLabelUpdate> = {
      ...textResponseLabelUpdateMock,
      request: {
        query: TEXT_RESPONSE_LABEL_UPDATE,
        variables: {
          id: selectedBlock.id,
          input: {
            label: 'Your answer here'
          }
        }
      },
      result: jest.fn(() => ({
        data: {
          textResponseBlockUpdate: {
            __typename: 'TextResponseBlock',
            id: selectedBlock.id,
            label: 'Updated label'
          }
        }
      }))
    }

    const undoTextResponseTypeUpdateMock = {
      ...textResponseTypeUpdateMock,
      request: {
        query: TEXT_RESPONSE_TYPE_UPDATE,
        variables: {
          id: selectedBlock.id,
          input: {
            type: TextResponseType.freeForm
          }
        }
      }
    }

    render(
      <MockedProvider
        mocks={[
          emailLabelUpdateMock,
          emailTextResponseTypeUpdateMock,
          undoLabelUpdateMock,
          undoTextResponseTypeUpdateMock
        ]}
      >
        <EditorProvider initialState={{ selectedBlock }}>
          <CommandUndoItem variant="button" />
          <CommandRedoItem variant="button" />
          <Type />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Email' }))
    await waitFor(() =>
      expect(emailTextResponseTypeUpdateMock.result).toHaveBeenCalled()
    )
    await waitFor(() => expect(emailLabelUpdateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() =>
      expect(undoTextResponseTypeUpdateMock.result).toHaveBeenCalled()
    )
    await waitFor(() => expect(undoLabelUpdateMock.result).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
    await waitFor(() =>
      expect(emailTextResponseTypeUpdateMock.result).toHaveBeenCalled()
    )
    await waitFor(() => expect(emailLabelUpdateMock.result).toHaveBeenCalled())
  })
})
