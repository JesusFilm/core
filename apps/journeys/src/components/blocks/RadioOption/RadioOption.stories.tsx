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
    className: {
      table: { disable: true }
    },
    image: {
      table: { disable: true }
    },
    action: {
      table: { disable: true }
    },
    __typename: {
      table: { disable: true }
    },
    id: {
      table: { disable: true }
    },
    parent: {
      table: { disable: true }
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
  <RadioOption {...props} selectedId="" />
)

export const Primary = Template.bind({})
Primary.args = {
  __typename: 'RadioOption',
  label: 'Label'
}

export const DefaultLabel = Template.bind({})
DefaultLabel.args = {
  id: 'NestedOptions',
  __typename: 'RadioOption',
  label: 'Chat Privately',
  parent: {
    id: 'MoreQuestions'
  }
}

export const LongLabel = Template.bind({})
LongLabel.args = {
  id: 'NestedOptions2',
  __typename: 'RadioOption',
  label:
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the ',
  parent: {
    id: 'MoreQuestions'
  }
}

const Template2: Story<RadioOptionType> = ({ ...props }) => (
  <RadioOption {...props} selectedId="NestedOptions3" />
)

export const SelectedLabel = Template2.bind({})
SelectedLabel.args = {
  id: 'NestedOptions3',
  __typename: 'RadioOption',
  label: 'Watch more video about Jesus'
}

export const DisabledLabel = Template2.bind({})
DisabledLabel.args = {
  id: 'NestedOptions4',
  __typename: 'RadioOption',
  label: 'Ask a question'
}

export default Demo as Meta
