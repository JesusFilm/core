import { MockedProvider } from '@apollo/client/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { SnackbarProvider } from 'notistack'

import { GET_LANGUAGES, LanguageList } from './LanguageList'

vi.mock('next/navigation')

const push = vi.fn()

vi.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<
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
      languages: [
        {
          id: '20615',
          bcp47: 'zh',
          iso3: 'zho',
          slug: 'mandarin-china',
          hasVideos: true,
          name: [
            {
              id: '2',
              languageId: '529',
              value: 'Chinese, Mandarin',
              primary: false,
              __typename: 'LanguageName'
            }
          ],
          nativeName: [
            {
              id: '1',
              languageId: '20615',
              value: 'Putonghua',
              primary: true,
              __typename: 'LanguageName'
            }
          ],
          __typename: 'Language'
        },
        {
          id: '12345',
          bcp47: null,
          iso3: null,
          slug: null,
          hasVideos: false,
          name: [],
          nativeName: [],
          __typename: 'Language'
        }
      ],
      languagesCount: 2
    }
  }
}

const searchLanguagesMock = {
  request: {
    query: GET_LANGUAGES,
    variables: {
      limit: 25,
      offset: 0,
      nameLanguageId: '529',
      term: 'eng',
      where: undefined
    }
  },
  result: {
    data: {
      languages: [
        {
          id: '529',
          bcp47: 'en',
          iso3: 'eng',
          slug: 'english',
          hasVideos: true,
          name: [
            {
              id: '3',
              languageId: '529',
              value: 'English',
              primary: true,
              __typename: 'LanguageName'
            }
          ],
          nativeName: [
            {
              id: '3',
              languageId: '529',
              value: 'English',
              primary: true,
              __typename: 'LanguageName'
            }
          ],
          __typename: 'Language'
        }
      ],
      languagesCount: 1
    }
  }
}

const searchLanguageIdMock = {
  request: {
    query: GET_LANGUAGES,
    variables: {
      limit: 25,
      offset: 0,
      nameLanguageId: '529',
      term: '123',
      where: undefined
    }
  },
  result: {
    data: {
      languages: [getLanguagesMock.result.data.languages[1]],
      languagesCount: 1
    }
  }
}

const hasVideosLanguagesMock = {
  request: {
    query: GET_LANGUAGES,
    variables: {
      limit: 25,
      offset: 0,
      nameLanguageId: '529',
      term: undefined,
      where: { hasVideos: true }
    }
  },
  result: {
    data: {
      languages: [getLanguagesMock.result.data.languages[0]],
      languagesCount: 1
    }
  }
}

async function waitForSearchDebounce(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 350))
  })
}

describe('LanguageList', () => {
  beforeEach(() => {
    push.mockClear()
  })

  it('should show languages', async () => {
    render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <SnackbarProvider>
          <LanguageList />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(await screen.findByText('Chinese, Mandarin')).toBeInTheDocument()
    expect(screen.getByText('Putonghua')).toBeInTheDocument()
    expect(screen.getByText('mandarin-china')).toBeInTheDocument()
    expect(screen.getByText('Yes')).toBeInTheDocument()
    expect(screen.getByText('12345')).toBeInTheDocument()
  })

  it('should search languages by name without choosing a column', async () => {
    const user = userEvent.setup()

    render(
      <MockedProvider mocks={[getLanguagesMock, searchLanguagesMock]}>
        <SnackbarProvider>
          <LanguageList />
        </SnackbarProvider>
      </MockedProvider>
    )

    await user.type(
      screen.getByRole('textbox', { name: 'Search languages' }),
      'eng'
    )
    await waitForSearchDebounce()

    expect(await screen.findByText('English')).toBeInTheDocument()
  })

  it('should search languages by id prefix without choosing a column', async () => {
    const user = userEvent.setup()

    render(
      <MockedProvider mocks={[getLanguagesMock, searchLanguageIdMock]}>
        <SnackbarProvider>
          <LanguageList />
        </SnackbarProvider>
      </MockedProvider>
    )

    await user.type(
      screen.getByRole('textbox', { name: 'Search languages' }),
      '123'
    )
    await waitForSearchDebounce()

    expect(await screen.findByText('12345')).toBeInTheDocument()
  })

  it('should filter languages by has videos using the server query', async () => {
    const user = userEvent.setup()

    render(
      <MockedProvider mocks={[getLanguagesMock, hasVideosLanguagesMock]}>
        <SnackbarProvider>
          <LanguageList />
        </SnackbarProvider>
      </MockedProvider>
    )

    await screen.findByText('Chinese, Mandarin')
    await user.click(screen.getByRole('combobox', { name: 'Has videos' }))
    await user.click(screen.getByRole('option', { name: 'Yes' }))

    expect(await screen.findByText('Chinese, Mandarin')).toBeInTheDocument()
  })

  it('should navigate to language editor when clicking a row', async () => {
    render(
      <MockedProvider mocks={[getLanguagesMock]}>
        <SnackbarProvider>
          <LanguageList />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(await screen.findByText('Chinese, Mandarin'))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/languages/20615'))
  })
})
