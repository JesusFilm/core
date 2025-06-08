import { Meta, StoryObj } from '@storybook/react'

import { sharedUiConfig } from '@core/shared/ui/sharedUiConfig'

import { RelatedQuestions } from './RelatedQuestions'

const meta = {
  ...sharedUiConfig,
  title: 'Watch/RelatedQuestions',
  component: RelatedQuestions
} satisfies Meta<typeof RelatedQuestions>

export default meta

type Story = StoryObj<typeof RelatedQuestions>

export const Default: Story = {
  args: {
    questions: [
      {
        value: 'What did you learn from this video?',
        __typename: 'VideoStudyQuestion'
      },
      {
        value: 'How does this message relate to your life?',
        __typename: 'VideoStudyQuestion'
      },
      {
        value: 'What questions do you have about the content?',
        __typename: 'VideoStudyQuestion'
      }
    ],
    contentId: '123',
    questionsTitle: 'Related questions',
    askButtonText: 'Ask yours'
  }
}
