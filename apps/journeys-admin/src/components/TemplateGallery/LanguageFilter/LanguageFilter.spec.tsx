import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { GET_LANGUAGES } from '../../Editor/EditToolbar/Menu/LanguageMenuItem/LanguageDialog'

import { LanguageFilter } from '.'

describe('LanguageFilter', () => {
  it('should open the language filter dialog on button click', async () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LANGUAGES
            },
            result: {
              data: {
                languages: [
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
        ]}
      >
        <LanguageFilter languageId="529" onChange={onChange} />
      </MockedProvider>
    )
    await waitFor(() =>
      fireEvent.click(getByRole('button', { name: 'English' }))
    )
    expect(getByRole('dialog')).toBeInTheDocument()
    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    fireEvent.click(getByRole('option', { name: 'French Français' }))
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onChange).toHaveBeenCalled())
  })
})
