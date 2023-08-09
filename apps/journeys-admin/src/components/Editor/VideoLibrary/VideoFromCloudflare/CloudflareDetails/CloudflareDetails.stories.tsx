import { Meta, Story } from '@storybook/react'

import { journeysAdminConfig } from '../../../../../libs/storybook'

import { CloudflareDetails } from '.'

const CloudflareDetailsStory = {
  ...journeysAdminConfig,
  component: CloudflareDetails,
  title:
    'Journeys-Admin/Editor/VideoLibrary/VideoFromCloudflare/CloudflareDetails',
  argTypes: { onSelect: { action: 'clicked' } }
}

const Template: Story = ({ id, onSelect }) => {
  return <CloudflareDetails id={id} open onSelect={onSelect} />
}

export const Default = Template.bind({})
Default.args = {
  id: 'videoId'
}

export default CloudflareDetailsStory as Meta
