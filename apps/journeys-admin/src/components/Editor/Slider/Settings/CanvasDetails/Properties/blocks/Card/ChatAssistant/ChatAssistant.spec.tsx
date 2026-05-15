import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_CardBlock as CardBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import { CARD_BLOCK_CHAT_ASSISTANT_UPDATE, ChatAssistant } from './ChatAssistant'

function makeCard(overrides: Partial<TreeBlock<CardBlock>> = {}): TreeBlock<CardBlock> {
  return {
    id: 'card1.id',
    __typename: 'CardBlock',
    parentBlockId: 'step1.id',
    parentOrder: 0,
    coverBlockId: null,
    backgroundColor: null,
    themeMode: null,
    themeName: null,
    fullscreen: false,
    backdropBlur: null,
    eventLabel: null,
    children: [],
    showAssistant: null,
    expandChatByDefault: null,
    ...overrides
  }
}

function cacheWithCard(): InMemoryCache {
  const cache = new InMemoryCache()
  cache.restore({
    'Journey:journeyId': {
      blocks: [{ __ref: 'CardBlock:card1.id' }],
      id: 'journeyId',
      __typename: 'Journey'
    }
  })
  return cache
}

describe('ChatAssistant', () => {
  it('renders Show AI chat switch off when showAssistant is null', () => {
    const card = makeCard({ showAssistant: null })
    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock: card }}>
          <ChatAssistant />
        </EditorProvider>
      </MockedProvider>
    )
    const parentSwitch = screen.getByLabelText('Show AI chat')
    expect(parentSwitch).not.toBeChecked()
  })

  it('hides Open chat automatically when showAssistant is false', () => {
    const card = makeCard({ showAssistant: false, expandChatByDefault: false })
    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock: card }}>
          <ChatAssistant />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.queryByLabelText('Open chat automatically')).not.toBeInTheDocument()
  })

  it('toggling Show AI chat on calls cardBlockUpdate with showAssistant true', async () => {
    const card = makeCard({ showAssistant: false, expandChatByDefault: false })
    const result = jest.fn(() => ({
      data: {
        cardBlockUpdate: {
          __typename: 'CardBlock',
          id: 'card1.id',
          showAssistant: true,
          expandChatByDefault: false
        }
      }
    }))
    render(
      <MockedProvider
        cache={cacheWithCard()}
        mocks={[
          {
            request: {
              query: CARD_BLOCK_CHAT_ASSISTANT_UPDATE,
              variables: {
                id: 'card1.id',
                input: { showAssistant: true, expandChatByDefault: false }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock: card }}>
          <ChatAssistant />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByLabelText('Show AI chat'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('shows the Open chat automatically switch when showAssistant is true', () => {
    const card = makeCard({ showAssistant: true, expandChatByDefault: false })
    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock: card }}>
          <ChatAssistant />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByLabelText('Open chat automatically')).toBeInTheDocument()
  })

  it('toggling Open chat automatically on calls cardBlockUpdate with expandChatByDefault true', async () => {
    const card = makeCard({ showAssistant: true, expandChatByDefault: false })
    const result = jest.fn(() => ({
      data: {
        cardBlockUpdate: {
          __typename: 'CardBlock',
          id: 'card1.id',
          showAssistant: true,
          expandChatByDefault: true
        }
      }
    }))
    render(
      <MockedProvider
        cache={cacheWithCard()}
        mocks={[
          {
            request: {
              query: CARD_BLOCK_CHAT_ASSISTANT_UPDATE,
              variables: {
                id: 'card1.id',
                input: { showAssistant: true, expandChatByDefault: true }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock: card }}>
          <ChatAssistant />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByLabelText('Open chat automatically'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('toggling Show AI chat off clears expandChatByDefault in the same call', async () => {
    const card = makeCard({ showAssistant: true, expandChatByDefault: true })
    const result = jest.fn(() => ({
      data: {
        cardBlockUpdate: {
          __typename: 'CardBlock',
          id: 'card1.id',
          showAssistant: false,
          expandChatByDefault: false
        }
      }
    }))
    render(
      <MockedProvider
        cache={cacheWithCard()}
        mocks={[
          {
            request: {
              query: CARD_BLOCK_CHAT_ASSISTANT_UPDATE,
              variables: {
                id: 'card1.id',
                input: { showAssistant: false, expandChatByDefault: false }
              }
            },
            result
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock: card }}>
          <ChatAssistant />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByLabelText('Show AI chat'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('undo restores the prior values', async () => {
    const card = makeCard({ showAssistant: false, expandChatByDefault: false })
    const executeResult = jest.fn(() => ({
      data: {
        cardBlockUpdate: {
          __typename: 'CardBlock',
          id: 'card1.id',
          showAssistant: true,
          expandChatByDefault: false
        }
      }
    }))
    const undoResult = jest.fn(() => ({
      data: {
        cardBlockUpdate: {
          __typename: 'CardBlock',
          id: 'card1.id',
          showAssistant: false,
          expandChatByDefault: false
        }
      }
    }))
    render(
      <MockedProvider
        cache={cacheWithCard()}
        mocks={[
          {
            request: {
              query: CARD_BLOCK_CHAT_ASSISTANT_UPDATE,
              variables: {
                id: 'card1.id',
                input: { showAssistant: true, expandChatByDefault: false }
              }
            },
            result: executeResult
          },
          {
            request: {
              query: CARD_BLOCK_CHAT_ASSISTANT_UPDATE,
              variables: {
                id: 'card1.id',
                input: { showAssistant: false, expandChatByDefault: false }
              }
            },
            result: undoResult
          }
        ]}
      >
        <EditorProvider initialState={{ selectedBlock: card }}>
          <CommandUndoItem variant="button" />
          <ChatAssistant />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.click(screen.getByLabelText('Show AI chat'))
    await waitFor(() => expect(executeResult).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(undoResult).toHaveBeenCalled())
  })
})
