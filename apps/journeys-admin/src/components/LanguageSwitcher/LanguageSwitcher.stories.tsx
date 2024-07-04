import { jest } from '@storybook/jest'
import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { LanguageSwitcher } from './LanguageSwitcher'

const LanguageSwitcherStory: Meta<typeof LanguageSwitcher> = {
  ...simpleComponentConfig,
  component: LanguageSwitcher,
  title: 'Journeys-Admin/LanguageSwitcher'
}

export const Default: StoryObj<typeof LanguageSwitcher> = {
  render: () => <LanguageSwitcher open handleClose={jest.fn()} />
}
export default LanguageSwitcherStory
