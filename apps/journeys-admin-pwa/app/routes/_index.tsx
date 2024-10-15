import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import { useOutletContext } from '@remix-run/react'
import { ReactElement, useEffect, useState } from 'react'
import { RxDatabase } from 'rxdb'

import { ThemeProvider } from '../components/ThemeProvider'

interface Context {
  rxDatabase: RxDatabase | null
}

export default function Index(): ReactElement {
  const { rxDatabase } = useOutletContext<Context>()

  const [journey, setJourney] = useState([])

  function transformJourney(journeys) {
    return journeys.map((doc) => {
      const { _meta, _deleted, _attachments, _rev, ...cleanDoc } = doc.toJSON()
      return cleanDoc
    })
  }

  useEffect(() => {
    const fetchJourneys = async (): Promise<void> => {
      if (rxDatabase?.journeys != null) {
        const doc = await rxDatabase?.journeys.find().exec()
        const journeys = transformJourney(doc)
        setJourney(journeys[0])
      }
    }
    void fetchJourneys()
  }, [rxDatabase])

  console.log('journey: ', journey)

  return (
    <ThemeProvider>
      <Container>
        <Typography variant="h1">Journeys Admin in Remix!</Typography>
        <Typography variant="h2">{journey.title}</Typography>
      </Container>
    </ThemeProvider>
  )
}
