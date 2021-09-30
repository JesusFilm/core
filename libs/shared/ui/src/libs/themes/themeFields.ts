import { gql } from '@apollo/client'

export const THEME_FIELDS = gql`
  query GetJourneys {
    journeys {
      themeName
      themeMode
    }
  }
`
