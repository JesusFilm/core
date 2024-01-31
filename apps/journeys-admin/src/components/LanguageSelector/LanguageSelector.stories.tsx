import { MockedProvider } from '@apollo/client/testing'
import { TranslationStatus } from '@crowdin/crowdin-api-client'
import { jest } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../libs/storybook'
import { GET_LANGUAGES } from '../../libs/useLanguagesQuery'

import { LanguageSelector } from './LanguageSelector'

const LanguageSelectorStory: Meta<typeof LanguageSelector> = {
  ...simpleComponentConfig,
  component: LanguageSelector,
  title: 'Journeys-Admin/LanguageSelector'
}

jest
  .spyOn(TranslationStatus.prototype, 'getProjectProgress')
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

export const Default: StoryObj<typeof LanguageSelector> = {
  render: () => (
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
      <LanguageSelector open handleClose={jest.fn()} />
    </MockedProvider>
  )
}
export default LanguageSelectorStory
