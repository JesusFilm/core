import { Story, Meta } from '@storybook/react'
import { RadioOptionType } from '../../../types'
import RadioOption from './RadioOption'

import { Provider } from 'react-redux'
import { configureStoreWithState, RootState } from '../../../libs/store/store'
import { PreloadedState } from 'redux'

let preloadedState: PreloadedState<RootState>

const Demo = {
  component: RadioOption,
  title: 'Journeys/Blocks/RadioOption',
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
    image: {
      control: { type: 'disabled' }
    },
    className: {
      control: { type: 'disabled' }
    },
    __typename: {
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

const Template: Story<RadioOptionType> = ({ ...props }) => (
  <RadioOption {...props} />
)

export const Primary = Template.bind({})
Primary.args = {
  __typename: 'RadioOption',
  label: 'Label'
}

export const OptionOne = Template.bind({})
OptionOne.args = {
  __typename: 'RadioOption',
  label: 'Chat Privately'
}

export const OptionTwo = Template.bind({})
OptionTwo.args = {
  __typename: 'RadioOption',
  label: 'Get a bible'
}

export const OptionThree = Template.bind({})
OptionThree.args = {
  __typename: 'RadioOption',
  label: 'Watch more videos about Jesus'
}

export const OptionFour = Template.bind({})
OptionFour.args = {
  __typename: 'RadioOption',
  label: 'Ask a question'
}

export default Demo as Meta
