import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { useQuery, gql } from '@apollo/client'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { useRouter } from 'next/router'
import { GetStaticProps, GetStaticPaths } from 'next'
import { SSRConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'react-i18next'

import { PageWrapper } from '../../src/components/PageWrapper'
import {
  LanguageProvider,
  useLanguage
} from '../../src/libs/languageContext/LanguageContext'
import { Countries } from '../../src/components/Countries/Countries'
import { GetCountry } from '../../__generated__/GetCountry'
import { routeParser } from '../../src/libs/routeParser/routeParser'
import i18nConfig from '../../next-i18next.config'

export const GET_COUNTRY = gql`
  query GetCountry($id: ID!, $languageId: ID) {
    country(id: $id, idType: slug) {
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
        bcp47
        iso3
        name(languageId: $languageId, primary: true) {
          value
        }
      }
      population
      image
      latitude
      longitude
    }
  }
`

function CountryPage(): ReactElement {
  const languageContext = useLanguage()
  const { t } = useTranslation('apps-watch')
  const router = useRouter()
  const { slug } = router.query
  const { routes } = routeParser(slug)
  const { data } = useQuery<GetCountry>(GET_COUNTRY, {
    variables: {
      id: routes?.[routes.length - 1],
      languageId: languageContext?.id ?? '529'
    }
  })
  return (
    <LanguageProvider>
      <PageWrapper />
      {data?.country != null && (
        <Box>
          <Typography variant="h2">{data.country.name[0]?.value}</Typography>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption">
              {t('Part of {{country}}', {
                country: data.country.continent[0]?.value
              })}
            </Typography>
            <Typography variant="caption">
              {t('Population: {{population}}', {
                population: data.country.population.toLocaleString(
                  router.locale ?? router.defaultLocale
                )
              })}
            </Typography>
          </Stack>
          <Countries
            coordinates={[data.country.latitude, data.country.longitude]}
            zoom={5}
          />
          <Typography variant="h3">Available Languages</Typography>
          {data.country.languages
            .map((language) => language.name[0]?.value)
            .join(', ')}
        </Box>
      )}
    </LanguageProvider>
  )
}

export const getStaticProps: GetStaticProps<SSRConfig> = async (context) => {
  return {
    props: {
      ...(await serverSideTranslations(
        context.locale ?? 'en',
        ['apps-watch'],
        i18nConfig
      ))
    }
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  }
}

export default CountryPage
