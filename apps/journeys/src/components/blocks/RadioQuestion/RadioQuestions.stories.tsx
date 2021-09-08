import { Story, Meta } from '@storybook/react'
import { RadioQuestion } from './RadioQuestion'
import { GetJourney_journey_blocks_RadioQuestionBlock as RadioQuestionBlock } from '../../../../__generated__/GetJourney'
import { TreeBlock } from '../../../libs/transformer/transformer'
import * as RadioOption from '../RadioOption/RadioOption.stories'
import { journeysConfig } from '../../../libs/storybook/decorators'

const Demo = {
  ...journeysConfig,
  component: RadioQuestion,
  title: 'Journeys/Blocks/RadioQuestion'
}

const Template: Story<TreeBlock<RadioQuestionBlock>> = ({ ...props }) => <RadioQuestion {...props} />

export const Primary = Template.bind({})
Primary.args = {
  label: 'Label',
  description: 'Description',
  children: [RadioOption.Primary.args, RadioOption.Primary.args, RadioOption.Primary.args]
}

export default Demo as Meta
