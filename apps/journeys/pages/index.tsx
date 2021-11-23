import { ReactElement } from 'react'
import { Box, Button, Container } from '@mui/material'
import { ThemeProvider } from '@core/shared/ui'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import client from '../src/libs/client'
import { gql } from '@apollo/client'
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

export const getServerSideProps: GetServerSideProps<JourneysPageProps> =
  async () => {
    const { data } = await client.query<GetJourneys>({
      query: gql`
        query GetJourneys($status: JourneyStatus) {
          journeys(status: $status) {
            id
            title
            slug
          }
        }
      `,
      variables: {
        status: 'published'
      }
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

export default JourneysPage
