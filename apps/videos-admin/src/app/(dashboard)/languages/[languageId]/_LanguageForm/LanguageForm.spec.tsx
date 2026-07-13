import { MockedProvider } from '@apollo/client/testing'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { useParams, useRouter } from 'next/navigation'
import { SnackbarProvider } from 'notistack'

import {
  GET_LANGUAGE,
  GET_LANGUAGE_STUDIO_MANAGED_FILMS,
  LanguageForm,
  UPDATE_LANGUAGE,
  UPDATE_LANGUAGE_NAME
} from './LanguageForm'

vi.mock('next/navigation')

const push = vi.fn()
const languageStudioManagedFilmIds = [
  '1_cl-0-0',
  '1_jf-0-0',
  '1_wjv-0-0',
  '1_wl-0-0',
  'MAG1'
]

vi.mocked(useParams).mockReturnValue({ languageId: '20615' })
vi.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<
  typeof useRouter
>)

const language = {
  id: '20615',
  bcp47: 'zh',
  iso3: 'zho',
  slug: 'mandarin-china',
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
  countryLanguages: [
    {
      id: 'country-language-1',
      speakers: 100,
      displaySpeakers: 90,
      primary: true,
      suggested: false,
      order: 1,
      country: {
        id: 'CN',
        name: [
          {
            value: 'China',
            primary: true,
            __typename: 'CountryName'
          }
        ],
        __typename: 'Country'
      },
      __typename: 'CountryLanguage'
    }
  ],
  __typename: 'Language'
}

const getLanguageMock = {
  request: {
    query: GET_LANGUAGE,
    variables: { id: '20615', nameLanguageId: '529' }
  },
  result: { data: { language } }
}

const getLanguageStudioManagedFilmsMock = {
  request: {
    query: GET_LANGUAGE_STUDIO_MANAGED_FILMS,
    variables: { ids: languageStudioManagedFilmIds, languageId: '529' }
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
            },
            {
              id: '529_1_jf-0-0',
              version: 1,
              language: { id: '529', __typename: 'Language' },
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

const updatedLanguage = {
  ...language,
  bcp47: 'zh-Hans',
  nativeName: [
    {
      ...language.nativeName[0],
      value: '普通話'
    }
  ],
  name: [
    {
      ...language.name[0],
      value: 'Mandarin Chinese'
    }
  ]
}

const getUpdatedLanguageMock = {
  request: {
    query: GET_LANGUAGE,
    variables: { id: '20615', nameLanguageId: '529' }
  },
  result: { data: { language: updatedLanguage } }
}

function renderForm(): void {
  render(
    <MockedProvider
      mocks={[
        getLanguageMock,
        getLanguageStudioManagedFilmsMock,
        {
          request: {
            query: UPDATE_LANGUAGE,
            variables: {
              input: { id: '20615', bcp47: 'zh-Hans', iso3: 'zho' }
            }
          },
          result: {
            data: {
              languageUpdate: {
                id: '20615',
                bcp47: 'zh-Hans',
                iso3: 'zho',
                __typename: 'Language'
              }
            }
          }
        },
        {
          request: {
            query: UPDATE_LANGUAGE_NAME,
            variables: {
              input: {
                languageId: '20615',
                nameLanguageId: '529',
                value: 'Mandarin Chinese'
              }
            }
          },
          result: {
            data: {
              languageNameUpdate: {
                id: '20615',
                name: updatedLanguage.name,
                __typename: 'Language'
              }
            }
          }
        },
        {
          request: {
            query: UPDATE_LANGUAGE_NAME,
            variables: {
              input: {
                languageId: '20615',
                value: '普通話'
              }
            }
          },
          result: {
            data: {
              languageNameUpdate: {
                id: '20615',
                name: updatedLanguage.nativeName,
                __typename: 'Language'
              }
            }
          }
        },
        getUpdatedLanguageMock
      ]}
    >
      <SnackbarProvider>
        <LanguageForm />
      </SnackbarProvider>
    </MockedProvider>
  )
}

describe('LanguageForm', () => {
  beforeEach(() => {
    push.mockClear()
  })

  it('should render loading state inside the editor shell', () => {
    render(
      <MockedProvider
        mocks={[getLanguageMock, getLanguageStudioManagedFilmsMock]}
      >
        <SnackbarProvider>
          <LanguageForm />
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(screen.getByText('Loading language...')).toBeInTheDocument()
  })

  it('should save editable language fields', async () => {
    renderForm()

    fireEvent.change(
      await screen.findByRole('textbox', { name: 'Language name' }),
      {
        target: { value: 'Mandarin Chinese' }
      }
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Native name' }), {
      target: { value: '普通話' }
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'BCP 47' }), {
      target: { value: 'zh-Hans' }
    })
    fireEvent.change(screen.getByRole('textbox', { name: 'ISO 3' }), {
      target: { value: 'zho' }
    })

    fireEvent.click(screen.getAllByRole('button', { name: 'Save' })[0])

    expect(await screen.findByText('Language saved')).toBeInTheDocument()
  })

  it('should show linked Language Studio managed film versions', async () => {
    renderForm()

    expect(await screen.findByText('JESUS:')).toBeInTheDocument()
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
  })

  it('should show an empty linked films state when there are no managed film variants', async () => {
    render(
      <MockedProvider
        mocks={[
          getLanguageMock,
          getLanguageStudioManagedFilmsWithoutLanguageMock
        ]}
      >
        <SnackbarProvider>
          <LanguageForm />
        </SnackbarProvider>
      </MockedProvider>
    )

    const linkedFilmsHeading = await screen.findByRole('heading', {
      name: 'Linked Language Studio Managed Films'
    })
    const linkedFilmsSection = linkedFilmsHeading.parentElement as HTMLElement

    expect(within(linkedFilmsSection).getByText('-')).toBeInTheDocument()
  })

  it('should return to the language list', async () => {
    renderForm()

    fireEvent.click(await screen.findByRole('button', { name: 'Back' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/languages'))
  })
})
