import { gql } from '@apollo/client'

export const GET_COUNTRIES = gql`
  query GetCountries($languageId: ID) {
    countries {
      id
      name(languageId: $languageId, fallback: true) {
        value
      }
      slug(languageId: $languageId, fallback: true) {
        value
      }
      continent(languageId: $languageId, fallback: true) {
        value
      }
      languages {
        id
      }
      population
      image
      latitude
      longitude
    }
  }
`
