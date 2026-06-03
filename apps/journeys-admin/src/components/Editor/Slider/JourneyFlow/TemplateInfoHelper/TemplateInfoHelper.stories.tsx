import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/nextjs-vite'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { TemplateInfoHelper } from './TemplateInfoHelper'

const TemplateInfoHelperStory: Meta<typeof TemplateInfoHelper> = {
  ...journeysAdminConfig,
  component: TemplateInfoHelper,
  title: 'Journeys-Admin/Editor/Slider/JourneyFlow/TemplateInfoHelper',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  },
  decorators: [
    (Story) => (
      <Box
        sx={{
          width: '100vw',
          height: '100vh',
          p: 2,
          bgcolor: '#EFEFEF'
        }}
      >
        <Story />
      </Box>
    )
  ]
}

export const Default: StoryObj<typeof TemplateInfoHelper> = {
  render: () => <TemplateInfoHelper />
}

export default TemplateInfoHelperStory
