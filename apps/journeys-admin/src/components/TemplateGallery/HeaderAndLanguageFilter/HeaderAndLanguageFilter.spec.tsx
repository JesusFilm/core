import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { GET_LANGUAGES } from '../../../libs/useLanguagesQuery/useLanguagesQuery'

import { HeaderAndLanguageFilter } from '.'

import '../../../../test/i18n'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('HeaderAndLanguageFilter', () => {
  it('should open the language filter popper on button click', async () => {
    const onChange = jest.fn()
    const { getByRole, getAllByRole, getAllByText, getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LANGUAGES,
              variables: {
                languageId: '529',
                where: {
                  ids: [
                    '529',
                    '4415',
                    '1106',
                    '4451',
                    '496',
                    '20526',
                    '584',
                    '21028',
                    '20615',
                    '3934'
                  ]
                }
              }
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
        <HeaderAndLanguageFilter selectedLanguageIds={[]} onChange={onChange} />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(getAllByText('Journey Templates')[0]).toBeInTheDocument()
      fireEvent.click(getAllByRole('heading', { name: 'All Languages' })[0])
    })
    fireEvent.click(getByRole('button', { name: 'German, Standard Deutsch' }))
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(1))
    fireEvent.click(getByRole('button', { name: 'French Français' }))
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(2))
    fireEvent.click(getByTestId('PresentationLayer'))
    await waitFor(() => expect(onChange).toHaveBeenCalledTimes(3))
  })
})
