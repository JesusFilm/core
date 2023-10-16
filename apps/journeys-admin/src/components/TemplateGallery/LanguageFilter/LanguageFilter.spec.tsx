import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { GET_LANGUAGES } from '../../Editor/EditToolbar/Menu/LanguageMenuItem/LanguageDialog'

import { LanguageFilter } from '.'

describe('LanguageFilter', () => {
  const result = jest.fn(() => ({
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
  }))

  const mock = {
    request: {
      query: GET_LANGUAGES,
      variables: {
        languageId: '529'
      }
    },
    result
  }

  it('should open the langauge filter dialog on button click', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={[mock]}>
        <LanguageFilter languageId="529" onChange={jest.fn} />
      </MockedProvider>
    )
    await waitFor(() =>
      fireEvent.click(getByRole('button', { name: 'English' }))
    )
    expect(getByRole('dialog')).toBeInTheDocument()
  })
})
