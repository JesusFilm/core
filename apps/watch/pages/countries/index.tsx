import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { useQuery, gql } from '@apollo/client'
import Link from 'next/link'

import { PageWrapper } from '../../src/components/PageWrapper'
import {
  LanguageProvider,
  useLanguage
} from '../../src/libs/languageContext/LanguageContext'
import { GetCountries } from '../../__generated__/GetCountries'

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

function CountriesPage(): ReactElement {
  const languageContext = useLanguage()
  const { data } = useQuery<GetCountries>(GET_COUNTRIES, {
    variables: {
      languageId: languageContext?.id ?? '529'
    }
  })
  return (
    <LanguageProvider>
      <PageWrapper />
      <Box>
        {data?.countries.map((country, index) => (
          <div key={index}>
            <Link href={`/countries/${country.permalink[0]?.value}`}>
              {country.name[0]?.value}
            </Link>
          </div>
        ))}
      </Box>
    </LanguageProvider>
  )
}

export default CountriesPage
