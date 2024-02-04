import { MockedProvider } from '@apollo/client/testing'
import { TranslationStatus } from '@crowdin/crowdin-api-client'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'
import { i18n } from 'next-i18next'

import { GET_LANGUAGES } from '../../libs/useLanguagesQuery'

import { LanguageSwitcher } from './LanguageSwitcher'

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

jest.mock('next-i18next', () => ({
  __esModule: true,
  i18n: {
    language: 'en'
  }
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('LanguageSwitcher', () => {
  it('should render language selector', () => {
    jest
      .spyOn(TranslationStatus.prototype, 'getProjectProgress')
      .mockImplementation(async () => {
        return await Promise.resolve({
          pagination: {
            offset: 0,
            limit: 25
          },
          data: []
        })
      })

    const result = jest.fn()

    const { getByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LANGUAGES
            },
            result
          }
        ]}
      >
        <LanguageSwitcher open handleClose={jest.fn()} />
      </MockedProvider>
    )
    expect(getByText('Change Language')).toBeInTheDocument()
  })

  it('should show languages that are translated fully', async () => {
    jest
      .spyOn(TranslationStatus.prototype, 'getFileProgress')
      .mockImplementation(async () => {
        return await Promise.resolve({
          pagination: {
            offset: 0,
            limit: 25
          },
          data: [
            {
              data: {
                approvalProgress: 100,
                words: {
                  approved: 1,
                  preTranslateAppliedTo: 0,
                  total: 1,
                  translated: 1
                },
                phrases: {
                  approved: 1,
                  preTranslateAppliedTo: 0,
                  total: 1,
                  translated: 1
                },
                translationProgress: 100,
                languageId: 'ar',
                eTag: '',
                language: {
                  twoLettersCode: '',
                  androidCode: '',
                  dialectOf: '',
                  editorCode: '',
                  id: '',
                  locale: '',
                  name: 'Arabic',
                  osxCode: '',
                  osxLocale: 'ar',
                  pluralCategoryNames: [],
                  pluralExamples: [],
                  pluralRules: '',
                  textDirection: 'rtl',
                  threeLettersCode: ''
                }
              }
            },
            {
              data: {
                approvalProgress: 0,
                words: {
                  approved: 0,
                  preTranslateAppliedTo: 0,
                  total: 1,
                  translated: 0
                },
                phrases: {
                  approved: 0,
                  preTranslateAppliedTo: 0,
                  total: 1,
                  translated: 0
                },
                translationProgress: 0,
                languageId: 'fr',
                eTag: '',
                language: {
                  twoLettersCode: '',
                  androidCode: '',
                  dialectOf: '',
                  editorCode: '',
                  id: '',
                  locale: '',
                  name: 'French',
                  osxCode: '',
                  osxLocale: 'fr',
                  pluralCategoryNames: [],
                  pluralExamples: [],
                  pluralRules: '',
                  textDirection: 'ltr',
                  threeLettersCode: ''
                }
              }
            }
          ]
        })
      })

    const { getByText, getByRole, queryByText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LANGUAGES,
              variables: {
                languageId: '529'
              }
            },
            result: {
              data: {
                languages: [
                  {
                    id: '22658',
                    bcp47: 'ar',
                    name: [
                      {
                        primary: true,
                        value: ' اللغة العربية'
                      },
                      {
                        primary: false,
                        value: 'Arabic, Modern Standard'
                      }
                    ]
                  },
                  {
                    id: '529',
                    bcp47: 'en',
                    name: [
                      {
                        primary: true,
                        value: 'English'
                      }
                    ]
                  },
                  {
                    id: '496',
                    bcp47: 'fr',
                    name: [
                      {
                        primary: true,
                        value: 'Français'
                      },
                      {
                        primary: false,
                        value: 'French'
                      }
                    ]
                  }
                ]
              }
            }
          }
        ]}
      >
        <LanguageSwitcher open handleClose={jest.fn()} />
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Open' }))
    await waitFor(() =>
      expect(getByText('Arabic, Modern Standard')).toBeInTheDocument()
    )
    expect(getByText('English')).toBeInTheDocument()
    expect(queryByText('French')).toBeNull()
  })

  it('should translate page when new language selected', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({
      push,
      asPath: '/'
    } as unknown as NextRouter)
    jest
      .spyOn(TranslationStatus.prototype, 'getFileProgress')
      .mockImplementation(async () => {
        return await Promise.resolve({
          pagination: {
            offset: 0,
            limit: 25
          },
          data: [
            {
              data: {
                approvalProgress: 100,
                words: {
                  approved: 1,
                  preTranslateAppliedTo: 0,
                  total: 1,
                  translated: 1
                },
                phrases: {
                  approved: 1,
                  preTranslateAppliedTo: 0,
                  total: 1,
                  translated: 1
                },
                translationProgress: 100,
                languageId: 'ar',
                eTag: '',
                language: {
                  twoLettersCode: '',
                  androidCode: '',
                  dialectOf: '',
                  editorCode: '',
                  id: '',
                  locale: '',
                  name: 'Arabic',
                  osxCode: '',
                  osxLocale: 'ar',
                  pluralCategoryNames: [],
                  pluralExamples: [],
                  pluralRules: '',
                  textDirection: 'rtl',
                  threeLettersCode: ''
                }
              }
            }
          ]
        })
      })

    const mockHandleClose = jest.fn()

    const { getByText, getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LANGUAGES,
              variables: {
                languageId: '529'
              }
            },
            result: {
              data: {
                languages: [
                  {
                    id: '22658',
                    bcp47: 'ar',
                    name: [
                      {
                        primary: true,
                        value: ' اللغة العربية'
                      },
                      {
                        primary: false,
                        value: 'Arabic, Modern Standard'
                      }
                    ]
                  },
                  {
                    id: '529',
                    bcp47: 'en',
                    name: [
                      {
                        primary: true,
                        value: 'English'
                      }
                    ]
                  }
                ]
              }
            }
          }
        ]}
      >
        <LanguageSwitcher open handleClose={mockHandleClose} />
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Open' }))
    await waitFor(() => fireEvent.click(getByText('Arabic, Modern Standard')))
    expect(push).toHaveBeenCalledWith('/', '/', { locale: 'ar' })
    expect(getByText('Confirm Language Change')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'Yes' }))
    expect(mockHandleClose).toHaveBeenCalled()
  })

  it('should revert back to previous language', async () => {
    const push = jest.fn()
    mockUseRouter.mockReturnValue({
      push,
      asPath: '/'
    } as unknown as NextRouter)
    jest
      .spyOn(TranslationStatus.prototype, 'getFileProgress')
      .mockImplementation(async () => {
        return await Promise.resolve({
          pagination: {
            offset: 0,
            limit: 25
          },
          data: [
            {
              data: {
                approvalProgress: 100,
                words: {
                  approved: 1,
                  preTranslateAppliedTo: 0,
                  total: 1,
                  translated: 1
                },
                phrases: {
                  approved: 1,
                  preTranslateAppliedTo: 0,
                  total: 1,
                  translated: 1
                },
                translationProgress: 100,
                languageId: 'ar',
                eTag: '',
                language: {
                  twoLettersCode: '',
                  androidCode: '',
                  dialectOf: '',
                  editorCode: '',
                  id: '',
                  locale: '',
                  name: 'Arabic',
                  osxCode: '',
                  osxLocale: 'ar',
                  pluralCategoryNames: [],
                  pluralExamples: [],
                  pluralRules: '',
                  textDirection: 'rtl',
                  threeLettersCode: ''
                }
              }
            }
          ]
        })
      })

    const mockHandleClose = jest.fn()

    const { getByText, getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_LANGUAGES,
              variables: {
                languageId: '529'
              }
            },
            result: {
              data: {
                languages: [
                  {
                    id: '22658',
                    bcp47: 'ar',
                    name: [
                      {
                        primary: true,
                        value: ' اللغة العربية'
                      },
                      {
                        primary: false,
                        value: 'Arabic, Modern Standard'
                      }
                    ]
                  },
                  {
                    id: '529',
                    bcp47: 'en',
                    name: [
                      {
                        primary: true,
                        value: 'English'
                      }
                    ]
                  }
                ]
              }
            }
          }
        ]}
      >
        <LanguageSwitcher open handleClose={mockHandleClose} />
      </MockedProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Open' }))
    await waitFor(() => fireEvent.click(getByText('Arabic, Modern Standard')))
    expect(push).toHaveBeenCalledWith('/', '/', { locale: 'ar' })
    expect(getByText('Confirm Language Change')).toBeInTheDocument()
    fireEvent.click(getByRole('button', { name: 'No' }))
    expect(push).toHaveBeenCalledWith('/', '/', { locale: 'en' })
    await waitFor(() => expect(mockHandleClose).toHaveBeenCalled())
  })
})
