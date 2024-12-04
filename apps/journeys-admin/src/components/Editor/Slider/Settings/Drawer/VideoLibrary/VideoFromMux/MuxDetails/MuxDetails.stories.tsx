import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { CloudflareDetails } from '.'

const CloudflareDetailsStory: Meta<typeof CloudflareDetails> = {
  ...journeysAdminConfig,
  component: CloudflareDetails,
  title:
    'Journeys-Admin/Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromCloudflare/CloudflareDetails',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: StoryObj<typeof CloudflareDetails> = {
  render: ({ id, onSelect }) => {
    return <CloudflareDetails id={id} open onSelect={onSelect} />
  }
}

export const Default = {
  ...Template,
  args: {
    id: 'videoId'
  }
}

export default CloudflareDetailsStory
