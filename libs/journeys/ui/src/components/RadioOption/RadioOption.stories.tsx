import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import { StoryCard } from '../StoryCard'

import { RadioOption } from '.'

const Demo: Meta<typeof RadioOption> = {
  ...simpleComponentConfig,
  component: RadioOption,
  title: 'Journeys-Ui/RadioQuestion/RadioOption'
}

type Story = StoryObj<ComponentProps<typeof RadioOption>>

const Template: Story = {
  render: ({ ...args }) => (
    <StoryCard>
      <RadioOption {...args} />
    </StoryCard>
  )
}

export const Default = {
  ...Template,
  args: {
    id: 'NestedOptions',
    label: 'Chat Privately',
    selected: false,
    disabled: false
  }
}

export const Long = {
  ...Template,
  args: {
    ...Default.args,
    id: 'NestedOptions2',
    label:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the '
  }
}

export const Selected = {
  ...Template,
  args: {
    id: 'NestedOptions3',
    label: 'Watch more videos about Jesus',
    selected: true,
    disabled: false
  }
}

export const Disabled = {
  ...Template,
  args: {
    id: 'NestedOptions4',
    label: 'Ask a question',
    selected: false,
    disabled: true
  }
}

export const RTL = {
  ...Template,
  args: { ...Default.args },
  parameters: { rtl: true }
}

export default Demo
