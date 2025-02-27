import { ComponentPropsWithoutRef } from 'react'
import { TextPreview } from './TextPreview'
import { videosAdminConfig } from '../../../libs/storybookConfig'
import { Meta, StoryObj } from '@storybook/react'

type StoryArgs = ComponentPropsWithoutRef<typeof TextPreview>

const meta = {
  ...videosAdminConfig,
  title: 'Videos-Admin/File/TextPreview',
  component: TextPreview,
  parameters: {
    tags: ['!autodocs']
  }
} satisfies Meta<StoryArgs>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    file: new File(['text file content'], 'file.txt', { type: 'text/plain' })
  }
}
