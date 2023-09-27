import { Meta, StoryObj } from '@storybook/react'

<<<<<<<< HEAD:apps/journeys-admin/src/components/JourneyView/TitleDescription/TemplateSettingsDialog/FeaturedCheckbox/FeaturedCheckbox.stories.tsx
import { simpleComponentConfig } from '../../../../../libs/storybook'
========
import { simpleComponentConfig } from '../../../../libs/storybook'
>>>>>>>> 2c85d35ec (feat: add featured checkbox to dialog (#1910)):apps/journeys-admin/src/components/JourneyView/TitleDescription/FeaturedCheckbox/FeaturedCheckbox.stories.tsx

import { FeaturedCheckbox } from './FeaturedCheckbox'

const FeaturedCheckboxStory: Meta<typeof FeaturedCheckbox> = {
  ...simpleComponentConfig,
  component: FeaturedCheckbox,
  title: 'Journeys-Admin/FeaturedCheckbox',
  parameters: {
    ...simpleComponentConfig.parameters
  }
}

const Template: StoryObj<typeof FeaturedCheckbox> = {
  render: (args) => <FeaturedCheckbox {...args} />
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

export default FeaturedCheckboxStory
