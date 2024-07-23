import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import {
  getJourneysWithoutLanguageIdsMock,
  getLanguagesMock,
  getTagsMock
} from './data'

import { TemplateGallery } from '.'

import '../../../test/i18n'
import { InstantSearchWrapper } from '../TemplateSections/InstantSearchProvider'

const TemplateGalleryStory: Meta<typeof TemplateGallery> = {
  ...journeysAdminConfig,
  component: TemplateGallery,
  title: 'Journeys-Admin/TemplateGallery',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: StoryObj<ComponentProps<typeof TemplateGallery>> = {
  render: () => (
    <Box sx={{ height: '100%', overflow: 'hidden' }}>
      <InstantSearchWrapper indexName="api-journeys-journeys-dev">
        <TemplateGallery />
      </InstantSearchWrapper>
    </Box>
  )
}

export const Default = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [getJourneysWithoutLanguageIdsMock, getLanguagesMock, getTagsMock]
    }
  }
}

export const Loading = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [
        { ...getJourneysWithoutLanguageIdsMock, delay: 100000000000000 },
        { ...getLanguagesMock, delay: 100000000000000 },
        { ...getTagsMock, delay: 100000000000000 }
      ]
    }
  }
}

// //TODO
// export const Default = {
//   ...Template
// }

// export const Match = {
//   ...Template,
//   play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
//     const canvas = within(canvasElement)
//     const searchInput = await canvas.getByTestId('SearchBar')
//     await userEvent.click(searchInput)
//     await userEvent.keyboard('Easter')
//   }
// }

// export const NoMatch = {
//   ...Template,
//   play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
//     const canvas = within(canvasElement)
//     const searchInput = await canvas.getByTestId('SearchBar')
//     await userEvent.click(searchInput)
//     await userEvent.keyboard('Nothing')
//   }
// }

export default TemplateGalleryStory
