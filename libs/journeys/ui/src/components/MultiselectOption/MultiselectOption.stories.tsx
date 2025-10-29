import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps } from 'react'

import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import { StoryCard } from '../StoryCard'

import { MultiselectOption } from '.'

const Demo: Meta<typeof MultiselectOption> = {
  ...simpleComponentConfig,
  component: MultiselectOption,
  title: 'Journeys-Ui/MultiselectQuestion/MultiselectOption'
}

type Story = StoryObj<ComponentProps<typeof MultiselectOption>>

const Template: Story = {
  render: ({ ...args }) => (
    <StoryCard>
      <MultiselectOption {...args} />
    </StoryCard>
  )
}

export const Default = {
  ...Template,
  args: {
    id: 'Option1',
    label: 'Chat Privately',
    selected: false,
    disabled: false
  }
}

export const Long = {
  ...Template,
  args: {
    ...Default.args,
    id: 'Option2',
    label:
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the '
  }
}

export const Selected = {
  ...Template,
  args: {
    id: 'Option3',
    label: 'Watch more videos about Jesus',
    selected: true,
    disabled: false
  }
}

export const Disabled = {
  ...Template,
  args: {
    id: 'Option4',
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
