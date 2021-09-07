import { Story, Meta } from '@storybook/react'
import { RadioQuestionType } from '../../../types'
import { RadioQuestion } from './RadioQuestion'
import * as RadioOption from '../RadioOption/RadioOption.stories'
import { journeysConfig } from '../../../libs/storybook/decorators'

const Demo = {
  ...journeysConfig,
  component: RadioQuestion,
  title: 'Journeys/Blocks/RadioQuestion'
}

const Template: Story<RadioQuestionType> = ({ ...props }) => <RadioQuestion {...props} />

export const Primary = Template.bind({})
Primary.args = {
  label: 'Label',
  description: 'Description',
  children: [RadioOption.Primary.args, RadioOption.Primary.args, RadioOption.Primary.args]
}

export default Demo as Meta
