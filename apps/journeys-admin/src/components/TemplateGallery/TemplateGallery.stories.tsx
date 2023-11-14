import Box from '@mui/material/Box'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '../../libs/storybook'

import {
  getJourneysMock,
  getJourneysWithoutLanguageIdsMock,
  getLanguagesMock,
  getTagsMock
} from './data'

import { TemplateGallery } from '.'

import '../../../test/i18n'

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
    <Box
      sx={{
        backgroundColor: 'background.paper',
        p: 5,
        height: '100%',
        overflow: 'hidden'
      }}
    >
      <TemplateGallery />
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
        { ...getJourneysMock, delay: 100000000000000 },
        { ...getLanguagesMock, delay: 100000000000000 },
        { ...getTagsMock, delay: 100000000000000 }
      ]
    }
  }
}

export default TemplateGalleryStory
