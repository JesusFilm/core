import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook, waitFor } from '@testing-library/react'

import { GET_LANGUAGES, useLanguagesQuery } from './useLanguagesQuery'

describe('useLanguagesQuery', () => {
  const languages = [
    {
      __typename: 'Language',
      id: '529',
      name: [
        {
          value: 'English',
          primary: true,
          __typename: 'Translation'
        }
      ]
    },
    {
      id: '496',
      __typename: 'Language',
      name: [
        {
          value: 'Français',
          primary: true,
          __typename: 'Translation'
        },
        {
          value: 'French',
          primary: false,
          __typename: 'Translation'
        }
      ]
    },
    {
      id: '1106',
      __typename: 'Language',
      name: [
        {
          value: 'Deutsch',
          primary: true,
          __typename: 'Translation'
        },
        {
          value: 'German, Standard',
          primary: false,
          __typename: 'Translation'
        }
      ]
    }
  ]

  it('should get languages', async () => {
    const result = jest.fn(() => ({
      data: {
        languages
      }
    }))

    renderHook(
      () =>
        useLanguagesQuery({
          languageId: '529'
        }),
      {
        wrapper: ({ children }) => (
          <MockedProvider
            mocks={[
              {
                request: {
                  query: GET_LANGUAGES,
                  variables: {
                    languageId: '529'
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

    await act(
      async () => await waitFor(() => expect(result).toHaveBeenCalled())
    )
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

    await act(
      async () => await waitFor(() => expect(result).toHaveBeenCalled())
    )
  })
})
