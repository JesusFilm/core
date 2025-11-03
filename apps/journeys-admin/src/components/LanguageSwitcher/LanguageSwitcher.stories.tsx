import { Meta, StoryObj } from '@storybook/nextjs'
import { fn } from 'storybook/test'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { LanguageSwitcher } from './LanguageSwitcher'

const LanguageSwitcherStory: Meta<typeof LanguageSwitcher> = {
  ...simpleComponentConfig,
  component: LanguageSwitcher,
  title: 'Journeys-Admin/LanguageSwitcher'
}

export const Default: StoryObj<typeof LanguageSwitcher> = {
  render: () => <LanguageSwitcher open handleClose={fn()} />
}
export default LanguageSwitcherStory
