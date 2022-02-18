import { Story, Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { simpleComponentConfig } from '../../../libs/storybook'
import { JOURNEY_CREATE } from './AddJourneyButton'
import { AddJourneyButton } from '.'

const AddJourneyButtonStory = {
  ...simpleComponentConfig,
  component: AddJourneyButton,
  title: 'Journeys-Admin/JourneyList/AddJourneyButton'
}

const Template: Story = ({ variant }) => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: JOURNEY_CREATE,
          variables: {
            journeyId: 'journeyId',
            title: 'Untitled Journey',
            description:
              'Use journey description for notes about the audience, topic, traffic source, etc. Only you and other editors can see it.',
            stepId: 'stepId',
            cardId: 'cardId',
            imageId: 'imageId',
            alt: 'two hot air balloons in the sky',
            headlineTypography: 'The Journey Is On',
            bodyTypography: '"Go, and lead the people on their way..."',
            captionTypography: 'Deutoronomy 10:11'
          }
        },
        result: {
          data: {
            journeyCreate: {
              createdAt: '2022-02-17T21:47:32.004Z',
              description:
                'Use journey description for notes about the audience, topic, traffic source, etc. Only you and other editors can see it.',
              id: 'journeyId',
              locale: 'en-US',
              publishedAt: null,
              slug: 'untitled-journey-journeyId',
              status: 'draft',
              themeMode: 'dark',
              themeName: 'base',
              title: 'Untitled Journey',
              __typename: 'Journey',
              userJourneys: [
                {
                  __typename: 'UserJourney',
                  id: 'user-journey-id',
                  user: {
                    __typename: 'User',
                    id: 'user-id1',
                    firstName: 'Admin',
                    lastName: 'One',
                    imageUrl: 'https://bit.ly/3Gth4Yf'
                  }
                }
              ]
            },
            stepBlockCreate: {
              id: 'stepId',
              __typename: 'StepBlock'
            },
            cardBlockCreate: {
              id: 'cardId',
              __typename: 'CardBlock'
            },
            imageBlockCreate: {
              id: 'imageId',
              __typename: 'ImageBlock'
            },
            headlineTypography: {
              id: 'headlineTypographyId',
              __typename: 'TypographyBlock'
            },
            bodyTypography: {
              id: 'bodyTypographyId',
              __typename: 'TypographyBlock'
            },
            captionTypography: {
              id: 'captionTypographyId',
              __typename: 'TypographyBlock'
            }
          }
        }
      }
    ]}
  >
    <AddJourneyButton variant={variant} />
  </MockedProvider>
)

export const Fab = Template.bind({})
Fab.args = {
  variant: 'fab'
}

export const Button = Template.bind({})
Button.args = {
  variant: 'button'
}

export default AddJourneyButtonStory as Meta
