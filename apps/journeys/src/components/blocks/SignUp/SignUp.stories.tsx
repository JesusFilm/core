import { Meta } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { ReactElement } from 'react'
import {
  journeysConfig,
  simpleComponentConfig,
  StoryCard
} from '../../../libs/storybook'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { GetJourney_journey_blocks_SignUpBlock as SignUpBlock } from '../../../../__generated__/GetJourney'
import { IconName } from '../../../../__generated__/globalTypes'
import { ButtonFields_startIcon as IconType } from '../../../../__generated__/ButtonFields'
import { SignUp, SIGN_UP_RESPONSE_CREATE } from './SignUp'

const Demo = {
  ...journeysConfig,
  ...simpleComponentConfig,
  component: SignUp,
  title: 'Journeys/Blocks/SignUp'
}

const icon: IconType = {
  __typename: 'Icon',
  name: IconName.LockOpenRounded,
  size: null,
  color: null
}

const signUpProps: TreeBlock<SignUpBlock> = {
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

const Template = ({ submitIcon, submitLabel }): ReactElement => (
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
      <SignUp
        {...signUpProps}
        uuid={() => 'uuid'}
        submitIcon={submitIcon}
        submitLabel={submitLabel}
      />
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
