import { Meta, StoryObj } from '@storybook/nextjs'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { CardItem } from './CardItem'

const CardItemStory: Meta<typeof CardItem> = {
  ...journeysAdminConfig,
  component: CardItem,
  title: 'Journeys-Admin/CardItem',
  parameters: {
    ...journeysAdminConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof CardItem> = {
  render: ({ ...args }) => <CardItem {...args} />
}

const step = {
  __typename: 'StepBlock',
  id: 'ccd9c0b0-938b-4462-9348-eabab6901f01',
  parentBlockId: null,
  parentOrder: 4,
  locked: false,
  nextBlockId: null,
  children: [
    {
      __typename: 'CardBlock',
      id: 'b431280d-5e9f-498d-b37f-8d29b2dd4e96',
      parentBlockId: 'ccd9c0b0-938b-4462-9348-eabab6901f01',
      parentOrder: 0,
      backgroundColor: null,
      coverBlockId: null,
      themeMode: 'dark',
      themeName: 'base',
      fullscreen: false,
      backdropBlur: null,
      children: []
    }
  ]
}

export const Default = {
  ...Template,
  args: {
    step
  }
}

export default CardItemStory
