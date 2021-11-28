import { ReactElement, useEffect } from 'react'
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
import { JourneyList } from '../../src/components/'
import { FirebaseHandler, firebaseClient } from '../../src/libs/firebaseClient'
import { useRouter } from 'next/router'
import { getAuth } from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'

interface JourneysListPageProps {
  journeys: Journey[]
}

function JourneyListPage({ journeys }: JourneysListPageProps): ReactElement {
  const { logOut } = FirebaseHandler()
  const router = useRouter()
  const auth = getAuth(firebaseClient)
  const [user] = useAuthState(auth)

  useEffect(() => {
    // check if user is logged in
    // if (user == null) {
    //   void router.push('/')
    // }
  }, [user, router])

  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
      {/* Next Steps Header */}
      <Container sx={{ my: 10 }}>
        <Typography variant={'h1'} sx={{ mb: 8 }}>
          Journeys
        </Typography>
        <JourneyList journeys={journeys} />
        <Button variant="contained" onClick={() => logOut()}>
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
