import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { SocialImage } from '../SocialImage'

import { TemplateCreatorDetails } from './TemplateCreatorDetails'

const TemplateCreatorStory: Meta<typeof TemplateCreatorDetails> = {
  ...journeysAdminConfig,
  title:
    'Journeys-Admin/TemplateView/TemplateViewHeader/TemplateCreatorDetails',
  component: TemplateCreatorDetails
}

const Template: StoryObj<typeof TemplateCreatorDetails> = {
  render: (args) => (
    <Box sx={{ width: 244 }}>
      <SocialImage hasCreatorDescription />
      <TemplateCreatorDetails {...args} />
    </Box>
  )
}

export const Default = {
  ...Template,
  args: {
    creatorDetails:
      'Created by a Name of a Mission or Missionaries Organisation label by a Name of a Mission or Missionaries'
  }
}

export const WithImage = {
  ...Default,
  args: {
    ...Default.args,
    creatorImage:
      'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920'
  }
}

export default TemplateCreatorStory
