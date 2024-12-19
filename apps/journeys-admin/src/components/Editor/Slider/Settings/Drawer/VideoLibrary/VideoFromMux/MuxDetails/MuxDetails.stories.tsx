import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { MuxDetails } from '.'

const MuxDetailsStory: Meta<typeof MuxDetails> = {
  ...journeysAdminConfig,
  component: MuxDetails,
  title:
    'Journeys-Admin/Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromCloudflare/CloudflareDetails',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: StoryObj<typeof MuxDetails> = {
  render: ({ id, onSelect }) => {
    return <MuxDetails id={id} open onSelect={onSelect} />
  }
}

export const Default = {
  ...Template,
  args: {
    id: 'videoId'
  }
}

export default MuxDetailsStory
