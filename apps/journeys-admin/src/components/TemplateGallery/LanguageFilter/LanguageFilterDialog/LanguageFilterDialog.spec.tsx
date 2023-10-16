import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { LanguageFilterDialog } from './LanguageFilterDialog'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('LanguageFilterDialog', () => {
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

  it('submits the form with the selected language', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({ push } as unknown as NextRouter)

    const { getByRole } = render(
      <MockedProvider>
        <LanguageFilterDialog
          open
          onClose={jest.fn()}
          languages={languages}
          loading={false}
        />
      </MockedProvider>
    )

    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    fireEvent.click(getByRole('option', { name: 'French Français' }))
    fireEvent.click(getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        pathname: '/templates',
        query: { languageId: '496' }
      })
    })
  })
})
