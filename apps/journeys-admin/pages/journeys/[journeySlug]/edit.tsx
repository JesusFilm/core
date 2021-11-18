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
        <Typography variant={'h2'} sx={{ mb: 4 }}>
          Single Journey Page
        </Typography>
        <Typography variant={'h6'}>{journey.title}</Typography>
      </Box>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<SingleJourneyEditPageProps> =
  async (context) => {
    const { data } = await client.query<GetJourneyForEdit>({
      query: gql`
        query GetJourneyForEdit($id: ID!) {
          journey(id: $id, idType: slug) {
            id
            themeName
            themeMode
            title
            description
            blocks {
              id
              parentBlockId
              ... on CardBlock {
                backgroundColor
                coverBlockId
                themeMode
                themeName
                fullscreen
              }
              ... on StepBlock {
                locked
                nextBlockId
              }
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
