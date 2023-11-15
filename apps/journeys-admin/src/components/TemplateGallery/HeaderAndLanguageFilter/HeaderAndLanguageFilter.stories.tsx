import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { ComponentProps } from 'react'

import '../../../../test/i18n'

import { journeysAdminConfig } from '../../../libs/storybook'
import { getLanguagesMock } from '../data'

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
    selectedLanguageIds: ['529'],
    onChange: noop
  },
  parameters: {
    apolloClient: {
      mocks: [getLanguagesMock]
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
      mocks: [{ ...getLanguagesMock, delay: 100000000000000 }]
    }
  }
}

export default HeaderAndLanguageFilterStory
