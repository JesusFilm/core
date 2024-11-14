import { gql, useMutation } from '@apollo/client'
import { v4 as uuidv4 } from 'uuid'

import { useTeam } from '@core/journeys/ui/TeamProvider'

import {
  CreateJourney,
  CreateJourney_journeyCreate as Journey
} from '../../../__generated__/CreateJourney'
import {
  JourneyStatus,
  ThemeMode,
  ThemeName
} from '../../../__generated__/globalTypes'

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
      input: { id: $cardId, parentBlockId: $stepId, journeyId: $journeyId }
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

  const defaultJourneyValues = {
    title: 'Untitled Journey',
    description:
      'Use journey description for notes about the audience, topic, traffic source, etc. Only you and other editors can see it.',
    alt: 'two hot air balloons in the sky',
    headlineTypographyContent: 'The Journey Is On',
    bodyTypographyContent: '"Go, and lead the people on their way..."',
    captionTypographyContent: 'Deutoronomy 10:11'
  }

  return {
    createJourney: async (): Promise<Journey | undefined> => {
      try {
        const ids = {
          journeyId: uuidv4(),
          stepId: uuidv4(),
          cardId: uuidv4(),
          imageId: uuidv4()
        }

        const { data } = await createJourney({
          variables: {
            ...ids,
            ...defaultJourneyValues,
            teamId: activeTeam?.id
          },
          optimisticResponse: {
            journeyCreate: {
              __typename: 'Journey',
              id: ids.journeyId,
              title: defaultJourneyValues.title,
              description: defaultJourneyValues.description,
              createdAt: new Date().toISOString(),
              publishedAt: null,
              slug: 'untitled-journey',
              themeName: ThemeName.base,
              themeMode: ThemeMode.dark,
              language: {
                __typename: 'Language',
                id: '529',
                name: [
                  {
                    __typename: 'LanguageName',
                    value: 'English',
                    primary: true
                  }
                ]
              },
              status: JourneyStatus.draft,
              userJourneys: []
            },
            stepBlockCreate: {
              __typename: 'StepBlock',
              id: ids.stepId
            },
            cardBlockCreate: {
              __typename: 'CardBlock',
              id: ids.cardId
            },
            imageBlockCreate: {
              __typename: 'ImageBlock',
              id: ids.imageId
            },
            headlineTypographyBlockCreate: {
              __typename: 'TypographyBlock',
              id: uuidv4()
            },
            bodyTypographyBlockCreate: {
              __typename: 'TypographyBlock',
              id: uuidv4()
            },
            captionTypographyBlockCreate: {
              __typename: 'TypographyBlock',
              id: uuidv4()
            }
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
