import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'
import { TemplateSections } from '.'
import { InstantSearchTestWrapper } from '../../libs/algolia/InstantSearchTestWrapper'
import { SearchBar } from '../SearchBar'

import '../../../test/i18n'

const TemplateSectionsStory: Meta<typeof TemplateSections> = {
  ...journeysAdminConfig,
  component: TemplateSections,
  title: 'Journeys-Ui/TemplateSections',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<
  ComponentProps<typeof TemplateSections> & { query: string }
> = {
  render: (args) => (
    <Box sx={{ backgroundColor: 'background.paper', p: 5, overflow: 'hidden' }}>
      <InstantSearchTestWrapper
        query={args.query}
        indexName="api-journeys-journeys-dev"
      >
        <TemplateSections />
        <Box
          sx={{
            display: 'none'
          }}
        >
          {/* Needed to apply the search */}
          <SearchBar />
        </Box>
      </InstantSearchTestWrapper>
    </Box>
  )
}

export const Default = {
  ...Template
}

export const Match = {
  ...Template,
  args: {
    query: 'Easter'
  }
}

export const NoMatch = {
  ...Template,
  args: {
    query: 'Nothing'
  }
}

export default TemplateSectionsStory
