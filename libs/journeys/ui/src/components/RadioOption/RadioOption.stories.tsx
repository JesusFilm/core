import { ComponentStory, Meta } from '@storybook/react'
import { simpleComponentConfig } from '../../libs/simpleComponentConfig'
import { StoryCard } from '../StoryCard'
import { RadioOption } from '.'

const Demo = {
  ...simpleComponentConfig,
  component: RadioOption,
  title: 'Journeys-Ui/RadioQuestion/RadioOption'
}

const Template: ComponentStory<typeof RadioOption> = ({ ...args }) => (
  <StoryCard>
    <RadioOption {...args} />
  </StoryCard>
)

export const Default = Template.bind({})
Default.args = {
  id: 'NestedOptions',
  label: 'Chat Privately',
  selected: false,
  disabled: false
}

export const Long = Template.bind({})
Long.args = {
  id: 'NestedOptions2',
  label:
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the ',
  selected: false,
  disabled: false
}

export const Selected = Template.bind({})
Selected.args = {
  id: 'NestedOptions3',
  label: 'Watch more videos about Jesus',
  selected: true,
  disabled: false
}

export const Disabled = Template.bind({})
Disabled.args = {
  id: 'NestedOptions4',
  label: 'Ask a question',
  selected: false,
  disabled: true
}

export default Demo as Meta
