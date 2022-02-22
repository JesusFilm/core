import { ReactElement } from 'react'
import Fab from '@mui/material/Fab'
import AddRounded from '@mui/icons-material/AddRounded'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import { gql, useMutation } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'
import { useRouter } from 'next/router'
import { JourneyCreate } from '../../../../__generated__/JourneyCreate'

export const JOURNEY_CREATE = gql`
  mutation JourneyCreate(
    $journeyId: ID!
    $title: String!
    $description: String!
    $stepId: ID!
    $cardId: ID!
    $imageId: ID!
    $alt: String!
    $headlineTypographyContent: String!
    $bodyTypographyContent: String!
    $captionTypographyContent: String!
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
        src: "https://images.unsplash.com/photo-1524414287096-c7fb74ab3ba0?w=854&q=50"
        alt: $alt
        blurhash: "LgFiG+59PC=s|AE3XT$gnjngs7Ne"
      }
    ) {
      id
    }
    headlineTypographyBlockCreate: typographyBlockCreate(
      input: {
        journeyId: $journeyId
        parentBlockId: $cardId
        content: $headlineTypographyContent
        variant: h3
      }
    ) {
      id
    }
    bodyTypographyBlockCreate: typographyBlockCreate(
      input: {
        journeyId: $journeyId
        parentBlockId: $cardId
        content: $bodyTypographyContent
        variant: body1
      }
    ) {
      id
    }
    captionTypographyBlockCreate: typographyBlockCreate(
      input: {
        journeyId: $journeyId
        parentBlockId: $cardId
        content: $captionTypographyContent
        variant: caption
      }
    ) {
      id
    }
  }
`

interface AddJourneyFabProps {
  variant: 'button' | 'fab'
}

export function AddJourneyButton({
  variant
}: AddJourneyFabProps): ReactElement {
  const [journeyCreate] = useMutation<JourneyCreate>(JOURNEY_CREATE)
  const router = useRouter()

  const handleClick = async (): Promise<void> => {
    const journeyId = uuidv4()
    const stepId = uuidv4()
    const cardId = uuidv4()
    const imageId = uuidv4()

    const { data } = await journeyCreate({
      variables: {
        journeyId,
        title: 'Untitled Journey',
        description:
          'Use journey description for notes about the audience, topic, traffic source, etc. Only you and other editors can see it.',
        stepId,
        cardId,
        imageId,
        alt: 'two hot air balloons in the sky',
        headlineTypographyContent: 'The Journey Is On',
        bodyTypographyContent: '"Go, and lead the people on their way..."',
        captionTypographyContent: 'Deutoronomy 10:11'
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
    if (data?.journeyCreate != null) {
      void router.push(`/journeys/${data.journeyCreate.slug}/edit`)
    }
  }

  if (variant === 'button')
    return (
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
    )

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
