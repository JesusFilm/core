import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded'
import { Meta, StoryObj } from '@storybook/react'

import { simpleComponentConfig } from '../../../../libs/storybook'
import { StyledList } from '../NavigationDrawer'

import { NavigationListItem } from '.'

const NavigationListItemStory: Meta<typeof NavigationListItem> = {
  ...simpleComponentConfig,
  component: NavigationListItem,
  title: 'Journeys-Admin/PageWrapper/NavigationDrawer/NavigationListItem'
}

const Template: StoryObj<typeof NavigationListItem> = {
  render: ({ ...args }) => (
    <StyledList>
      <NavigationListItem {...args} />
    </StyledList>
  )
}

export const Default = {
  ...Template,
  args: {
    icon: <ExploreRoundedIcon />,
    label: 'Discover',
    selected: false
  }
}

export const Selected = {
  ...Template,
  args: {
    icon: <ExploreRoundedIcon />,
    label: 'Discover',
    selected: true
  }
}

export const WithBadge = {
  ...Template,
  args: {
    icon: <ExploreRoundedIcon />,
    label: 'Discover',
    tooltipText: 'tool tip text'
  }
}

export default NavigationListItemStory
