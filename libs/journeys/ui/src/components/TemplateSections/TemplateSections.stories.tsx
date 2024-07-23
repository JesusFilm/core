import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'
import { TemplateSections } from '.'
import { InstantSearchWrapper } from './InstantSearchProvider'

const TemplateSectionsStory: Meta<typeof TemplateSections> = {
  ...journeysAdminConfig,
  component: TemplateSections,
  title: 'Journeys-Admin/TemplateSections',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<ComponentProps<typeof TemplateSections>> = {
  render: () => (
    <Box sx={{ backgroundColor: 'background.paper', p: 5, overflow: 'hidden' }}>
      <InstantSearchWrapper indexName="api-journeys-journeys-dev">
        <TemplateSections />
      </InstantSearchWrapper>
    </Box>
  )
}

export const Default = {
  ...Template
}

// TODO(jk)
// export const Match = {
//   ...Template
// }

// export const NoMatch = {
//   ...Template
// }

export default TemplateSectionsStory
