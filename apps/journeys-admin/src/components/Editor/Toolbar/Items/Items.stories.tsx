import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { Items } from './Items'

const Demo: Meta<typeof Items> = {
  ...journeysAdminConfig,
  component: Items,
  title: 'Journeys-Admin/Editor/Toolbar/Items'
}

const Template: StoryObj<ComponentProps<typeof Items>> = {
  render: () => {
    return <Items />
  }
}

export const Default = {
  ...Template
}

export default Demo
