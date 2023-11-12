import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '../../../../libs/storybook'
import { SocialImage } from '../../../JourneyView/SocialImage'

import { TemplateCreatorDetails } from './TemplateCreatorDetails'

const TemplateCreatorStory: Meta<typeof TemplateCreatorDetails> = {
  ...journeysAdminConfig,
  title: 'Journeys-Admin/TemplateView/TemplateCreatorDetails',
  component: TemplateCreatorDetails
}

const Template: StoryObj<typeof TemplateCreatorDetails> = {
  render: (args) => (
    <Box sx={{ width: 244 }}>
      <SocialImage
        height={244}
        width={244}
        sx={{
          display: { xs: 'none', sm: 'block' },
          borderRadius: 3,
          borderBottomRightRadius: {
            sm: 0
          },
          borderBottomLeftRadius: {
            sm: 0
          }
        }}
      />
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
