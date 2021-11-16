import { ReactElement } from 'react'
import { Box, Button, Container, Typography } from '@mui/material'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import client from '../../src/libs/client'
import { gql } from '@apollo/client'
import { ThemeProvider } from '@core/shared/ui'
import { ThemeMode, ThemeName } from '../../__generated__/globalTypes'
import {
  GetJourneys,
  GetJourneys_journeys as Journey
} from '../../__generated__/GetJourneys'

interface JourneysListPageProps {
  journeys: Journey[]
}

function JourneyListPage({ journeys }: JourneysListPageProps): ReactElement {
  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
      <Container>
        <Typography variant={'h1'}>Journeys List</Typography>
        {journeys.map(({ id, title, slug }) => (
          <Box key={id} my={2}>
            <Link href={`/journeys/${slug}`} passHref>
              <Button variant="contained" fullWidth>
                {title}
              </Button>
            </Link>
          </Box>
        ))}
      </Container>
    </ThemeProvider>
  )
}

export const getServerSideProps: GetServerSideProps<JourneysListPageProps> =
  async () => {
    const { data } = await client.query<GetJourneys>({
      query: gql`
        query GetJourneys {
          journeys {
            id
            title
            slug
            themeName
            themeMode
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
        }
      }
    }
  }

export default JourneyListPage
