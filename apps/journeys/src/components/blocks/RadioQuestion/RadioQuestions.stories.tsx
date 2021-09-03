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
  argTypes: {
    id: {
      control: { type: 'disabled' }
    },
    parent: {
      control: { type: 'disabled' }
    },
    action: {
      control: { type: 'disabled' }
    },
    __typename: {
      control: { type: 'disabled' }
    },
    children: {
      control: { type: 'disabled' }
    }
  },
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

export const Primary = Template.bind({})
Primary.args = {
  label: 'Label',
  description: 'Description',
  children: [
    RadioOption.Primary.args,
    RadioOption.Primary.args,
    RadioOption.Primary.args
  ]
}

export const Secondary = Template.bind({})
Secondary.args = {
  label: 'How can we help you know more about Jesus?',
  description:
    'What do you think would be the next step to help you grow in your relationship with Jesus?',
  children: [
    RadioOption.OptionOne.args,
    RadioOption.OptionTwo.args,
    RadioOption.OptionThree.args,
    RadioOption.OptionFour.args
  ]
}

export default Demo as Meta
