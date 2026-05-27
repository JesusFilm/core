import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { type MockedFunction } from 'vitest'

import { LanguageSwitcher } from './LanguageSwitcher'

vi.mock('next/router', () => ({
  __esModule: true,
  useRouter: vi.fn()
}))

vi.mock('next-i18next/pages', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str) => str,
      i18n: {
        language: 'en',
        options: {
          locales: [
            'en',
            'es',
            'fr',
            'id',
            'th',
            'ja',
            'ru',
            'tr',
            'zh',
            'zh-hans-CN'
          ]
        }
      }
    }
  }
}))

const mockUseRouter = useRouter as MockedFunction<typeof useRouter>

describe('LanguageSwitcher', () => {
  const handleClose = vi.fn()

  beforeEach(() => vi.clearAllMocks())

  it('should translate page when new language selected', async () => {
    const push = vi.fn()
    mockUseRouter.mockReturnValue({
      push,
      asPath: '/'
    } as unknown as NextRouter)
    const { getByText, getByRole } = render(
      <LanguageSwitcher open handleClose={handleClose} />
    )

    expect(getByText('Change Language')).toBeInTheDocument()
    fireEvent.mouseDown(getByRole('combobox'))
    await waitFor(() => {
      fireEvent.click(getByText('Japanese'))
    })
    expect(push).toHaveBeenCalledWith('/', '/', { locale: 'ja' })
  })

  it('should revert back to previous language', async () => {
    const push = vi.fn()
    mockUseRouter.mockReturnValue({
      push,
      asPath: '/'
    } as unknown as NextRouter)

    const { getByText, getByRole } = render(
      <LanguageSwitcher open handleClose={handleClose} />
    )

    expect(getByText('Change Language')).toBeInTheDocument()
    fireEvent.mouseDown(getByRole('combobox'))
    await waitFor(() => fireEvent.click(getByText('Japanese')))
    expect(push).toHaveBeenCalledWith('/', '/', { locale: 'ja' })
    expect(
      getByText('Would you like to revert to previous language?')
    ).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Revert' }))
    expect(push).toHaveBeenCalledWith('/', '/', { locale: 'en' })
  })
})
