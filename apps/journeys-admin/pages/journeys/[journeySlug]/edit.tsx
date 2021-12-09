import { ReactElement } from 'react'
import { GetServerSideProps } from 'next'
import { gql } from '@apollo/client'
import Head from 'next/head'
import client from '../../../src/libs/client'
import {
  GetJourneyForEdit,
  GetJourneyForEdit_journey as Journey
} from '../../../__generated__/GetJourneyForEdit'
import { Typography, Box } from '@mui/material'
import { BLOCK_FIELDS } from '@core/journeys/ui'

interface SingleJourneyEditPageProps {
  journey: Journey
}

function SingleJourneyEditPage({
  journey
}: SingleJourneyEditPageProps): ReactElement {
  return (
    <>
      <Head>
        <title>{journey.title}</title>
      </Head>
      <Box sx={{ m: 10 }}>
        <Typography variant={'h2'}>Edit {journey.title}</Typography>
      </Box>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<SingleJourneyEditPageProps> =
  async (context) => {
    const { data } = await client.query<GetJourneyForEdit>({
      query: gql`
        ${BLOCK_FIELDS}
        query GetJourneyForEdit($id: ID!) {
          journey(id: $id, idType: slug) {
            id
            themeName
            themeMode
            title
            description
            blocks {
              ...BlockFields
            }
          }
        }
      `,
      variables: {
        id: context.query.journeySlug
      }
    })

    if (data.journey === null) {
      return {
        notFound: true
      }
    } else {
      return {
        props: {
          journey: data.journey
        }
      }
    }
  }

export default SingleJourneyEditPage
