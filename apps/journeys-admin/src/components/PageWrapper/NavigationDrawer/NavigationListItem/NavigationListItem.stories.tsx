import { Meta, Story } from '@storybook/react'
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded'
import { journeysAdminConfig } from '../../../../libs/storybook'
import { NavigationListItemProps } from './NavigationListItem'
import { NavigationListItem } from '.'

// jest.mock('react-i18next', () => ({
//   __esModule: true,
//   useTranslation: () => {
//     return {
//       t: (str: string) => str
//     }
//   }
// }))

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
  label: 'Discover',
  selected: false
}

export const Selected = Template.bind({})
Selected.args = {
  icon: <ExploreRoundedIcon />,
  label: 'Discover',
  selected: true
}

export default NavigationListItemStory as Meta
