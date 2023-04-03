import { Meta, Story } from '@storybook/react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { simpleComponentConfig } from '../../../libs/storybook'
import { NavigationButton } from '.'

const NavigationButtonStory = {
  ...simpleComponentConfig,
  title: 'Journeys-Admin/ReportsNavigation/NavigationButton'
}

const Template: Story = ({ ...args }) => (
  <Stack spacing={4} sx={{ maxWidth: '300px' }}>
    <Typography>Default Navigation Button</Typography>
    <NavigationButton {...args.default} />
    <Typography>Selected Navigation Button</Typography>
    <NavigationButton {...args.selected} />
  </Stack>
)

export const Default = Template.bind({})
Default.args = {
  default: {
    selected: false,
    value: 'default',
    link: '/some/link'
  },
  selected: {
    selected: true,
    value: 'selected',
    link: '/some/link'
  }
}

export default NavigationButtonStory as Meta
