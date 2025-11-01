import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LanguageSelector } from './LanguageSelector'

jest.mock('next-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}))

jest.mock('../../libs/useLanguages', () => ({
  useLanguages: jest.fn()
}))

jest.mock('react-instantsearch', () => ({
  useRefinementList: jest.fn()
}))

const useLanguagesMock = jest.requireMock('../../libs/useLanguages')
  .useLanguages as jest.Mock
const useRefinementListMock = jest.requireMock('react-instantsearch')
  .useRefinementList as jest.Mock

describe('LanguageSelector', () => {
  beforeEach(() => {
    useLanguagesMock.mockReset()
    useRefinementListMock.mockReset()
  })

  it('renders loading state while languages are loading', () => {
    useLanguagesMock.mockReturnValue({
      languages: [],
      isLoading: true
    })
    useRefinementListMock.mockReturnValue({
      items: [],
      refine: jest.fn()
    })

    render(<LanguageSelector />)

    const button = screen.getByRole('combobox', {
      name: 'Loading languages...'
    })
    expect(button).toBeDisabled()
  })

  it('displays placeholder text when no language is selected', () => {
    useLanguagesMock.mockReturnValue({
      languages: [
        {
          id: '529',
          slug: 'english',
          displayName: 'English'
        }
      ],
      isLoading: false
    })
    useRefinementListMock.mockReturnValue({
      items: [
        {
          label: 'English',
          value: 'english',
          isRefined: false,
          count: 10
        }
      ],
      refine: jest.fn()
    })

    render(<LanguageSelector />)

    expect(
      screen.getByRole('combobox', { name: 'Search languages...' })
    ).toBeInTheDocument()
  })

  it('refines language selection when an option is chosen', async () => {
    const user = userEvent.setup()
    const refine = jest.fn()

    useLanguagesMock.mockReturnValue({
      languages: [
        {
          id: '529',
          slug: 'english',
          englishName: { id: '529', primary: true, value: 'English' },
          displayName: 'English'
        },
        {
          id: '496',
          slug: 'french',
          englishName: { id: '529', primary: false, value: 'French' },
          nativeName: { id: '496', primary: true, value: 'Français' },
          displayName: 'French'
        }
      ],
      isLoading: false
    })
    useRefinementListMock.mockReturnValue({
      items: [
        {
          label: 'English',
          value: 'english',
          isRefined: true,
          count: 10
        },
        {
          label: 'French',
          value: 'french',
          isRefined: false,
          count: 5
        }
      ],
      refine
    })

    render(<LanguageSelector />)

    await user.click(screen.getByRole('combobox', { name: 'English' }))
    const frenchOption = await screen.findByText('French')
    await user.click(frenchOption)

    expect(refine).toHaveBeenNthCalledWith(1, 'english')
    expect(refine).toHaveBeenNthCalledWith(2, 'french')
  })
})
