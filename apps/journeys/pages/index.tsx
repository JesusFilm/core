import { ReactElement } from 'react'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import { gql } from '@apollo/client'
import { ThemeProvider } from '@core/shared/ui'
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

export const getServerSideProps: GetServerSideProps<JourneysPageProps> =
  async () => {
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
        }
      }
    }
  }

export default JourneysPage
