import { ComponentStory, Meta } from '@storybook/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
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
import {
  TextResponse,
  TEXT_RESPONSE_SUBMISSION_EVENT_CREATE
} from './TextResponse'

const Demo = {
  ...journeyUiConfig,
  ...simpleComponentConfig,
  component: TextResponse,
  title: 'Journeys-Ui/TextResponse'
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

const textResponseProps: Parameters<typeof TextResponse>[0] = {
  id: 'textResponseBlockId1',
  __typename: 'TextResponseBlock',
  parentBlockId: null,
  parentOrder: 0,
  label: 'Your answer here',
  hint: null,
  minRows: null,
  submitIconId: null,
  submitLabel: null,
  action: {
    __typename: 'NavigateAction',
    parentBlockId: 'textResponseBlockId1',
    gtmEventName: 'gtmEventName'
  },
  children: []
}

const submitEventMock: MockedResponse = {
  request: {
    query: TEXT_RESPONSE_SUBMISSION_EVENT_CREATE,
    variables: {
      input: {
        id: 'uuid',
        blockId: 'textResponseBlockId1',
        value: 'My response'
      }
    }
  },
  result: {
    data: {
      textResponseSubmissionEventCreate: {
        id: 'uuid',
        blockId: 'textResponseBlockId1',
        value: 'My response'
      }
    }
  }
}

const Template: ComponentStory<typeof TextResponse> = ({
  ...args
}): ReactElement => (
  <MockedProvider mocks={[submitEventMock]}>
    <JourneyProvider>
      <SnackbarProvider>
        <StoryCard>
          <Typography {...typographyProps} />
          <TextResponse {...args} uuid={() => 'uuid'} />
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
Default.args = { ...textResponseProps }

export const Complete = Template.bind({})
Complete.args = {
  ...Default.args,
  hint: 'Optional Hint text',
  minRows: 4,
  label: 'Custom label',
  submitIconId: 'icon',
  submitLabel: 'Custom label',
  children: [
    {
      id: 'icon',
      __typename: 'IconBlock',
      parentBlockId: 'parent',
      parentOrder: 0,
      iconName: IconName.SendRounded,
      iconSize: null,
      iconColor: null,
      children: []
    }
  ]
}

export const SubmitError = Template.bind({})
SubmitError.args = {
  ...Default.args,
  minRows: 1
}
SubmitError.play = () => {
  const submit = screen.getAllByRole('button')[0]
  userEvent.type(screen.getAllByRole('textbox')[0], 'Answer')
  userEvent.click(submit)
}

const LoadingTemplate: ComponentStory<typeof TextResponse> = ({
  ...args
}): ReactElement => (
  <ApolloLoadingProvider>
    <JourneyProvider>
      <SnackbarProvider>
        <StoryCard>
          <TextResponse {...args} uuid={() => 'uuid'} />
        </StoryCard>
      </SnackbarProvider>
    </JourneyProvider>
  </ApolloLoadingProvider>
)

export const Loading = LoadingTemplate.bind({})
Loading.args = { ...Default.args }
Loading.play = () => {
  const submitButtons = screen.getAllByRole('button')
  const textFields = screen.getAllByRole('textbox')
  textFields.forEach((field) => {
    userEvent.type(field, 'Answer')
  })
  submitButtons.forEach((button) => {
    userEvent.click(button)
  })
}
Loading.parameters = { chromatic: { disableSnapshot: true } }

export const RTL = Template.bind({})
RTL.args = { ...Complete.args }
RTL.parameters = { rtl: true }

export default Demo as Meta
