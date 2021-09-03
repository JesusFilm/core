import { Story, Meta } from '@storybook/react'
import { RadioOptionType } from '../../../types'
import RadioOption from './RadioOption'
import { journeysConfig } from '../../../libs/storybook/decorators'

const Demo = {
  ...journeysConfig,
  component: RadioOption,
  title: 'Journeys/Blocks/RadioOption'
}

const Template: Story<RadioOptionType> = ({ ...props }) => <RadioOption {...props} />

export const Primary = Template.bind({})
Primary.args = {
  __typename: 'RadioOption',
  label: 'Label'
}

export default Demo as Meta
