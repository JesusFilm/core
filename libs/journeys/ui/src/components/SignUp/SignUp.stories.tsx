import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'
import { SnackbarProvider } from 'notistack'
import { ComponentProps, ReactElement } from 'react'

import { IconName, TypographyVariant } from '../../../__generated__/globalTypes'
import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { journeyUiConfig } from '../../libs/journeyUiConfig'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import { StoryCard } from '../StoryCard'
import { Typography } from '../Typography'

import { SIGN_UP_SUBMISSION_EVENT_CREATE, SignUp } from './SignUp'

const Demo: Meta<typeof SignUp> = {
  ...journeyUiConfig,
  ...simpleComponentConfig,
  component: SignUp,
  title: 'Journeys-Ui/SignUp',
  parameters: {
    docs: {
      description: {
        component:
          'For the SignUp Loading story - to test the loading state of the component. Fill out the form and click submit to see the loading state.'
      },
      source: { type: 'code' }
    }
  }
}

const typographyProps: ComponentProps<typeof Typography> = {
  __typename: 'TypographyBlock',
  id: 'id',
  parentOrder: 0,
  parentBlockId: 'card',
  align: null,
  color: null,
  variant: TypographyVariant.h3,
  content: 'Some block above',
  children: [],
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
}

const signUpProps: ComponentProps<typeof SignUp> = {
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

const submitEventMock: MockedResponse = {
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
        id: 'uuid'
      }
    }
  }
}

const Template: StoryObj<ComponentProps<typeof SignUp>> = {
  render: ({ ...args }): ReactElement => (
    <MockedProvider mocks={[submitEventMock]}>
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
}

export const Default = { ...Template, args: { ...signUpProps } }

export const Complete = {
  ...Template,
  args: {
    ...Default.args,
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
}

export const SubmitError = {
  ...Template,
  args: { ...Default.args },
  play: async () => {
    const fields = screen.getAllByRole('textbox')

    await userEvent.type(fields[0], 'Name')
    await userEvent.type(fields[1], 'name@domain.com')
    await userEvent.click(screen.getAllByRole('button')[0])
  }
}

const LoadingTemplate: StoryObj<ComponentProps<typeof SignUp>> = {
  render: ({ ...args }): ReactElement => (
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
}

export const Loading = {
  ...LoadingTemplate,
  args: { ...Default.args },
  play: async () => {
    const submitButtons = screen.getAllByRole('button')
    const fields = screen.getAllByRole('textbox')

    await userEvent.type(fields[0], 'Name')
    await userEvent.type(fields[1], 'name@domain.com')
    await userEvent.type(fields[2], 'Name')
    await userEvent.type(fields[3], 'name@domain.com')
    await Promise.all(
      submitButtons.map(async (button) => {
        await userEvent.click(button)
      })
    )
  },
  parameters: {
    chromatic: { disableSnapshot: true }
  }
}

export const RTL = {
  ...Template,
  args: { ...Complete.args },
  parameters: { rtl: true }
}

export default Demo
