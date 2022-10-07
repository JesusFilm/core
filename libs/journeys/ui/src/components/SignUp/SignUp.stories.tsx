import { Meta, ComponentStory } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { screen, userEvent } from '@storybook/testing-library'
import { ReactElement } from 'react'
import { SnackbarProvider } from 'notistack'
import { journeyUiConfig } from '../../libs/journeyUiConfig'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { StoryCard } from '../StoryCard'
import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { IconName, TypographyVariant } from '../../../__generated__/globalTypes'
import { Typography } from '../Typography'
import { SignUp, SIGN_UP_SUBMISSION_EVENT_CREATE } from './SignUp'

const Demo = {
  ...journeyUiConfig,
  ...simpleComponentConfig,
  component: SignUp,
  title: 'Journeys-Ui/SignUp',
  parameters: {
    docs: {
      description: {
        component:
          'For the SignUp Loading story - to test the loading state of the component. Fill out the form and click submit to see the loading state.'
      }
    }
  }
}

const typographyProps: Parameters<typeof Typography>[0] = {
  __typename: 'TypographyBlock',
  id: 'id',
  parentOrder: 0,
  parentBlockId: 'card',
  align: null,
  color: null,
  variant: TypographyVariant.h3,
  content: 'Some block above',
  children: []
}

const signUpProps: Parameters<typeof SignUp>[0] = {
  id: 'signUpBlockId1',
  __typename: 'SignUpBlock',
  parentBlockId: null,
  parentOrder: 0,
  submitIconId: null,
  submitLabel: null,
  action: {
    __typename: 'NavigateToBlockAction',
    parentBlockId: 'signUpBlockId1',
    gtmEventName: 'gtmEventName',
    blockId: 'step2.id'
  },
  children: []
}

const Template: ComponentStory<typeof SignUp> = ({ ...args }): ReactElement => (
  <MockedProvider
    mocks={[
      {
        request: {
          query: SIGN_UP_SUBMISSION_EVENT_CREATE,
          variables: {
            input: {
              id: 'uuid',
              blockId: 'signUpBlockId1',
              name: 'Anon',
              email: '123abc@gmail.com'
            }
          }
        },
        result: {
          data: {
            signUpSubmissionEventCreate: {
              id: 'uuid',
              blockId: 'signUpBlockId1',
              name: 'Anon',
              email: '123abc@gmail.com'
            }
          }
        }
      }
    ]}
  >
    <JourneyProvider>
      <SnackbarProvider>
        <StoryCard>
          <Typography {...typographyProps} />
          <SignUp {...args} uuid={() => 'uuid'} />
          <Typography
            {...typographyProps}
            content="Some block below"
            variant={TypographyVariant.body1}
          />
        </StoryCard>
      </SnackbarProvider>
    </JourneyProvider>
  </MockedProvider>
)

export const Default = Template.bind({})
Default.args = { ...signUpProps }

export const Complete = Template.bind({})
Complete.args = {
  ...signUpProps,
  submitIconId: 'icon',
  submitLabel: 'Custom label',
  children: [
    {
      id: 'icon',
      __typename: 'IconBlock',
      parentBlockId: 'parent',
      parentOrder: 0,
      iconName: IconName.LockOpenRounded,
      iconSize: null,
      iconColor: null,
      children: []
    }
  ]
}

export const SubmitError = Template.bind({})
SubmitError.args = { ...signUpProps }
SubmitError.play = () => {
  const submit = screen.getAllByRole('button')[0]
  const fields = screen.getAllByRole('textbox')

  userEvent.type(fields[0], 'Name')
  userEvent.type(fields[1], 'name@domain.com')
  userEvent.click(submit)
}

const LoadingTemplate: ComponentStory<typeof SignUp> = ({
  ...args
}): ReactElement => (
  <ApolloLoadingProvider>
    <JourneyProvider>
      <SnackbarProvider>
        <StoryCard>
          <SignUp {...args} uuid={() => 'uuid'} />
        </StoryCard>
      </SnackbarProvider>
    </JourneyProvider>
  </ApolloLoadingProvider>
)

export const Loading = LoadingTemplate.bind({})
Loading.args = { ...signUpProps }
Loading.play = () => {
  const submitButtons = screen.getAllByRole('button')
  const fields = screen.getAllByRole('textbox')

  userEvent.type(fields[0], 'Name')
  userEvent.type(fields[1], 'name@domain.com')
  userEvent.type(fields[2], 'Name')
  userEvent.type(fields[3], 'name@domain.com')
  submitButtons.forEach((button) => {
    userEvent.click(button)
  })
}

export default Demo as Meta
