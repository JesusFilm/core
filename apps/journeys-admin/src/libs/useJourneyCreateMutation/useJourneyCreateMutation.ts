import { gql, useMutation } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { useTeam } from '@core/journeys/ui/TeamProvider'

import {
  CreateJourney,
  CreateJourney_journeyCreate as Journey
} from '../../../__generated__/CreateJourney'

export const CREATE_JOURNEY = gql`
  mutation CreateJourney(
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
    $teamId: ID!
  ) {
    journeyCreate(
      input: {
        id: $journeyId
        title: $title
        description: $description
        languageId: "529"
        themeMode: dark
      }
      teamId: $teamId
    ) {
      id
      title
      createdAt
      publishedAt
      description
      slug
      themeName
      themeMode
      language {
        id
        name(primary: true) {
          value
          primary
        }
      }
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
        themeMode: dark
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
        isCover: true
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

export function useJourneyCreateMutation(): {
  createJourney: () => Promise<Journey | undefined>
  loading: boolean
} {
  const [createJourney, { loading }] =
    useMutation<CreateJourney>(CREATE_JOURNEY)
  const { activeTeam } = useTeam()

  return {
    createJourney: async (): Promise<Journey | undefined> => {
      try {
        const journeyId = uuidv4()
        const stepId = uuidv4()
        const cardId = uuidv4()
        const imageId = uuidv4()
        const { data } = await createJourney({
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
            captionTypographyContent: 'Deutoronomy 10:11',
            teamId: activeTeam?.id
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
        return data?.journeyCreate
      } catch (e) {
        return undefined
      }
    },
    loading
  }
}
