import { gql } from '@apollo/client'

export const GET_COUNTRIES = gql`
  query GetCountries($languageId: ID) {
    countries {
      id
      name(languageId: $languageId, primary: true) {
        value
      }
      slug(languageId: $languageId, primary: true) {
        value
      }
      continent(languageId: $languageId, primary: true) {
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
