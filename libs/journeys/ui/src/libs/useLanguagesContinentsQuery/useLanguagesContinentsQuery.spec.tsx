import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { useLanguagesContinentsQuery } from './useLanguagesContinentsQuery'
import { getLanguagesContinentsMock } from './useLanguagesContinentsQuery.mock'

describe('useLanguagesContinentsQuery', () => {
  it('should get languages and continents', async () => {
    const result = jest.fn().mockReturnValue(getLanguagesContinentsMock.result)

    renderHook(() => useLanguagesContinentsQuery(), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[{ ...getLanguagesContinentsMock, result }]}>
          {children}
        </MockedProvider>
      )
    })

    await act(
      async () => await waitFor(() => expect(result).toHaveBeenCalled())
    )
  })
})
