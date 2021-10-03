import { Meta } from '@storybook/react'
import { journeysConfig } from '../../../libs/storybook/decorators'
import { SignUp, SIGN_UP_RESPONSE_CREATE } from './SignUp'
import { MockedProvider } from '@apollo/client/testing'
import { ReactElement } from 'react'
import { TreeBlock } from '../../../libs/transformer/transformer'
import { GetJourney_journey_blocks_SignUpBlock as SignUpBlock } from '../../../../__generated__/GetJourney'
import { IconName } from '../../../../__generated__/globalTypes'
import { ButtonFields_startIcon as IconType } from '../../../../__generated__/ButtonFields'

const Demo = {
  ...journeysConfig,
  component: SignUp,
  title: 'Journeys/Blocks/SignUp'
}

const signUpProps: TreeBlock<SignUpBlock> = {
  id: 'signUpBlockId1',
  __typename: 'SignUpBlock',
  parentBlockId: null,
  action: {
    __typename: 'NavigateToBlockAction',
    gtmEventName: 'gtmEventName',
    blockId: 'step2.id'
  },
  children: []
}

const icon: IconType = {
  __typename: 'Icon',
  name: IconName.LockOpen,
  size: null,
  color: null
}

export const Default = (): ReactElement => (
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
    <SignUp
      {...signUpProps}
      uuid="uuid"
      submitIcon={icon}
      submitLabel={'Unlock Now'}
    />
  </MockedProvider>
)

// export const SubmitError = Template.bind({})
// SubmitError.args = {
//   label: 'Label',
//   description: 'Description'
// }

export default Demo as Meta
