import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { GET_LANGUAGES } from '../../../libs/useLanguagesQuery/useLanguagesQuery'

import { HeaderAndLanguageFilter } from '.'

import '../../../../test/i18n'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn(() => ({ query: { tab: 'active' } }))
}))

const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('HeaderAndLanguageFilter', () => {
  it('should open the language filter popper on button click', async () => {
    const onChange = jest.fn()
    const push = jest.fn()
    const on = jest.fn()

    mockedUseRouter.mockReturnValue({
      query: { param: null },
      push,
      events: {
        on
      }
    } as unknown as NextRouter)

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
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        query: { param: 'template-language' },
        push,
        events: {
          on
        }
      })
    })
  })
})
