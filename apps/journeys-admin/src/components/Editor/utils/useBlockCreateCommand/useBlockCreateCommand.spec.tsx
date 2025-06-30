import { MockedProvider } from '@apollo/client/testing'
import { renderHook } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import { BlockFields_CardBlock as CardBlock } from '@core/journeys/ui/block/__generated__/BlockFields'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'

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
  backdropBlur: null
}
const execute = jest.fn().mockResolvedValue(block)

describe('useBlockCreateCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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

    result.current.addBlock({
      block: {
        id: 'videoBlockId'
      } as unknown as TreeBlock,
      execute
    })
    expect(execute).toHaveBeenCalled()
  })
})
