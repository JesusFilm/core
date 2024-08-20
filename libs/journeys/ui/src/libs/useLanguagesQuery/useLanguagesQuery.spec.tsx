import { MockedProvider } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'

import { getLanguagesMock, languages } from './useLanguageQuery.mock'
import { GET_LANGUAGES, useLanguagesQuery } from './useLanguagesQuery'

describe('useLanguagesQuery', () => {
  it('should get languages', async () => {
    const result = jest.fn().mockReturnValue(getLanguagesMock.result)
    renderHook(
      () =>
        useLanguagesQuery({
          languageId: '529'
        }),
      {
        wrapper: ({ children }) => (
          <MockedProvider mocks={[{ ...getLanguagesMock, result }]}>
            {children}
          </MockedProvider>
        )
      }
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('should return languages filtered by ids', async () => {
    const result = jest.fn(() => ({
      data: {
        languages: [languages[0], languages[1]]
      }
    }))

    renderHook(
      () =>
        useLanguagesQuery({
          languageId: '529',
          where: {
            ids: ['529', '496']
          }
        }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_LANGUAGES,
                  variables: {
                    languageId: '529',
                    where: {
                      ids: ['529', '496']
                    }
                  }
                },
                result
              }
            ]}
          >
            {children}
          </MockedProvider>
        )
      }
    )

    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})
