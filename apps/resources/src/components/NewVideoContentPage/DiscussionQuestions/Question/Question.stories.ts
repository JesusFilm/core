import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentPropsWithoutRef } from 'react'

import { sharedUiConfig } from '@core/shared/ui/sharedUiConfig'

import { Question } from './Question'

type StoryArgs = ComponentPropsWithoutRef<typeof Question>

const meta = {
  ...sharedUiConfig,
  title: 'Watch/NewContentPage/DiscussionQuestions/Question',
  component: Question
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

export const Open: Story = {
  args: {
    ...Default.args
  }
}
