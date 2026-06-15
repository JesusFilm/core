import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { BlockFields_CardBlock as CardBlock } from '../../../../../../../../../../__generated__/BlockFields'
import { CommandUndoItem } from '../../../../../../../Toolbar/Items/CommandUndoItem'

import {
  CARD_BLOCK_CHAT_ASSISTANT_UPDATE,
  ChatAssistant
} from './ChatAssistant'

function makeCard(
  overrides: Partial<TreeBlock<CardBlock>> = {}
): TreeBlock<CardBlock> {
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
  it('renders Enable AI chat switch off when showAssistant is null', () => {
    const card = makeCard({ showAssistant: null })
    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock: card }}>
          <ChatAssistant />
        </EditorProvider>
      </MockedProvider>
    )
    const parentSwitch = screen.getByLabelText('Enable AI chat')
    expect(parentSwitch).not.toBeChecked()
  })

  it('hides Collapse chat when Enable AI chat is off', () => {
    const card = makeCard({ showAssistant: false })
    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock: card }}>
          <ChatAssistant />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.queryByLabelText('Collapse chat')).not.toBeInTheDocument()
  })

  it('toggling Enable AI chat on saves showAssistant true + expandChatByDefault true (pops open by default)', async () => {
    const card = makeCard({ showAssistant: null, expandChatByDefault: null })
    const result = vi.fn(() => ({
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
    fireEvent.click(screen.getByLabelText('Enable AI chat'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('shows the Collapse chat switch when Enable AI chat is on', () => {
    const card = makeCard({ showAssistant: true })
    render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock: card }}>
          <ChatAssistant />
        </EditorProvider>
      </MockedProvider>
    )
    expect(screen.getByLabelText('Collapse chat')).toBeInTheDocument()
  })

  it('toggling Collapse chat on saves expandChatByDefault false', async () => {
    const card = makeCard({ showAssistant: true, expandChatByDefault: null })
    const result = vi.fn(() => ({
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
    fireEvent.click(screen.getByLabelText('Collapse chat'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('toggling Enable AI chat off preserves the collapse setting', async () => {
    // expandChatByDefault false → Collapse chat is on; disabling keeps it on.
    const card = makeCard({ showAssistant: true, expandChatByDefault: false })
    const result = vi.fn(() => ({
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
    fireEvent.click(screen.getByLabelText('Enable AI chat'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('undo restores the prior values', async () => {
    const card = makeCard({ showAssistant: false, expandChatByDefault: null })
    const executeResult = vi.fn(() => ({
      data: {
        cardBlockUpdate: {
          __typename: 'CardBlock',
          id: 'card1.id',
          showAssistant: true,
          expandChatByDefault: true
        }
      }
    }))
    const undoResult = vi.fn(() => ({
      data: {
        cardBlockUpdate: {
          __typename: 'CardBlock',
          id: 'card1.id',
          showAssistant: false,
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
            result: executeResult
          },
          {
            request: {
              query: CARD_BLOCK_CHAT_ASSISTANT_UPDATE,
              variables: {
                id: 'card1.id',
                input: { showAssistant: false, expandChatByDefault: true }
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
    fireEvent.click(screen.getByLabelText('Enable AI chat'))
    await waitFor(() => expect(executeResult).toHaveBeenCalled())
    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(undoResult).toHaveBeenCalled())
  })
})
