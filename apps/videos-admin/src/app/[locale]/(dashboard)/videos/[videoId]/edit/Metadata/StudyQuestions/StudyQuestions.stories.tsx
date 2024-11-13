import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../../../../../../../libs/storybookConfig'

import { mockStudyQuestions } from './data.mock'
import { StudyQuestions } from './StudyQuestions'

type StoryArgs = ComponentPropsWithoutRef<typeof StudyQuestions>

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
    studyQuestions: mockStudyQuestions,
    reload: noop
  }
}

export const Empty: Story = {
  args: {
    studyQuestions: [],
    reload: noop
  }
}
