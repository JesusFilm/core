import { ReactElement, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import AddIcon from '@mui/icons-material/Add'
import { gql, useMutation } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'
import { sortBy } from 'lodash'
import { GetJourneys_journeys as Journey } from '../../../__generated__/GetJourneys'
import { JourneyCreate } from '../../../__generated__/JourneyCreate'
import { AddJourneyFab } from './AddJourneyFab'
import { JourneySort, SortOrder } from './JourneySort'
import { JourneyCard } from './JourneyCard'

// remove slug once Tatai finish his api changes
export const JOURNEY_CREATE = gql`
  mutation JourneyCreate(
    $journeyId: ID!
    $title: String!
    $description: String!
    $stepId: ID!
    $cardId: ID!
    $imageId: ID!
    $alt: String!
    $headlineTypography: String!
    $bodyTypography: String!
    $captionTypography: String!
  ) {
    journeyCreate(
      input: {
        id: $journeyId
        title: $title
        description: $description
        themeMode: dark
      }
    ) {
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
        id
        user {
          id
          firstName
          lastName
          imageUrl
        }
      }
    }
    stepBlockCreate(input: { id: $stepId, journeyId: $journeyId }) {
      id
    }
    cardBlockCreate(
      input: {
        id: $cardId
        parentBlockId: $stepId
        journeyId: $journeyId
        coverBlockId: $imageId
      }
    ) {
      id
    }
    imageBlockCreate(
      input: {
        id: $imageId
        parentBlockId: $cardId
        journeyId: $journeyId
        src: "https://images.unsplash.com/photo-1524414287096-c7fb74ab3ba0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2348&q=80"
        alt: $alt
        blurhash: "LgFiG+59PC=s|AE3XT$gnjngs7Ne"
      }
    ) {
      id
    }
    headlineTypography: typographyBlockCreate(
      input: {
        journeyId: $journeyId
        parentBlockId: $cardId
        content: $headlineTypography
        variant: h3
      }
    ) {
      id
    }
    bodyTypography: typographyBlockCreate(
      input: {
        journeyId: $journeyId
        parentBlockId: $cardId
        content: $bodyTypography
        variant: body1
      }
    ) {
      id
    }
    captionTypography: typographyBlockCreate(
      input: {
        journeyId: $journeyId
        parentBlockId: $cardId
        content: $captionTypography
        variant: caption
      }
    ) {
      id
    }
  }
`

export interface JourneysListProps {
  journeys: Journey[]
}

export function JourneyList({ journeys }: JourneysListProps): ReactElement {
  const [sortOrder, setSortOrder] = useState<SortOrder>()
  const [journeyCreate] = useMutation<JourneyCreate>(JOURNEY_CREATE)

  const handleClick = async (): Promise<void> => {
    const journeyId = uuidv4()
    const stepId = uuidv4()
    const cardId = uuidv4()
    const imageId = uuidv4()

    await journeyCreate({
      variables: {
        journeyId,
        title: 'Untitled Journey',
        description:
          'Use journey description for notes about the audience, topic, traffic source, etc. Only you and other editors can see it.',
        stepId,
        cardId,
        imageId,
        alt: 'two hot air balloons in the sky',
        headlineTypography: 'The Journey Is On',
        bodyTypography: '"Go, and lead the people on their way..."',
        captionTypography: 'Deutoronomy 10:11'
      },
      update(cache, { data }) {
        if (data?.journeyCreate != null) {
          cache.modify({
            fields: {
              adminJourneys(existingAdminJourneyRefs = []) {
                const newJourneyRef = cache.writeFragment({
                  data: data.journeyCreate,
                  fragment: gql`
                    fragment NewJourney on Journey {
                      id
                    }
                  `
                })
                return [...existingAdminJourneyRefs, newJourneyRef]
              }
            }
          })
        }
      }
    })
  }

  const sortedJourneys =
    sortOrder === SortOrder.TITLE
      ? sortBy(journeys, 'title')
      : sortBy(journeys, ({ createdAt }) =>
        new Date(createdAt).getTime()
      ).reverse()

  return (
    <Container sx={{ px: { xs: 0, sm: 8 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
        sx={{
          mx: { xs: 6, sm: 0 },
          mt: { xs: 5, sm: 10 },
          mb: { xs: 4, sm: 5 }
        }}
      >
        <Typography variant="h3">All Journeys</Typography>
        <Box>
          <JourneySort sortOrder={sortOrder} onChange={setSortOrder} />
        </Box>
      </Stack>
      <Box sx={{ mb: { xs: 4, sm: 5 } }} data-testid="journey-list">
        {sortedJourneys.map((journey) => (
          <>
            <JourneyCard key={journey.id} journey={journey} />
            <AddJourneyFab onClick={handleClick} />
          </>
        ))}
        {sortedJourneys.length === 0 && (
          <Card
            variant="outlined"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              pt: 20,
              pb: 16,
              borderRadius: { xs: 0, sm: 3 }
            }}
          >
            <Typography variant="subtitle1" align="center" gutterBottom>
              No journeys to display.
            </Typography>
            <Typography variant="caption" align="center" gutterBottom>
              Create a journey, then find it here.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              size="medium"
              onClick={handleClick}
              sx={{
                mt: 3,
                alignSelf: 'center'
              }}
            >
              Create a Journey
            </Button>
          </Card>
        )}
      </Box>
    </Container>
  )
}
