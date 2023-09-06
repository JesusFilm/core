import Stack from '@mui/material/Stack'
import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../../libs/storybook'

import { NavigationButton } from '.'

const NavigationButtonStory: Meta<typeof NavigationButton> = {
  ...simpleComponentConfig,
  component: NavigationButton,
  title: 'Journeys-Admin/ReportsNavigation/NavigationButton'
}

const Template: StoryObj<typeof NavigationButton> = {
  render: ({ ...args }) => (
    <Stack spacing={4} sx={{ maxWidth: '300px' }}>
      <NavigationButton {...args} />
    </Stack>
  )
}

export const Default = {
  ...Template,
  args: {
    selected: false,
    value: 'default',
    link: '/some/link'
  }
}

export const Selected = {
  ...Template,
  args: {
    selected: true,
    value: 'selected',
    link: '/some/link'
  }
}

export default NavigationButtonStory
