import { Meta, StoryObj } from '@storybook/react'
import { Formik } from 'formik'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../../../../../../../../libs/storybookConfig'

import { SubtitleFileUpload } from './SubtitleFileUpload'

const noop = () => undefined

type StoryArgs = ComponentPropsWithoutRef<typeof SubtitleFileUpload> & {
  initialValues: object
}

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/VideoView/Subtitles/SubtitleForm/SubtitleFileUpload',
  component: SubtitleFileUpload,
  parameters: {
    tags: ['!autodocs']
  },
  decorators: [
    ...videosAdminConfig.decorators,
    (Story, ctx) => (
      <Formik initialValues={ctx.args.initialValues} onSubmit={noop}>
        <Story />
      </Formik>
    )
  ]
} satisfies Meta<StoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    initialValues: {
      file: null
    }
  }
}

export const WithFile: Story = {
  args: {
    initialValues: {
      file: new File(['test'], 'test.vtt', { type: 'text/vtt' })
    }
  }
}
