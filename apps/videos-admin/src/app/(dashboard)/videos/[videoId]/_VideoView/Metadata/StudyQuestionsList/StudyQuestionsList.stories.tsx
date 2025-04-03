import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../../../../../../libs/storybookConfig'

import { StudyQuestionsList } from './StudyQuestionsList'

type StoryArgs = ComponentPropsWithoutRef<typeof StudyQuestionsList> & {
  locale: string
}

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Video/Edit/StudyQuestions',
  component: StudyQuestionsList,
  parameters: {
    nextjs: {
      appDirectory: true
    },
    viewport: {
      defaultViewport: 'none'
    }
  }
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    studyQuestions: [
      {
        id: 'studyQuestion.1',
        value: 'Study question 1 text'
      },
      {
        id: 'studyQuestions.2',
        value: 'Study question 2 text'
      },
      {
        id: 'studyQuestion.3',
        value: 'Study question 3 text'
      }
    ]
  }
}

export const Empty: Story = {
  args: {
    studyQuestions: []
  }
}
