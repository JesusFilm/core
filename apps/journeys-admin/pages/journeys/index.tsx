import { ReactElement } from 'react'
import { Button, Container, Typography } from '@mui/material'
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
import { JourneyList } from '../../src/components/blocks'

interface JourneysListPageProps {
  journeys: Journey[]
}

function JourneyListPage({ journeys }: JourneysListPageProps): ReactElement {
  const { logOut } = useAuth()
  const router = useRouter()

  const handleLogout = async (): Promise<void> => {
    try {
      await logOut()
      void router.push('/')
    } catch {
      console.log('error with logging out')
    }
  }

  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
      {/* Next Steps Header */}
      <Container sx={{ my: 10 }}>
        <Typography variant={'h1'} sx={{ mb: 8 }}>
          Journeys
        </Typography>
        <JourneyList journeys={journeys} />
        <Button variant="contained" onClick={async () => await handleLogout()}>
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
            description
            slug
            themeName
            themeMode
            locale
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
