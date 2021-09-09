import { ReactElement } from 'react'
import { Box, Button, Container } from '@mui/material'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import client from '../src/libs/client'
import { gql } from '@apollo/client'
import { GetJourneys, GetJourneys_journeys as Journey } from '../__generated__/GetJourneys'

interface JourneysPageProps {
  journeys: Journey[]
}

function JourneysPage ({ journeys }: JourneysPageProps): ReactElement {
  return (
    <Container>
      {journeys.map(({ id, title }) => (
        <Box key={id} my={2}>
          <Link href={`/${id}`} passHref>
            <Button variant="contained" color="primary" fullWidth>{title}</Button>
          </Link>
        </Box>
      ))}
    </Container>
  )
}

export const getServerSideProps: GetServerSideProps<JourneysPageProps> = async () => {
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
