import {
  CampaignStringKey,
  CampaignTextSource
} from '../../../../../__generated__/globalTypes'
import { CampaignTranslatedValue } from '../../../../libs/useCampaignBlockTextMutation'
import { campaign, campaignStrings } from '../../data'
import { campaignStringText } from '../campaignStringText'
import { regionDisplayName } from '../regionDisplayName'

const ENGLISH = '529'
const FRENCH = '496'

function entry(
  languageId: string,
  value: unknown,
  source = CampaignTextSource.human
): CampaignTranslatedValue {
  return {
    __typename: 'TranslatedValue',
    languageId,
    value: value as string,
    source
  }
}

/** The `readTranslatedField` cases of `translatedField.spec`, with the answer the API's `resolveText` gives each. */
const CASES: Array<
  [
    string,
    {
      field: string | null
      translations: CampaignTranslatedValue[]
      previewLanguageId: string
    },
    string
  ]
> = [
  [
    'the column in the default language',
    {
      field: 'Hello',
      translations: [entry(ENGLISH, 'Shadow', CampaignTextSource.machine)],
      previewLanguageId: ENGLISH
    },
    'Hello'
  ],
  [
    'the translation when translating',
    {
      field: 'Hello',
      translations: [entry(FRENCH, 'Bonjour')],
      previewLanguageId: FRENCH
    },
    'Bonjour'
  ],
  [
    'the column when translating without a translation',
    { field: 'Hello', translations: [], previewLanguageId: FRENCH },
    'Hello'
  ],
  [
    'the column when the translation is empty',
    {
      field: 'Hello',
      translations: [entry(FRENCH, '')],
      previewLanguageId: FRENCH
    },
    'Hello'
  ],
  [
    'the column when the translation is not a string',
    {
      field: 'Hello',
      translations: [entry(FRENCH, ['x'])],
      previewLanguageId: FRENCH
    },
    'Hello'
  ],
  [
    'empty for an unset column',
    { field: null, translations: [], previewLanguageId: ENGLISH },
    ''
  ]
]

describe('reading a Translated Field in the Preview Language', () => {
  it.each(CASES)(
    'regionDisplayName reads %s',
    (_, { field, translations, previewLanguageId }, expected) => {
      expect(
        regionDisplayName(
          { name: field as string, nameTranslations: translations },
          previewLanguageId,
          ENGLISH
        )
      ).toBe(expected)
    }
  )

  it.each(CASES)(
    'campaignStringText reads %s, and its fallback when that is empty',
    (_, { field, translations, previewLanguageId }, expected) => {
      const copy = campaignStrings.find(
        (string) => string.key === CampaignStringKey.copy
      )
      const strings = [
        {
          ...copy!,
          value: field as string,
          valueTranslations: translations
        }
      ]
      expect(
        campaignStringText(
          { strings, defaultLanguageId: campaign.defaultLanguageId },
          CampaignStringKey.copy,
          previewLanguageId,
          'Copy link'
        )
      ).toBe(expected === '' ? 'Copy link' : expected)
    }
  )

  it('campaignStringText falls back for a string the campaign lacks', () => {
    expect(
      campaignStringText(
        { strings: [], defaultLanguageId: ENGLISH },
        CampaignStringKey.copy,
        FRENCH,
        'Copy link'
      )
    ).toBe('Copy link')
  })
})
