import { Meta, Story } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { ReactElement } from 'react'
import { SnackbarProvider } from 'notistack'
import {
  JourneyProvider,
  journeyUiConfig,
  simpleComponentConfig,
  StoryCard,
  TreeBlock
} from '../..'
import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { IconName } from '../../../__generated__/globalTypes'
import { SignUp, SIGN_UP_SUBMISSION_EVENT_CREATE } from './SignUp'
import { SignUpFields } from './__generated__/SignUpFields'

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

const signUpProps: TreeBlock<SignUpFields> = {
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

const Template: Story<TreeBlock<SignUpFields>> = ({
  ...props
}): ReactElement => (
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
    <SnackbarProvider>
      <StoryCard>
        <SignUp {...signUpProps} {...props} uuid={() => 'uuid'} />
      </StoryCard>
    </SnackbarProvider>
  </MockedProvider>
)

export const Default = Template.bind({})

export const CustomButton = Template.bind({})
CustomButton.args = {
  submitIconId: 'icon',
  submitLabel: 'Unlock Now',
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

// export const SubmitError = Template.bind({})
// SubmitError.args = {
//   label: 'Label',
//   description: 'Description'
// }

const LoadingTemplate: Story<TreeBlock<SignUpFields>> = (): ReactElement => (
  <ApolloLoadingProvider>
    <JourneyProvider>
      <SnackbarProvider>
        <StoryCard>
          <SignUp {...signUpProps} uuid={() => 'uuid'} />
        </StoryCard>
      </SnackbarProvider>
    </JourneyProvider>
  </ApolloLoadingProvider>
)

export const Loading = LoadingTemplate.bind({})

export default Demo as Meta
