import { Meta, Story } from '@storybook/react'
import { MockedProvider } from '@apollo/client/testing'
import { screen, userEvent } from '@storybook/testing-library'
import { ReactElement } from 'react'
import { SnackbarProvider } from 'notistack'
import { journeyUiConfig } from '../../libs/journeyUiConfig'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import type { TreeBlock } from '../../libs/block'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { StoryCard } from '../StoryCard'
import { ApolloLoadingProvider } from '../../../test/ApolloLoadingProvider'
import { IconName } from '../../../__generated__/globalTypes'
import {
  TextResponse,
  TEXT_RESPONSE_SUBMISSION_EVENT_CREATE
} from './TextResponse'
import { TextResponseFields } from './__generated__/TextResponseFields'

const Demo = {
  ...journeyUiConfig,
  ...simpleComponentConfig,
  component: TextResponse,
  title: 'Journeys-Ui/TextResponse'
}

const textResponseProps: TreeBlock<TextResponseFields> = {
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

const Template: Story<TreeBlock<TextResponseFields>> = ({
  ...props
}): ReactElement => (
  <MockedProvider
    mocks={[
      {
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
    ]}
  >
    <SnackbarProvider>
      <StoryCard>
        <TextResponse {...textResponseProps} {...props} uuid={() => 'uuid'} />
      </StoryCard>
    </SnackbarProvider>
  </MockedProvider>
)

export const Default = Template.bind({})

export const Complete = Template.bind({})
Complete.args = {
  hint: 'Hint text',
  minRows: 4,
  submitIconId: 'icon',
  submitLabel: 'Send',
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
  minRows: 1
}
SubmitError.play = () => {
  const submit = screen.getAllByRole('button')[0]
  userEvent.click(submit)
}

const LoadingTemplate: Story<
  TreeBlock<TextResponseFields>
> = (): ReactElement => (
  <ApolloLoadingProvider>
    <JourneyProvider>
      <SnackbarProvider>
        <StoryCard>
          <TextResponse {...textResponseProps} uuid={() => 'uuid'} />
        </StoryCard>
      </SnackbarProvider>
    </JourneyProvider>
  </ApolloLoadingProvider>
)

export const Loading = LoadingTemplate.bind({})
Loading.parameters = {
  chromatic: { pauseAnimationAtEnd: true }
}
Loading.play = () => {
  const submitButtons = screen.getAllByRole('button')
  submitButtons.forEach((button) => {
    userEvent.click(button)
  })
}

export default Demo as Meta
