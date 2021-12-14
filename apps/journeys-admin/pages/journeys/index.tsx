import { ReactElement, useEffect, useState } from 'react'
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
import { UseFirebase } from '../../src/libs/firebaseClient'
import { useRouter } from 'next/router'
import Link from 'next/link'

interface JourneysListPageProps {
  journeys: Journey[]
}

function JourneyListPage({ journeys }: JourneysListPageProps): ReactElement {
  const { logOut, user, loading } = UseFirebase()
  const router = useRouter()
  const [journeysToShow, setJourneysToShow] = useState<Journey[]>([])

  useEffect(() => {
    // prevent user from accessing this page if they are not logged in
    if (loading === false && user == null) {
      void router.push('/')
    }

    // get all journeys user has access to
    const accessibleJourneys = journeys.filter((journey) => {
      return journey.usersJourneys?.find((userJourney) => {
        return userJourney?.userId === user?.uid
      })
    })

    setJourneysToShow(accessibleJourneys)
  }, [user, router, loading, journeys])

  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.light}>
      {/* Next Steps Header */}
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
            description
            slug
            themeName
            themeMode
            locale
            usersJourneys {
              userId
              journeyId
            }
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
