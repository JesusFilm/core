import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_CardBlock as CardBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import { renderHook } from '@testing-library/react'
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
  fullscreen: false
}
const execute = jest.fn().mockResolvedValue(block)

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useBlockCreateCommand', () => {
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

    await result.current.addBlock({
      block: {
        id: 'videoBlockId'
      } as unknown as TreeBlock,
      execute
    })
    expect(execute).toHaveBeenCalled()
  })
})
