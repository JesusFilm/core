import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { GET_VIDEO_LANGUAGES } from './AudioLanguageDialog'
import { AudioLanguageDialog } from '.'

describe('AudioLanguageDialog', () => {
  const mocks = [
    {
      request: {
        query: GET_VIDEO_LANGUAGES,
        variables: {
          id: '1_jf-0-0',
          languageId: '529'
        }
      },
      result: {
        data: {
          video: {
            id: '1_jf-0-0',
            variant: {
              id: '529',
              language: {
                __typename: 'Language',
                name: [
                  {
                    value: 'English',
                    primary: true,
                    __typename: 'Translation'
                  }
                ]
              }
            },
            variantLanguages: [
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
          }
        }
      }
    }
  ]

  it('should sort langauge options alphabetically', async () => {
    const { getByRole, queryAllByRole } = render(
      <MockedProvider mocks={mocks}>
        <AudioLanguageDialog open onClose={jest.fn()} />
      </MockedProvider>
    )
    await waitFor(() => fireEvent.focus(getByRole('textbox')))
    fireEvent.keyDown(getByRole('textbox'), { key: 'ArrowDown' })
    expect(queryAllByRole('option')[0]).toHaveTextContent('English')
    expect(queryAllByRole('option')[1]).toHaveTextContent('French')
    expect(queryAllByRole('option')[2]).toHaveTextContent('German')
  })

  it('should set default value', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <AudioLanguageDialog open onClose={jest.fn()} />
      </MockedProvider>
    )
    await waitFor(() => expect(getByRole('textbox')).toHaveValue('English'))
  })

  // TODO: test redirect on language option click
})
