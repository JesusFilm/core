import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { LanguageFilterDialog } from './LanguageFilterDialog'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('LanguageFilterDialog', () => {
  const languages = [
    {
      __typename: 'Language',
      id: '529',
      name: [
        {
          value: 'English',
          primary: true,
          __typename: 'LanguageName'
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
          __typename: 'LanguageName'
        },
        {
          value: 'French',
          primary: false,
          __typename: 'LanguageName'
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
          __typename: 'LanguageName'
        },
        {
          value: 'German, Standard',
          primary: false,
          __typename: 'LanguageName'
        }
      ]
    }
  ]

  it('submits the form with the selected language', async () => {
    const onChange = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <LanguageFilterDialog
          open
          onClose={jest.fn()}
          onChange={onChange}
          languages={languages}
          value={[]}
          loading={false}
        />
      </MockedProvider>
    )

    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    fireEvent.click(getByRole('option', { name: 'German, Standard Deutsch' }))
    fireEvent.click(getByRole('option', { name: 'French Français' }))
    fireEvent.click(getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onChange).toHaveBeenCalled(), { timeout: 10000 })
  }, 15000)

  it('closes the form on cancel click', () => {
    const onClose = jest.fn()
    const { getByRole } = render(
      <MockedProvider>
        <LanguageFilterDialog
          open
          onClose={onClose}
          onChange={jest.fn()}
          languages={languages}
          value={[]}
          loading={false}
        />
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })
})
