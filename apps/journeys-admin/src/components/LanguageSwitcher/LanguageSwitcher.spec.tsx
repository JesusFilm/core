import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

import { LanguageSwitcher } from './LanguageSwitcher'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        language: 'en',
        options: {
          locales: [
            'en', // English
            'es', // Spanish
            'fr', // French
            'id', // Indonesian
            'ja', // Japanese
            'ru', // Russian
            'tr', // Turkish
            'zh', // Chinese
            'zh-CN' // Chinese, Simplified, Chinese Traditional will be added in the future
          ]
        }
      }
    }
  }
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('LanguageSwitcher', () => {
  const handleClose = jest.fn()

  it('should translate page when new language selected', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({
      push,
      asPath: '/'
    } as unknown as NextRouter)
    const { getByText, getAllByRole } = render(
      <LanguageSwitcher open handleClose={handleClose} />
    )

    fireEvent.click(getAllByRole('button')[0])
    await waitFor(() => fireEvent.click(getByText('Chinese, Mandarin')))
    expect(push).toHaveBeenCalledWith('/', '/', { locale: 'zh-CN' })
  })

  it('should revert back to previous language', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({
      push,
      asPath: '/'
    } as unknown as NextRouter)

    const { getByText, getByRole } = render(
      <MockedProvider>
        <LanguageSwitcher open handleClose={handleClose} />
      </MockedProvider>
    )

    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    await waitFor(() => fireEvent.click(getByText('Chinese, Mandarin')))
    expect(push).toHaveBeenCalledWith('/', '/', { locale: 'zh-CN' })
    expect(
      getByText('Are you sure you want to change language?')
    ).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Revert' }))
    expect(push).toHaveBeenCalledWith('/', '/', { locale: 'en' })
  })
})
