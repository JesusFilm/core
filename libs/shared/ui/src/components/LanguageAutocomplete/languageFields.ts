import { gql } from '@apollo/client'

export const LANGUAGE_FIELDS = gql`
  fragment LanguageFields on Language {
    id
    name {
      value
      primary
    }
  }
`
