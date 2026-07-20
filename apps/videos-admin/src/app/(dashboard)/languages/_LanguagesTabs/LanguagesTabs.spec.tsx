import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { SnackbarProvider } from 'notistack'

import { GET_LANGUAGES } from '../_LanguageList/LanguageList'

import { LanguagesTabs } from './LanguagesTabs'

vi.mock('next/navigation')

vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as unknown as ReturnType<
  typeof useRouter
>)

const getLanguagesMock = {
  request: {
    query: GET_LANGUAGES,
    variables: {
      limit: 25,
      offset: 0,
      nameLanguageId: '529',
      term: undefined,
      where: undefined
    }
  },
  result: {
    data: {
      adminLanguages: [],
      adminLanguagesCount: 0
    }
  }
}

function renderTabs(): void {
  render(
    <MockedProvider mocks={[getLanguagesMock]}>
      <SnackbarProvider>
        <LanguagesTabs />
      </SnackbarProvider>
    </MockedProvider>
  )
}

describe('LanguagesTabs', () => {
  it('shows the languages list by default', () => {
    renderTabs()

    expect(
      screen.getByRole('textbox', { name: 'Search languages' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Reindex languages in Algolia' })
    ).not.toBeInTheDocument()
  })

  it('shows the language debug panel when its tab is selected', async () => {
    const user = userEvent.setup()
    renderTabs()

    await user.click(screen.getByRole('tab', { name: 'Language Debug' }))

    expect(
      screen.getByRole('button', { name: 'Reindex languages in Algolia' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('textbox', { name: 'Search languages' })
    ).not.toBeInTheDocument()
  })
})
