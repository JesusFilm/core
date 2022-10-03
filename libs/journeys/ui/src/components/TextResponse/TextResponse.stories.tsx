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
import { IconName, TypographyVariant } from '../../../__generated__/globalTypes'
import { Typography } from '../Typography'
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

const typographyProps: TreeBlock = {
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

const Template: Story<
  TreeBlock<TextResponseFields> & { complete?: boolean }
> = ({ complete = false, ...args }): ReactElement => (
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
    <JourneyProvider>
      <SnackbarProvider>
        <StoryCard>
          {complete && <Typography {...typographyProps} />}
          <TextResponse {...textResponseProps} {...args} uuid={() => 'uuid'} />
          {complete && (
            <Typography
              {...typographyProps}
              content="Some block below"
              variant={TypographyVariant.body1}
            />
          )}
        </StoryCard>
      </SnackbarProvider>
    </JourneyProvider>
  </MockedProvider>
)

export const Default = Template.bind({})

export const Complete = Template.bind({})
Complete.args = {
  complete: true,
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
  minRows: 1
}
SubmitError.play = () => {
  const submit = screen.getAllByRole('button')[0]
  userEvent.type(screen.getAllByRole('textbox')[0], 'Answer')
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

export default Demo as Meta
