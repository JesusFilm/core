import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { GET_LANGUAGES } from '../../../libs/useLanguagesQuery/useLanguagesQuery'

import { LanguageFilter } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

describe('LanguageFilter', () => {
  it('should open the language filter dialog on button click', async () => {
    const onChange = jest.fn()
    const { getByRole, getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LANGUAGES,
              variables: {
                languageId: '529'
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
        <LanguageFilter languageIds={[]} onChange={onChange} />
      </MockedProvider>
    )
    await waitFor(() => {
      expect(getByText('Filter by language:')).toBeInTheDocument()
      fireEvent.click(getByRole('button', { name: 'All Languages' }))
    })
    expect(getByRole('dialog')).toBeInTheDocument()
    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    fireEvent.click(getByRole('option', { name: 'German, Standard Deutsch' }))
    fireEvent.click(getByRole('option', { name: 'French Français' }))
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onChange).toHaveBeenCalled())
  })
})
