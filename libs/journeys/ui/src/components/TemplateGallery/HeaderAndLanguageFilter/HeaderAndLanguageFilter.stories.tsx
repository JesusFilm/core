import { Meta, StoryObj } from '@storybook/nextjs-vite'
import noop from 'lodash/noop'
import { ComponentProps } from 'react'
import { screen, userEvent } from 'storybook/test'

import '../../../../test/i18n'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { getJourneyTemplateLanguageIdsMock, getLanguagesMock } from '../data'

import { HeaderAndLanguageFilter } from '.'

const HeaderAndLanguageFilterStory: Meta<typeof HeaderAndLanguageFilter> = {
  ...journeysAdminConfig,
  component: HeaderAndLanguageFilter,
  title: 'Journeys-Admin/TemplateGallery/HeaderAndLanguageFilter'
}

const Template: StoryObj<ComponentProps<typeof HeaderAndLanguageFilter>> = {
  render: ({ ...args }) => <HeaderAndLanguageFilter {...args} />
}

export const Default = {
  ...Template,
  args: {
    selectedLanguageIds: [],
    onChange: noop
  },
  parameters: {
    apolloClient: {
      mocks: [getJourneyTemplateLanguageIdsMock, getLanguagesMock]
    }
  }
}

export const Clicked = {
  ...Template,
  args: {
    selectedLanguageIds: [],
    onChange: noop
  },
  parameters: {
    apolloClient: {
      mocks: [getJourneyTemplateLanguageIdsMock, getLanguagesMock]
    }
  },
  play: async () => {
    await userEvent.click(screen.getByRole('button'))
  }
}

export const Selected = {
  ...Template,
  args: {
    selectedLanguageIds: ['529'],
    onChange: noop
  },
  parameters: {
    apolloClient: {
      mocks: [getJourneyTemplateLanguageIdsMock, getLanguagesMock]
    }
  }
}

export const Loading = {
  ...Template,
  args: {
    selectedLanguageIds: ['529'],
    onChange: noop
  },
  parameters: {
    apolloClient: {
      mocks: [
        { ...getJourneyTemplateLanguageIdsMock, delay: 100000000000000 },
        getLanguagesMock
      ]
    }
  }
}

export default HeaderAndLanguageFilterStory
