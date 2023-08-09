import Stack from '@mui/material/Stack'
import { Meta, Story } from '@storybook/react'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '../../../libs/storybook'

import { NavigationButton } from '.'

const NavigationButtonStory = {
  ...simpleComponentConfig,
  title: 'Journeys-Admin/ReportsNavigation/NavigationButton'
}

const Template: Story<ComponentProps<typeof NavigationButton>> = ({
  ...args
}) => (
  <Stack spacing={4} sx={{ maxWidth: '300px' }}>
    <NavigationButton {...args} />
  </Stack>
)

export const Default = Template.bind({})
Default.args = {
  selected: false,
  value: 'default',
  link: '/some/link'
}

export const Selected = Template.bind({})
Selected.args = {
  selected: true,
  value: 'selected',
  link: '/some/link'
}

export default NavigationButtonStory as Meta
