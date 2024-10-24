import { Meta, StoryObj } from '@storybook/react'
import { StudyQuestions } from './StudyQuestions'
import { videosAdminConfig } from '../../../../../../../../libs/storybookConfig'
import { ComponentPropsWithoutRef } from 'react'

type StoryArgs = ComponentPropsWithoutRef<typeof StudyQuestions> & {
  locale: string
}

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/Video/Edit/StudyQuestions',
  component: StudyQuestions,
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
    studyQuestions: []
  }
}

export const Empty: Story = {
  args: {
    studyQuestions: []
  }
}
