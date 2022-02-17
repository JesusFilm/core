import { ReactElement } from 'react'
import Fab from '@mui/material/Fab'
import AddRounded from '@mui/icons-material/AddRounded'
import { gql, useMutation } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'
import {
  CARD_FIELDS,
  IMAGE_FIELDS,
  STEP_FIELDS,
  TYPOGRAPHY_FIELDS
} from '@core/journeys/ui'
import { JourneyCreate } from '../../../__generated__/JourneyCreate'

// remove slug once Tatai finish his api changes
export const JOURNEY_CREATE = gql`
  ${STEP_FIELDS}
  ${CARD_FIELDS}
  ${TYPOGRAPHY_FIELDS}
  ${IMAGE_FIELDS}
  mutation JourneyCreate(
    $journeyId: ID!
    $title: String!
    $slug: String!
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
        slug: $slug
        description: $description
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
      ...StepFields
    }
    cardBlockCreate(
      input: {
        id: $cardId
        parentBlockId: $stepId
        journeyId: $journeyId
        coverBlockId: $imageId
      }
    ) {
      ...CardFields
    }
    imageBlockCreate(
      input: {
        id: $imageId
        parentBlockId: $cardId
        journeyId: $journeyId
        src: "https://images.unsplash.com/photo-1524414287096-c7fb74ab3ba0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2348&q=80"
        alt: $alt
      }
    ) {
      ...ImageFields
    }
    headlineTypography: typographyBlockCreate(
      input: {
        journeyId: $journeyId
        parentBlockId: $cardId
        content: $headlineTypography
        variant: h3
      }
    ) {
      ...TypographyFields
    }
    bodyTypograpphy: typographyBlockCreate(
      input: {
        journeyId: $journeyId
        parentBlockId: $cardId
        content: $bodyTypography
        variant: body1
      }
    ) {
      ...TypographyFields
    }
    captionTypography: typographyBlockCreate(
      input: {
        journeyId: $journeyId
        parentBlockId: $cardId
        content: $captionTypography
        variant: caption
      }
    ) {
      ...TypographyFields
    }
  }
`

export function AddJourneyFab(): ReactElement {
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
        slug: `untitled-journey-${journeyId}`,
        description:
          'Use journey description for notes about the audience, topic, traffic source, etc. Only you and other editors can see it.',
        stepId,
        fullscreen: false,
        locked: false,
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
                      journeyId
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

  return (
    <Fab
      variant="extended"
      size="large"
      color="primary"
      onClick={handleClick}
      sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1 }}
    >
      <AddRounded sx={{ mr: 3 }} />
      Add
    </Fab>
  )
}
