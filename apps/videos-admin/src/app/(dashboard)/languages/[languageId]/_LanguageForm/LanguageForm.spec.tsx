import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useParams, useRouter } from 'next/navigation'
import { SnackbarProvider } from 'notistack'

import {
  GET_LANGUAGE,
  LanguageForm,
  UPDATE_LANGUAGE,
  UPDATE_LANGUAGE_NAME
} from './LanguageForm'

vi.mock('next/navigation')

const push = vi.fn()

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
      <MockedProvider mocks={[]}>
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

  it('should return to the language list', async () => {
    renderForm()

    fireEvent.click(await screen.findByRole('button', { name: 'Back' }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/languages'))
  })
})
