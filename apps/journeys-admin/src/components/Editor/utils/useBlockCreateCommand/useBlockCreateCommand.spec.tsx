import { MockedProvider } from '@apollo/client/testing'
import {
  act,
  render,
  renderHook,
  screen,
  waitFor
} from '@testing-library/react'
import { ReactElement, useEffect } from 'react'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_CardBlock as CardBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

import { TestEditorState } from '../../../../libs/TestEditorState'
import { EditorLayoutProvider } from '../../EditorLayoutContext'

import { useBlockCreateCommand } from './useBlockCreateCommand'

const block: CardBlock = {
  id: 'cardId',
  __typename: 'CardBlock',
  parentBlockId: 'stepId',
  parentOrder: 0,
  coverBlockId: null,
  backgroundColor: null,
  themeMode: null,
  themeName: null,
  fullscreen: false,
  backdropBlur: null,
  eventLabel: null,
  showAssistant: null,
  expandChatByDefault: null
}
const execute = vi.fn().mockResolvedValue(block)

describe('useBlockCreateCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should run the execute command and return a block', async () => {
    const { result } = renderHook(() => useBlockCreateCommand(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[]}>
          <EditorProvider initialState={{ selectedBlock: block as TreeBlock }}>
            {children}
          </EditorProvider>
        </MockedProvider>
      )
    })

    await act(async () => {
      result.current.addBlock({
        block: {
          id: 'videoBlockId'
        } as unknown as TreeBlock,
        execute
      })
    })
    await waitFor(() => expect(execute).toHaveBeenCalled())
  })

  it('should focus the settings drawer slide in the layered layout', async () => {
    function AddBlockOnMount(): ReactElement {
      const { addBlock } = useBlockCreateCommand()

      useEffect(() => {
        addBlock({
          block: { id: 'videoBlockId' } as unknown as TreeBlock,
          execute
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [])

      return <></>
    }

    render(
      <MockedProvider mocks={[]}>
        <EditorProvider initialState={{ selectedBlock: block as TreeBlock }}>
          <EditorLayoutProvider value="layered">
            <TestEditorState />
            <AddBlockOnMount />
          </EditorLayoutProvider>
        </EditorProvider>
      </MockedProvider>
    )

    await waitFor(() => expect(execute).toHaveBeenCalled())
    expect(screen.getByText('activeSlide: 2')).toBeInTheDocument()
  })
})
