import Box from '@mui/material/Box'
import { expect } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { getTagsMock } from './data'

import { TemplateGallery } from '.'

import '../../../test/i18n'
import { screen, userEvent, waitFor } from '@storybook/testing-library'
import { InstantSearchTestWrapper } from '../../libs/algolia/InstantSearchTestWrapper'

const TemplateGalleryStory: Meta<typeof TemplateGallery> = {
  ...journeysAdminConfig,
  component: TemplateGallery,
  title: 'Journeys-Ui/TemplateGallery',
  parameters: {
    layout: 'fullscreen'
  }
}

const Template: StoryObj<
  ComponentProps<typeof TemplateGallery> & { query: string }
> = {
  render: (args) => (
    <Box sx={{ height: '100%', overflow: 'hidden' }}>
      <InstantSearchTestWrapper
        query={args.query}
        indexName="api-journeys-journeys-dev"
      >
        <TemplateGallery />
      </InstantSearchTestWrapper>
    </Box>
  )
}

export const Default = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [getTagsMock]
    }
  },
  play: async () => {
    await waitFor(async () => {
      await expect(screen.getByTestId('SearchBar')).toBeInTheDocument()
    })
    await userEvent.click(screen.getByTestId('SearchBar'))
    await userEvent.keyboard('Hello World!')
  }
}

export const Loading = {
  ...Template,
  parameters: {
    apolloClient: {
      mocks: [{ ...getTagsMock, delay: 100000000000000 }]
    }
  }
}

export const Match = {
  ...Template,
  args: {
    query: 'Easter'
  },
  parameters: {
    apolloClient: {
      mocks: [getTagsMock]
    }
  }
}

export const NoMatch = {
  ...Template,
  args: {
    query: 'Nothing'
  },
  parameters: {
    apolloClient: {
      mocks: [getTagsMock]
    }
  }
}

export default TemplateGalleryStory
