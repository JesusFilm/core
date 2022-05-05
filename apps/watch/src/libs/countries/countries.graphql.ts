import { gql } from '@apollo/client'

export const GET_COUNTRIES = gql`
  query GetCountries($languageId: ID) {
    countries {
      id
      name(languageId: $languageId) {
        primary
        value
      }
      permalink(languageId: $languageId) {
        primary
        value
      }
      continent(languageId: $languageId) {
        primary
        value
      }
      population
      image
      latitude
      longitude
    }
  }
`
