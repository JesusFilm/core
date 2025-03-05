import { Meta, StoryObj } from '@storybook/react'
import { ComponentPropsWithoutRef } from 'react'

import { videosAdminConfig } from '../../libs/storybookConfig'

import { File as FileComponent } from './File'

const noop = () => undefined

const textFile = new File(['text file content'], 'file.txt', {
  type: 'text/plain'
})

type StoryArgs = ComponentPropsWithoutRef<typeof FileComponent>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/File',
  component: FileComponent,
  parameters: {
    tags: ['!autodocs']
  }
} satisfies Meta<StoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const TextFile: Story = {
  args: {
    file: textFile,
    type: 'text'
  }
}

export const ImageFile: Story = {
  args: {
    file: new File(['image file content'], 'file.png', { type: 'image/png' }),
    type: 'image'
  }
}

export const VideoFile: Story = {
  args: {
    file: new File(['video file content'], 'file.mp4', { type: 'video/mp4' }),
    type: 'video'
  }
}

export const WithActions: Story = {
  args: {
    file: textFile,
    type: 'text',
    actions: {
      onDelete: noop,
      onDownload: noop
    }
  }
}
