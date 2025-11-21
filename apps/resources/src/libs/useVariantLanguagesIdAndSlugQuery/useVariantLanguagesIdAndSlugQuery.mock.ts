import { GetVariantLanguagesIdAndSlug } from '../../../__generated__/GetVariantLanguagesIdAndSlug'

export const mockVariantLanguagesIdAndSlugData: GetVariantLanguagesIdAndSlug = {
  video: {
    __typename: 'Video',
    variantLanguages: [
      {
        __typename: 'Language',
        id: 'lang1',
        slug: 'en'
      },
      {
        __typename: 'Language',
        id: 'lang2',
        slug: 'es'
      },
      {
        __typename: 'Language',
        id: 'lang3',
        slug: 'fr'
      }
    ],
    subtitles: [
      {
        __typename: 'VideoSubtitle',
        languageId: 'lang1'
      },
      {
        __typename: 'VideoSubtitle',
        languageId: 'lang2'
      },
      {
        __typename: 'VideoSubtitle',
        languageId: 'lang3'
      }
    ]
  }
}

export const mockVariantLanguagesIdAndSlugDataEmpty: GetVariantLanguagesIdAndSlug =
  {
    video: {
      __typename: 'Video',
      variantLanguages: [],
      subtitles: []
    }
  }

export const mockVariantLanguagesIdAndSlugDataPartial: GetVariantLanguagesIdAndSlug =
  {
    video: {
      __typename: 'Video',
      variantLanguages: [
        {
          __typename: 'Language',
          id: 'lang1',
          slug: 'en'
        }
      ],
      subtitles: [
        {
          __typename: 'VideoSubtitle',
          languageId: 'lang1'
        }
      ]
    }
  }
