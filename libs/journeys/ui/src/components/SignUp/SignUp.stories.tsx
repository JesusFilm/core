import { Meta, Story } from '@storybook/react'
import { within, userEvent } from '@storybook/testing-library'
import { MockedProvider } from '@apollo/client/testing'
import { ReactElement } from 'react'
import {
  journeyUiConfig,
  simpleComponentConfig,
  StoryCard,
  TreeBlock
} from '../..'
import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { IconName } from '../../../__generated__/globalTypes'
import { SignUp, SIGN_UP_RESPONSE_CREATE } from './SignUp'
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
          'In the SignUp Loading story - we are currently not able to test the loading state in both light and dark theme at the same time due to storybook limitations. But this can be checked individually.'
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

const LoadingTemplate: Story<TreeBlock<SignUpFields>> = (): ReactElement => (
  <ApolloLoadingProvider>
    <StoryCard>
      <SignUp {...signUpProps} uuid={() => 'uuid'} />
    </StoryCard>
  </ApolloLoadingProvider>
)

export const Loading = LoadingTemplate.bind({})
Loading.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement)

  const name = canvas.getByLabelText('Name', {
    selector: 'input'
  })
  const email = canvas.getByLabelText('Email', {
    selector: 'input'
  })
  const submit = canvas.getAllByRole('button', { name: 'Submit' })

  await userEvent.type(name, 'Amin User')
  await userEvent.type(email, 'amin@gmail.com')
  await userEvent.click(submit[0])

  // Due to the text fields having the same name attribute.
  // We're only able to get back one of them instead of two.
  // Therefore not being able to test the loading state in the dark theme mode
}

export default Demo as Meta
