import { Story, Meta } from '@storybook/react'
import { RadioQuestionType } from '../../../types'
import { RadioQuestion } from './RadioQuestion'
import * as RadioOption from '../RadioOption/RadioOption.stories'

import { Provider } from 'react-redux'
import { configureStoreWithState, RootState } from '../../../libs/store/store'
import { PreloadedState } from 'redux'

let preloadedState: PreloadedState<RootState>

const Demo = {
  component: RadioQuestion,
  title: 'Journeys/Blocks/RadioQuestion',
  decorators: [
    (Story) => (
      <Provider store={configureStoreWithState(preloadedState)}>
        <Story />
      </Provider>
    )
  ]
}

const Template: Story<RadioQuestionType> = ({ ...props }) => (
  <RadioQuestion {...props} />
)

export const Secondary = Template.bind({})
Secondary.args = {
  id: 'MoreQuestions',
  label: 'How can we help you know more about Jesus?',
  description:
    'What do you think would be the next step to help you grow in your relationship with Jesus?',
  children: [RadioOption.DefaultLabel.args, RadioOption.LongLabel.args],
  parent: {
    id: 'Step1'
  }
}

export default Demo as Meta
