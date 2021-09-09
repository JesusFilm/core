import { Story, Meta } from '@storybook/react'
import RadioOption from './RadioOption'
import { journeysConfig } from '../../../libs/storybook/decorators'
import { GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'

const Demo = {
  ...journeysConfig,
  component: RadioOption,
  title: 'Journeys/Blocks/RadioOption'
}

const DefaultTemplate: Story<TreeBlock<RadioOptionBlock>> = ({ ...props }) => (
  <RadioOption {...props} selected={false} disabled={false} />
)

export const Default: Story<TreeBlock<RadioOptionBlock>> = DefaultTemplate.bind({})
Default.args = {
  id: 'NestedOptions',
  label: 'Chat Privately'
}

export const Long: Story<TreeBlock<RadioOptionBlock>> = DefaultTemplate.bind({})
Long.args = {
  id: 'NestedOptions2',
  label:
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the '
}

const SelectedTemplate: Story<TreeBlock<RadioOptionBlock>> = ({ ...props }) => (
  <RadioOption {...props} selected={true} disabled={false} />
)

export const Selected: Story<TreeBlock<RadioOptionBlock>> = SelectedTemplate.bind({})
Selected.args = {
  id: 'NestedOptions3',
  label: 'Watch more videos about Jesus'
}

const DisabledTemplate: Story<TreeBlock<RadioOptionBlock>> = ({ ...props }) => (
  <RadioOption {...props} selected={false} disabled={true} />
)

export const Disabled: Story<TreeBlock<RadioOptionBlock>> = DisabledTemplate.bind({})
Disabled.args = {
  id: 'NestedOptions4',
  label: 'Ask a question'
}

export default Demo as Meta
