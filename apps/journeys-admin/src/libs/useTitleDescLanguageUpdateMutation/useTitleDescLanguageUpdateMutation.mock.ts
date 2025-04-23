import { TITLE_DESC_LANGUAGE_UPDATE } from './useTitleDescLanguageUpdateMutation'

export const getTitleDescLanguageUpdateMock = ({
  title,
  description,
  languageId
}: {
  title: string
  description: string | null
  languageId: string
}): {
  request: {
    query: typeof TITLE_DESC_LANGUAGE_UPDATE
    variables: {
      id: string
      input: {
        title: string
        description: string | null
        languageId: string
      }
    }
  }
  result: {
    data: {
      journeyUpdate: {
        __typename: 'Journey'
        id: string
        title: string
        description: string | null
        language: {
          __typename: 'Language'
          id: string
          bcp47: null
          iso3: null
          name: Array<{
            __typename: 'LanguageName'
            value: string
            primary: boolean
          }>
        }
      }
    }
  }
} => ({
  request: {
    query: TITLE_DESC_LANGUAGE_UPDATE,
    variables: {
      id: 'journey-id',
      input: {
        title,
        description,
        languageId
      }
    }
  },
  result: {
    data: {
      journeyUpdate: {
        __typename: 'Journey',
        id: 'journey-id',
        title,
        description,
        language: {
          __typename: 'Language',
          id: languageId,
          bcp47: null,
          iso3: null,
          name: [
            {
              __typename: 'LanguageName',
              value: languageId === '529' ? 'English' : 'Français',
              primary: true
            },
            {
              __typename: 'LanguageName',
              value: languageId === '529' ? 'English' : 'French',
              primary: false
            }
          ]
        }
      }
    }
  }
})
