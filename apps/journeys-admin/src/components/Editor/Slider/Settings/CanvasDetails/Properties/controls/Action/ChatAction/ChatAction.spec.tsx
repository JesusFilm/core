import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../../../../../__generated__/globalTypes'
import { StepFields as StepBlock } from '../../../../../../../../../../__generated__/StepFields'
import { BLOCK_ACTION_CHAT_UPDATE } from '../../../../../../../../../libs/useBlockActionChatUpdateMutation'
import { blockActionChatUpdateMock } from '../../../../../../../../../libs/useBlockActionChatUpdateMutation/useBlockActionChatUpdateMutation.mock'
import { blockActionNavigateToBlockUpdateMock } from '../../../../../../../../../libs/useBlockActionNavigateToBlockUpdateMutation/useBlockActionNavigateToBlockUpdateMutation.mock'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { ChatAction } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('ChatAction', () => {
  const selectedBlock: TreeBlock = {
    __typename: 'ButtonBlock',
    id: 'button2.id',
    parentBlockId: 'card1.id',
    parentOrder: 4,
    label: 'Contact Us',
    buttonVariant: ButtonVariant.contained,
    buttonColor: ButtonColor.primary,
    size: ButtonSize.large,
    startIconId: null,
    endIconId: null,
    submitEnabled: null,
    action: {
      parentBlockId: 'button2.id',
      __typename: 'ChatAction',
      gtmEventName: 'gtmEventName',
      chatUrl: 'https://chat.example.com',
      customizable: false,
      parentStepId: null
    },
    children: [],
    settings: null
  }

  const selectedStep = {
    __typename: 'StepBlock',
    id: 'step.id'
  } as unknown as TreeBlock<StepBlock>

  it('displays the action chat url', async () => {
    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock, selectedStep }}>
          <ChatAction />
        </EditorProvider>
      </MockedProvider>
    )
    expect(
      screen.getByDisplayValue('https://chat.example.com')
    ).toBeInTheDocument()
  })

  it('updates action chat url', async () => {
    const result = jest.fn(() => ({
      data: {
        blockUpdateChatAction: {
          __typename: 'ChatAction',
          parentBlockId: 'button2.id',
          gtmEventName: null,
          chatUrl: 'https://chat.example.com',
          customizable: false,
          parentStepId: 'step.id'
        }
      }
    }))
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BLOCK_ACTION_CHAT_UPDATE,
              variables: {
                id: 'button2.id',
                input: {
                  chatUrl: 'https://chat.example.com',
                  customizable: false,
                  parentStepId: 'step.id'
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock, selectedStep }}>
          <ChatAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'https://chat.example.com' }
    })
    fireEvent.blur(screen.getByRole('textbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('is a required field', async () => {
    render(
      <MockedProvider>
        <EditorProvider>
          <ChatAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(
      screen.getByRole('textbox', { name: 'Paste chat URL here...' }),
      {
        target: { value: '' }
      }
    )
    fireEvent.blur(
      screen.getByRole('textbox', { name: 'Paste chat URL here...' })
    )
    await waitFor(() =>
      expect(screen.getByText('Required')).toBeInTheDocument()
    )
  })

  it('accepts links without protocol as a URL', async () => {
    const result = jest.fn(() => ({
      data: {
        blockUpdateChatAction: {
          __typename: 'ChatAction',
          parentBlockId: 'button2.id',
          gtmEventName: null,
          chatUrl: 'https://chat.example.com',
          customizable: false,
          parentStepId: 'step.id'
        }
      }
    }))
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BLOCK_ACTION_CHAT_UPDATE,
              variables: {
                id: 'button2.id',
                input: {
                  chatUrl: 'https://chat.example.com',
                  customizable: false,
                  parentStepId: 'step.id'
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock, selectedStep }}>
          <ChatAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'chat.example.com' }
    })
    fireEvent.blur(screen.getByRole('textbox'))
    await waitFor(() =>
      expect(screen.queryByText('Invalid URL')).not.toBeInTheDocument()
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('accepts deep links as a URL', async () => {
    const result = jest.fn(() => ({
      data: {
        blockUpdateChatAction: {
          parentBlockId: selectedBlock.id,
          gtmEventName: 'gtmEventName',
          chatUrl: 'viber://',
          customizable: false,
          parentStepId: 'step.id'
        }
      }
    }))

    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BLOCK_ACTION_CHAT_UPDATE,
              variables: {
                id: selectedBlock.id,
                input: {
                  chatUrl: 'viber://',
                  customizable: false,
                  parentStepId: 'step.id'
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock, selectedStep }}>
          <ChatAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'viber://' }
    })
    fireEvent.blur(screen.getByRole('textbox'))
    await waitFor(() =>
      expect(screen.queryByText('Invalid URL')).not.toBeInTheDocument()
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should submit when enter is pressed', async () => {
    const result = jest.fn(() => ({
      data: {
        blockUpdateChatAction: {
          __typename: 'ChatAction',
          parentBlockId: 'button2.id',
          gtmEventName: null,
          chatUrl: 'https://chat.example.com',
          customizable: false,
          parentStepId: 'step.id'
        }
      }
    }))
    render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: BLOCK_ACTION_CHAT_UPDATE,
              variables: {
                id: 'button2.id',
                input: {
                  chatUrl: 'https://chat.example.com',
                  customizable: false,
                  parentStepId: 'step.id'
                }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock, selectedStep }}>
          <ChatAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'https://chat.example.com' }
    })
    fireEvent.submit(screen.getByRole('textbox'), {
      target: { value: 'https://chat.example.com' }
    })
    await waitFor(() =>
      expect(screen.queryByText('Invalid URL')).not.toBeInTheDocument()
    )
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should handle undo', async () => {
    const result = jest
      .fn()
      .mockReturnValue(blockActionNavigateToBlockUpdateMock.result)
    render(
      <MockedProvider
        mocks={[
          blockActionChatUpdateMock,
          { ...blockActionNavigateToBlockUpdateMock, result }
        ]}
      >
        <EditorProvider
          initialState={{
            selectedBlock: {
              ...selectedBlock,
              action: {
                parentBlockId: 'button2.id',
                __typename: 'NavigateToBlockAction',
                gtmEventName: 'gtmEventName',
                blockId: 'step2.id'
              }
            },
            selectedStep
          }}
        >
          <ChatAction />
          <CommandUndoItem variant="button" />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'https://chat.example.com' }
    })
    fireEvent.blur(screen.getByRole('textbox'))
    const undo = screen.getByRole('button', { name: 'Undo' })
    await waitFor(() => expect(undo).not.toBeDisabled())
    fireEvent.click(undo)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
