import { Story, Meta } from '@storybook/react'
import { RadioOptionType } from '../../../types'
import RadioOption from './RadioOption'
import { journeysConfig } from '../../../libs/storybook/decorators'

const Demo = {
  ...journeysConfig,
  component: RadioOption,
  title: 'Journeys/Blocks/RadioOption'
}

const DefaultTemplate: Story<RadioOptionType> = ({ ...props }) => (
  <RadioOption {...props} selected={false} disabled={false} />
)

export const DefaultLabel = DefaultTemplate.bind({})
DefaultLabel.args = {
  id: 'NestedOptions',
  label: 'Chat Privately',
  parent: {
    id: 'MoreQuestions'
  }
}

export const LongLabel = DefaultTemplate.bind({})
LongLabel.args = {
  id: 'NestedOptions2',
  label:
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the ',
  parent: {
    id: 'MoreQuestions'
  }
}

const SelectedTemplate: Story<RadioOptionType> = ({ ...props }) => (
  <RadioOption {...props} selected={true} disabled={false} />
)

export const SelectedLabel = SelectedTemplate.bind({})
SelectedLabel.args = {
  id: 'NestedOptions3',
  label: 'Watch more video about Jesus'
}

const DisabledTemplate: Story<RadioOptionType> = ({ ...props }) => (
  <RadioOption {...props} selected={false} disabled={true} />
)

export const DisabledLabel = DisabledTemplate.bind({})
DisabledLabel.args = {
  id: 'NestedOptions4',
  label: 'Ask a question'
}

export default Demo as Meta
