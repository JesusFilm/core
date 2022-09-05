import { Meta, Story } from '@storybook/react'
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { NavigationListItemProps } from './NavigationListItem'
import { NavigationListItem } from '.'

const NavigationListItemStory = {
  ...journeysAdminConfig,
  component: NavigationListItem,
  title: 'Journeys-Admin/PageWrapper/NavigationDrawer/NavigationListItem'
}

const Template: Story = ({ ...args }: NavigationListItemProps) => (
  <NavigationListItem {...args} />
)

export const Default = Template.bind({})
Default.args = {
  icon: <ExploreRoundedIcon />,
  text: 'Discover',
  color: 'secondary.main'
}

export default NavigationListItemStory as Meta
