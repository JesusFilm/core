import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'
import { act } from 'react'

import { useCountryQuery } from './useCountryQuery'
import { getCountryMock } from './useCountryQuery.mock'

describe('useCountryQuery', () => {
  it('should get country based on countryId', async () => {
    const result = jest.fn().mockReturnValue(getCountryMock.result)

    renderHook(() => useCountryQuery({ countryId: 'country.id' }), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[{ ...getCountryMock, result }]}>
          {children}
        </MockedProvider>
      )
    })

    await act(
      async () => await waitFor(() => expect(result).toHaveBeenCalled())
    )
  })
})
