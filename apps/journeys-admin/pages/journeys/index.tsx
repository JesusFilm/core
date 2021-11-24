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
import { useRouter } from 'next/router'
import { JourneyList } from '../../src/components/blocks'
import { getAuth, signOut } from 'firebase/auth'
import { firebaseClient } from '../../src/libs/firebaseClient'

interface JourneysListPageProps {
  journeys: Journey[]
}

function JourneyListPage({ journeys }: JourneysListPageProps): ReactElement {
  const router = useRouter()
  const auth = getAuth(firebaseClient)

  const handleLogout = async (): Promise<void> => {
    void signOut(auth).then(() => {
      // sign out user and clear cache
      void router.push('/')
    }).catch((error) => {
      console.log(error.message)
    })
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
