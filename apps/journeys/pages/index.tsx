import { ReactElement } from 'react'
import { Box, Button, Container, ThemeProvider } from '@mui/material'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import client from '../src/libs/client'
import { gql } from '@apollo/client'
import {
  GetJourneys,
  GetJourneys_journeys as Journey
} from '../__generated__/GetJourneys'
import { themes } from '@core/shared/ui'

interface JourneysPageProps {
  journeys: Journey[]
}

function JourneysPage({ journeys }: JourneysPageProps): ReactElement {
  return (
    <ThemeProvider theme={themes.light}>
      <Container>
        {journeys.map(({ id, title }) => (
          <Box key={id} my={2}>
            <Link href={`/${id}`} passHref>
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
        query GetJourneys {
          journeys {
            id
            title
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

export default JourneysPage
