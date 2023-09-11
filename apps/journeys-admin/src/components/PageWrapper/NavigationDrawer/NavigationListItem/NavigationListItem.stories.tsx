import { Meta, StoryObj } from '@storybook/react'

import Journey from '@core/shared/ui/icons/Journey'

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
    icon: <Journey />,
    label: 'Discover',
    selected: false
  }
}

export const Selected = {
  ...Template,
  args: {
    icon: <Journey />,
    label: 'Discover',
    selected: true
  }
}

export const WithBadge = {
  ...Template,
  args: {
    icon: <Journey />,
    label: 'Discover',
    tooltipText: 'tool tip text'
  }
}

export default NavigationListItemStory
