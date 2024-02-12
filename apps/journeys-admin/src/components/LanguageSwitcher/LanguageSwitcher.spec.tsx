import { MockedProvider } from '@apollo/client/testing'
import {
  ResponseObject,
  TranslationStatus,
  TranslationStatusModel
} from '@crowdin/crowdin-api-client'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { NextRouter, useRouter } from 'next/router'

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
  const handleClose = jest.fn()

  const languagesMock = {
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
            id: '21754',
            name: [
              {
                primary: true,
                value: '普通話'
              },
              {
                primary: false,
                value: 'Chinese, Mandarin'
              }
            ]
          },
          {
            id: '529',
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

  const languagesMockWithFrench = {
    ...languagesMock,
    resut: {
      data: {
        languages: [
          ...languagesMock.result.data.languages,
          {
            id: '496',
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

  const chineseTranslations: ResponseObject<TranslationStatusModel.LanguageProgress> =
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
        languageId: 'zh',
        eTag: '',
        language: {
          twoLettersCode: '',
          androidCode: '',
          dialectOf: '',
          editorCode: '',
          id: '',
          locale: 'zh-CN',
          name: 'Chinese',
          osxCode: '',
          osxLocale: 'zh',
          pluralCategoryNames: [],
          pluralExamples: [],
          pluralRules: '',
          textDirection: 'ltr',
          threeLettersCode: ''
        }
      }
    }

  const frenchTranslations: ResponseObject<TranslationStatusModel.LanguageProgress> =
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
          locale: 'fr-FR',
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

  it('should display language switcher along with fully translated languages', async () => {
    jest
      .spyOn(TranslationStatus.prototype, 'getFileProgress')
      .mockImplementation(async () => {
        return await Promise.resolve({
          pagination: {
            offset: 0,
            limit: 25
          },
          data: [chineseTranslations, frenchTranslations]
        })
      })

    const { getByText, getByRole, queryByText } = render(
      <MockedProvider mocks={[languagesMockWithFrench]}>
        <LanguageSwitcher open handleClose={handleClose} />
      </MockedProvider>
    )

    expect(getByText('Change Language')).toBeInTheDocument()
    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    await waitFor(() =>
      expect(getByText('Chinese, Mandarin')).toBeInTheDocument()
    )
    expect(getByText('English')).toBeInTheDocument()
    expect(queryByText('Français')).not.toBeInTheDocument()
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
          data: [chineseTranslations]
        })
      })

    const { getByText, getByRole } = render(
      <MockedProvider mocks={[languagesMock]}>
        <LanguageSwitcher open handleClose={handleClose} />
      </MockedProvider>
    )

    fireEvent.focus(getByRole('combobox'))
    fireEvent.keyDown(getByRole('combobox'), { key: 'ArrowDown' })
    await waitFor(() => fireEvent.click(getByText('Chinese, Mandarin')))
    expect(push).toHaveBeenCalledWith('/', '/', { locale: 'zh-CN' })
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
          data: [chineseTranslations]
        })
      })

    const { getByText, getByRole } = render(
      <MockedProvider mocks={[languagesMock]}>
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
