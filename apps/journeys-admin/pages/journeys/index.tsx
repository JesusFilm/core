import { ReactElement, useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { GetServerSideProps } from 'next'
import { gql } from '@apollo/client'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ThemeProvider } from '@core/shared/ui'
import client from '../../src/libs/client'
import {
  GetJourneys,
  GetJourneys_journeys as Journey
} from '../../__generated__/GetJourneys'
import { JourneyList } from '../../src/components'
import { useFirebase } from '../../src/libs/firebaseClient'
import { JourneysAppBar } from '../../src/components/JourneysAppBar'
import { ThemeMode, ThemeName } from '../../__generated__/globalTypes'

interface JourneysListPageProps {
  journeys: Journey[]
}

function JourneyListPage({ journeys }: JourneysListPageProps): ReactElement {
  const { logOut, user, loading } = useFirebase()
  const router = useRouter()
  const [journeysToShow, setJourneysToShow] = useState<Journey[]>([])

  useEffect(() => {
    // prevent user from accessing this page if they are not logged in
    if (loading === false && user == null) {
      void router.push('/')
    }

    // get all journeys user has access to
    const accessibleJourneys = journeys.filter((journey) => {
      return journey.userJourneys?.find((userJourney) => {
        return userJourney?.userId === user?.uid
      })
    })

    setJourneysToShow(accessibleJourneys)
  }, [user, router, loading, journeys])

  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
      <JourneysAppBar variant={'list'} />
      <Container sx={{ my: 10 }}>
        <Typography variant={'h1'} sx={{ mb: 8 }}>
          Journeys
        </Typography>
        <JourneyList journeys={journeysToShow} />
        <Button variant="contained" onClick={() => logOut()}>
          Sign Out
        </Button>
        <Link href={`/journeys/new`} passHref>
          <Button variant="contained" fullWidth>
            New Journey
          </Button>
        </Link>
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
            createdAt
            publishedAt
            description
            slug
            themeName
            themeMode
            locale
            status
            userJourneys {
              userId
              journeyId
            }
          }
        }
      `
    })

    if (data.journeys === null) {
      return {
        props: {
          journeys: []
        }
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
