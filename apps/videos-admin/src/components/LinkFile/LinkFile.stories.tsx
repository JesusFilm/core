import { action } from '@storybook/addon-actions'
import { Meta, StoryObj } from '@storybook/react'

import { LinkFile } from './LinkFile'

const meta: Meta<typeof LinkFile> = {
  title: 'Components/LinkFile',
  component: LinkFile,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs']
}

export default meta

type Story = StoryObj<typeof LinkFile>

export const Default: Story = {
  args: {
    name: 'example-file.vtt',
    link: 'https://example.com/example-file.vtt'
  }
}

export const WithDeleteAction: Story = {
  args: {
    name: 'example-file.vtt',
    link: 'https://example.com/example-file.vtt',
    onDelete: action('delete-clicked')
  }
}

export const LongFileName: Story = {
  args: {
    name: 'very-long-file-name-that-might-overflow-the-container-example-subtitle-file.vtt',
    link: 'https://example.com/very-long-file-name-that-might-overflow-the-container-example-subtitle-file.vtt'
  }
}
