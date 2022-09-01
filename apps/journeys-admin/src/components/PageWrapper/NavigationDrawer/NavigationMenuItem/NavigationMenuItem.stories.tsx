import { Meta, Story } from '@storybook/react'
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { NavigationMenuItemProps } from './NavigationMenuItem'
import { NavigationMenuItem } from '.'

const NavigationMenuItemStory = {
  ...journeysAdminConfig,
  component: NavigationMenuItem,
  title: 'Journeys-Admin/PageWrapper/NavigationDrawer/NavigationMenuItem'
}

const Template: Story = ({ ...args }: NavigationMenuItemProps) => (
  <NavigationMenuItem {...args} />
)

export const Default = Template.bind({})
Default.args = {
  icon: <ExploreRoundedIcon />,
  text: 'Discover',
  color: 'secondary.main'
}

export default NavigationMenuItemStory as Meta
