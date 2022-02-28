import { Meta, Story } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { ReactElement } from 'react'
import {
  journeyUiConfig,
  simpleComponentConfig,
  StoryCard,
  TreeBlock
} from '../..'
import { IconName } from '../../../__generated__/globalTypes'
import { SignUp, SIGN_UP_RESPONSE_CREATE } from './SignUp'
import { SignUpFields } from './__generated__/SignUpFields'

const Demo = {
  ...journeyUiConfig,
  ...simpleComponentConfig,
  component: SignUp,
  title: 'Journeys-Ui/SignUp'
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

export default Demo as Meta
