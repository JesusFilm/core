import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../../../../libs/storybook'

import { CategoriesTabPanel } from './CategoriesTabPanel'

const CategoriesTabPanelStory: Meta<typeof CategoriesTabPanel> = {
  ...simpleComponentConfig,
  component: CategoriesTabPanel,
  title: 'Journeys-Admin/CategoriesTabPanel',
  parameters: {
    ...simpleComponentConfig.parameters
  }
}

const Template: StoryObj<typeof CategoriesTabPanel> = {
  render: (args) => <CategoriesTabPanel {...args} />
}

export const Default = {
  ...Template,
  args: {
    loading: false,
    values: false
  }
}

export const Disabled = {
  ...Template,
  args: {
    loading: true,
    values: true
  }
}

export const Checked = {
  ...Template,
  args: {
    loading: false,
    values: true
  }
}

export default CategoriesTabPanelStory
