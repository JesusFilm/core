import { Story, Meta } from '@storybook/react'
import {
  journeyUiConfig,
  simpleComponentConfig,
  StoryCard
} from '../../..'
import { RadioOption, RadioOptionProps } from '.'

const Demo = {
  ...journeyUiConfig,
  ...simpleComponentConfig,
  component: RadioOption,
  title: 'Journeys-Ui/RadioQuestion/RadioOption'
}

const Template: Story<RadioOptionProps> = ({ ...props }) => (
  <StoryCard>
    <RadioOption {...props} />
  </StoryCard>
)

export const Default: Story<RadioOptionProps> = Template.bind({})
Default.args = {
  id: 'NestedOptions',
  label: 'Chat Privately',
  selected: false,
  disabled: false
}

export const Long: Story<RadioOptionProps> = Template.bind({})
Long.args = {
  id: 'NestedOptions2',
  label:
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the ',
  selected: false,
  disabled: false
}

export const Selected: Story<RadioOptionProps> = Template.bind({})
Selected.args = {
  id: 'NestedOptions3',
  label: 'Watch more videos about Jesus',
  selected: true,
  disabled: false
}

export const Disabled: Story<RadioOptionProps> = Template.bind({})
Disabled.args = {
  id: 'NestedOptions4',
  label: 'Ask a question',
  selected: false,
  disabled: true
}

export default Demo as Meta
