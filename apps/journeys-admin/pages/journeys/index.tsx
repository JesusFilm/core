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
import { useAuth } from '../../src/libs/firebaseClient/'
import { useRouter } from 'next/router'

interface JourneysListPageProps {
  journeys: Journey[]
}

function JourneyListPage({ journeys }: JourneysListPageProps): ReactElement {
  const { logOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logOut()
      void router.push('/')
    } catch {
      console.log('error with logging out')
    }
  }

  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
      <Container sx={{ my: 10 }}>
        <Typography variant={'h1'} sx={{ mb: 8 }}>
          Journeys List
        </Typography>
        {journeys.map(({ id, title, slug }) => (
          <Box key={id} my={2}>
            <Link href={`/journeys/${slug}`} passHref>
              <Button variant="contained" fullWidth>
                {title}
              </Button>
            </Link>
          </Box>
        ))}
        <Button variant="contained" onClick={() => handleLogout()}>
          SignOut
        </Button>
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
