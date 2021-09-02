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
    Story => (
      <Provider store={configureStoreWithState(preloadedState)}>
        <Story/>
      </Provider>
    )
  ]
}

const Template: Story<RadioQuestionType> = ({ ...props }) => <RadioQuestion {...props} />

console.log(RadioOption.Primary.args)

export const Primary = Template.bind({})
Primary.args = {
  label: 'Label',
  description: 'Description',
  children: [RadioOption.Primary.args, RadioOption.Primary.args, RadioOption.Primary.args]
}

export default Demo as Meta
