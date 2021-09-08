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

const Template: Story<TreeBlock<RadioOptionBlock>> = ({ ...props }) => <RadioOption {...props} />

export const Primary = Template.bind({})
Primary.args = {
  __typename: 'RadioOptionBlock',
  label: 'Label'
}

export default Demo as Meta
