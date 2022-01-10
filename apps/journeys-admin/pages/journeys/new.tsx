import { ReactElement, useEffect, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import Head from 'next/head'
import { Typography, Box, Button, FormControl, Input } from '@mui/material'
import { useRouter } from 'next/router'
import { v4 as uuidv4 } from 'uuid'
import { useFirebase } from '../../src/libs/firebaseClient'
import { JourneyCreate } from '../../__generated__/JourneyCreate'

export const NEW_JOURNEY = gql`
  mutation JourneyCreate($input: JourneyCreateInput!) {
    journeyCreate(input: $input) {
      id
      title
      slug
    }
  }
`

function JourneyNew(): ReactElement {
  const { user, loading } = useFirebase()
  const router = useRouter()
  const [journeyCreate] = useMutation<JourneyCreate>(NEW_JOURNEY)
  const UUID = uuidv4()
  const [title, setTitle] = useState('')

  const handleClick = (id: string, title: string, slug: string): void => {
    void journeyCreate({
      variables: {
        input: {
          id,
          title,
          slug
        }
      }
    })

    void router.push(`/journeys/${slug}`)
  }

  useEffect(() => {
    // prevent user from accessing this page if they are not logged in
    if (loading === false && user == null) {
      void router.push('/')
    }
  }, [user, router, loading])

  return (
    <>
      <Head>
        <title>New Journey</title>
        <meta property="og:title" content="New Journey" />
        <meta name="description" content="New Journey" />
      </Head>
      <Box sx={{ m: 10 }}>
        <Typography variant={'h6'}>Create your Journey</Typography>
        <form>
          <FormControl>
            <Input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </FormControl>
          <br />
          <br />
          <Button
            variant={'contained'}
            onClick={() => handleClick(UUID, title, UUID)}
          >
            Create
          </Button>
        </form>
      </Box>
    </>
  )
}

export default JourneyNew
