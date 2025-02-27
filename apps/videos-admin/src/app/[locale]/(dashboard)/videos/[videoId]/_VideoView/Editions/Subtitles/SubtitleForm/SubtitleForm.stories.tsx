import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../../../../../../../../libs/storybookConfig'

import { SubtitleForm } from './SubtitleForm'

const noop = () => undefined

type StoryArgs = ComponentPropsWithoutRef<typeof SubtitleForm>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/VideoView/Subtitles/SubtitleForm',
  component: SubtitleForm,
  parameters: {
    tags: ['!autodocs']
  }
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<typeof meta>

export const Create: Story = {
  args: {
    variant: 'create',
    initialValues: { language: '', primary: false, file: null },
    onSubmit: noop
  }
}

export const Edit: Story = {
  args: {
    variant: 'edit',
    initialValues: {
      language: 'en',
      primary: true,
      file: new File(['test file'], 'test.vtt', { type: 'text/vtt' })
    },
    onSubmit: noop
  }
}
