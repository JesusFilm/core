import { MockedProvider } from '@apollo/client/testing'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useRouter } from 'next/navigation'
import { SnackbarProvider } from 'notistack'

import {
  GET_LANGUAGE_STUDIO_MANAGED_FILMS,
  GET_LANGUAGES,
  LanguageList
} from './LanguageList'

vi.mock('next/navigation')

const push = vi.fn()
const languageStudioManagedFilmIds = [
  '1_cl-0-0',
  '1_jf-0-0',
  '1_wjv-0-0',
  '1_wl-0-0',
  'MAG1'
]

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
      where: { hasVideos: true }
    }
  },
  result: {
    data: {
      adminLanguages: [
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
        }
      ],
      adminLanguagesCount: 1
    }
  }
}

const allLanguagesMock = {
  ...getLanguagesMock,
  request: {
    ...getLanguagesMock.request,
    variables: {
      ...getLanguagesMock.request.variables,
      where: undefined
    }
  },
  result: {
    data: {
      adminLanguages: [
        ...getLanguagesMock.result.data.adminLanguages,
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
      adminLanguagesCount: 2
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
      where: { hasVideos: true }
    }
  },
  result: {
    data: {
      adminLanguages: [
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
      adminLanguagesCount: 1
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
      term: '206',
      where: { hasVideos: true }
    }
  },
  result: {
    data: {
      adminLanguages: [getLanguagesMock.result.data.adminLanguages[0]],
      adminLanguagesCount: 1
    }
  }
}

const getLanguageStudioManagedFilmsMock = {
  request: {
    query: GET_LANGUAGE_STUDIO_MANAGED_FILMS,
    variables: {
      ids: languageStudioManagedFilmIds,
      languageId: '529'
    }
  },
  result: {
    data: {
      adminVideos: [
        {
          id: '1_cl-0-0',
          title: [
            {
              value: 'The Story of Jesus for Children',
              __typename: 'VideoTitle'
            }
          ],
          variants: [],
          __typename: 'Video'
        },
        {
          id: '1_jf-0-0',
          title: [{ value: 'JESUS', __typename: 'VideoTitle' }],
          variants: [
            {
              id: '20615_1_jf-0-0',
              version: 3,
              language: { id: '20615', __typename: 'Language' },
              __typename: 'VideoVariant'
            }
          ],
          __typename: 'Video'
        },
        {
          id: '1_wjv-0-0',
          title: [
            {
              value: 'Walking with Jesus (Africa)',
              __typename: 'VideoTitle'
            }
          ],
          variants: [],
          __typename: 'Video'
        },
        {
          id: '1_wl-0-0',
          title: [
            {
              value: "Magdalena - Director's Cut",
              __typename: 'VideoTitle'
            }
          ],
          variants: [
            {
              id: '20615_1_wl-0-0',
              version: 4,
              language: { id: '20615', __typename: 'Language' },
              __typename: 'VideoVariant'
            }
          ],
          __typename: 'Video'
        },
        {
          id: 'MAG1',
          title: [{ value: 'Magdalena', __typename: 'VideoTitle' }],
          variants: [
            {
              id: '529_MAG1',
              version: 42,
              language: { id: '529', __typename: 'Language' },
              __typename: 'VideoVariant'
            }
          ],
          __typename: 'Video'
        }
      ]
    }
  }
}

const getLanguageStudioManagedFilmsWithoutLanguageMock = {
  ...getLanguageStudioManagedFilmsMock,
  result: {
    data: {
      adminVideos: [
        {
          id: '1_jf-0-0',
          title: [{ value: 'JESUS', __typename: 'VideoTitle' }],
          variants: [
            {
              id: '529_1_jf-0-0',
              version: 1,
              language: { id: '529', __typename: 'Language' },
              __typename: 'VideoVariant'
            }
          ],
          __typename: 'Video'
        }
      ]
    }
  }
}

const getLanguageStudioManagedFilmsNullMock = {
  ...getLanguageStudioManagedFilmsMock,
  result: {
    data: {
      adminVideos: null
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
      <MockedProvider
        mocks={[getLanguagesMock, getLanguageStudioManagedFilmsMock]}
      >
        <SnackbarProvider>
          <LanguageList />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(await screen.findByText('Chinese, Mandarin')).toBeInTheDocument()
    expect(screen.getByText('Putonghua')).toBeInTheDocument()
    expect(screen.getByText('mandarin-china')).toBeInTheDocument()
    expect(screen.getAllByText('Yes')).toHaveLength(2)
    expect(
      screen.getByRole('columnheader', {
        name: 'Linked Language Studio Managed Films'
      })
    ).toBeInTheDocument()
    expect(screen.getByText('JESUS:')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute(
      'href',
      '/videos/1_jf-0-0/audio/20615_1_jf-0-0'
    )
    expect(screen.getByText(': 1_jf-0-0')).toBeInTheDocument()
    expect(screen.getByText("Magdalena - Director's Cut:")).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '4' })).toHaveAttribute(
      'href',
      '/videos/1_wl-0-0/audio/20615_1_wl-0-0'
    )
    expect(screen.getByText(': 1_wl-0-0')).toBeInTheDocument()
    expect(
      screen.getByRole('combobox', { name: 'Has videos' })
    ).toHaveTextContent('Yes')
  })

  it('should search languages by name without choosing a column', async () => {
    const user = userEvent.setup()

    render(
      <MockedProvider
        mocks={[
          getLanguagesMock,
          getLanguageStudioManagedFilmsMock,
          searchLanguagesMock
        ]}
      >
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
      <MockedProvider
        mocks={[
          getLanguagesMock,
          getLanguageStudioManagedFilmsMock,
          searchLanguageIdMock
        ]}
      >
        <SnackbarProvider>
          <LanguageList />
        </SnackbarProvider>
      </MockedProvider>
    )

    await user.type(
      screen.getByRole('textbox', { name: 'Search languages' }),
      '206'
    )
    await waitForSearchDebounce()

    expect(await screen.findByText('Chinese, Mandarin')).toBeInTheDocument()
  })

  it('should show all languages when choosing any has videos filter', async () => {
    const user = userEvent.setup()

    render(
      <MockedProvider
        mocks={[
          getLanguagesMock,
          getLanguageStudioManagedFilmsWithoutLanguageMock,
          allLanguagesMock
        ]}
      >
        <SnackbarProvider>
          <LanguageList />
        </SnackbarProvider>
      </MockedProvider>
    )

    await screen.findByText('Chinese, Mandarin')
    await user.click(screen.getByRole('combobox', { name: 'Has videos' }))
    await user.click(screen.getByRole('option', { name: 'Any' }))

    expect(await screen.findByText('12345')).toBeInTheDocument()
    expect(screen.getAllByText('-').length).toBeGreaterThan(0)
  })

  it('should show an empty linked films state when managed films are null', async () => {
    render(
      <MockedProvider
        mocks={[getLanguagesMock, getLanguageStudioManagedFilmsNullMock]}
      >
        <SnackbarProvider>
          <LanguageList />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(await screen.findByText('Chinese, Mandarin')).toBeInTheDocument()
    expect(screen.getByText('-')).toBeInTheDocument()
  })

  it('should navigate to language editor when clicking a row', async () => {
    render(
      <MockedProvider
        mocks={[getLanguagesMock, getLanguageStudioManagedFilmsMock]}
      >
        <SnackbarProvider>
          <LanguageList />
        </SnackbarProvider>
      </MockedProvider>
    )

    fireEvent.click(await screen.findByText('Chinese, Mandarin'))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/languages/20615'))
  })
})
