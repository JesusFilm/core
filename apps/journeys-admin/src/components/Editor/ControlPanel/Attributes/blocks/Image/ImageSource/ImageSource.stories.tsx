import { Story, Meta } from '@storybook/react'
import { journeysAdminConfig } from '../../../../../../../libs/storybook'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/GetJourney'

import { ImageSource } from './ImageSource'

const ImageSourceStory = {
  ...journeysAdminConfig,
  component: ImageSource,
  title: 'Journeys-Admin/Editor/ControlPanel/Attributes/Image/ImageSource',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: Story = (args) => {
  return <ImageSource {...args} />
}

export const Default = Template.bind({})
Default.args = {}

export default ImageSourceStory as Meta
