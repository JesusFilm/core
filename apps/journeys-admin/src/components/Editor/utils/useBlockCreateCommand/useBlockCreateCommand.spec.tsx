import { FetchResult } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { renderHook } from '@testing-library/react'
import { useBlockCreateCommand } from './useBlockCreateCommand'

describe('useBlockCreateCommand', () => {
  it('should create a block with the passed in block create mutation function and variables', async () => {
    const createBlockMutationFnMock = jest.fn().mockResolvedValue({
      data: { buttonCreate: { id: 'buttonId' } }
    } as FetchResult)

    const { result } = renderHook(() => useBlockCreateCommand(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[]}>
          <EditorProvider>{children}</EditorProvider>
        </MockedProvider>
      )
    })

    await result.current.addBlockCommand(createBlockMutationFnMock, {
      variables: { id: 'someId' }
    })
    expect(createBlockMutationFnMock).toHaveBeenCalledWith({
      variables: { id: 'someId' }
    })
  })
})
