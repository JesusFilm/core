import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentPropsWithoutRef } from 'react'

import { sharedUiConfig } from '@core/shared/ui/sharedUiConfig'

import { DiscussionQuestions } from './DiscussionQuestions'

type StoryArgs = ComponentPropsWithoutRef<typeof DiscussionQuestions>

const meta = {
  ...sharedUiConfig,
  title: 'Watch/NewContentPage/DiscussionQuestions',
  component: DiscussionQuestions,
  parameters: {
    layout: 'fullscreen'
  }
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    questions: [
      {
        value: 'What did you learn from this video?',
        __typename: 'VideoStudyQuestion',
        primary: true
      }
    ]
  }
}

export const MultipleQuestions: Story = {
  args: {
    questions: [
      {
        value: 'What did you learn from this video?',
        __typename: 'VideoStudyQuestion',
        primary: true
      },
      {
        value: 'How does this message relate to your life?',
        __typename: 'VideoStudyQuestion',
        primary: true
      },
      {
        value: 'What questions do you have about the content?',
        __typename: 'VideoStudyQuestion',
        primary: true
      }
    ]
  }
}
