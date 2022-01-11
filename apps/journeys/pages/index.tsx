import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import { ThemeProvider } from '@core/shared/ui'
import Link from 'next/link'
import { GetStaticProps } from 'next'
import { gql } from '@apollo/client'
import client from '../src/libs/client'
import {
  GetJourneys,
  GetJourneys_journeys as Journey
} from '../__generated__/GetJourneys'
import { ThemeMode, ThemeName } from '../__generated__/globalTypes'

interface JourneysPageProps {
  journeys: Journey[]
}

function JourneysPage({ journeys }: JourneysPageProps): ReactElement {
  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
      <Container>
        {journeys.map(({ id, title, slug }) => (
          <Box key={id} my={2}>
            <Link href={`/${slug}`} passHref>
              <Button variant="contained" color="primary" fullWidth>
                {title}
              </Button>
            </Link>
          </Box>
        ))}
      </Container>
    </ThemeProvider>
  )
}

export const getStaticProps: GetStaticProps<JourneysPageProps> = async () => {
  const { data } = await client.query<GetJourneys>({
    query: gql`
      query GetJourneys {
        journeys(status: published) {
          id
          title
          slug
        }
      }
    `
  })

  if (data.journeys === null) {
    return {
      notFound: true
    }
  } else {
    return {
      props: {
        journeys: data.journeys
      },
      revalidate: 60
    }
  }
}

export default JourneysPage
