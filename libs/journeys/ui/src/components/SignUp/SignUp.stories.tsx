import { Meta, Story } from '@storybook/react'
import {
  journeyUiConfig,
  simpleComponentConfig,
  StoryCard,
  TreeBlock
} from '../..'
import { SignUp, SIGN_UP_RESPONSE_CREATE } from './SignUp'
import { MockedProvider } from '@apollo/client/testing'
import { ReactElement } from 'react'
import { IconName } from '../../../__generated__/globalTypes'
import {
  SignUpFields,
  SignUpFields_submitIcon
} from './__generated__/SignUpFields'

const Demo = {
  ...journeyUiConfig,
  ...simpleComponentConfig,
  component: SignUp,
  title: 'Journeys/Blocks/SignUp'
}

const icon: SignUpFields_submitIcon = {
  __typename: 'Icon',
  name: IconName.LockOpenRounded,
  size: null,
  color: null
}

const signUpProps: TreeBlock<SignUpFields> = {
  id: 'signUpBlockId1',
  __typename: 'SignUpBlock',
  parentBlockId: null,
  submitIcon: null,
  submitLabel: null,
  action: {
    __typename: 'NavigateToBlockAction',
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
          query: SIGN_UP_RESPONSE_CREATE,
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
            signUpResponseCreate: {
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
    <StoryCard>
      <SignUp {...signUpProps} {...props} uuid={() => 'uuid'} />
    </StoryCard>
  </MockedProvider>
)

export const Default = Template.bind({})

export const CustomButton = Template.bind({})
CustomButton.args = {
  submitIcon: icon,
  submitLabel: 'Unlock Now'
}

// export const SubmitError = Template.bind({})
// SubmitError.args = {
//   label: 'Label',
//   description: 'Description'
// }

export default Demo as Meta
