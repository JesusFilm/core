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
  decorators: [
    (Story) => (
      <Provider store={configureStoreWithState(preloadedState)}>
        <Story />
      </Provider>
    )
  ]
}

const DefaultTemplate: Story<RadioOptionType> = ({ ...props }) => (
  <RadioOption {...props} selected={false} disabled={false} />
)

export const DefaultLabel = DefaultTemplate.bind({})
DefaultLabel.args = {
  id: 'NestedOptions',
  __typename: 'RadioOption',
  label: 'Chat Privately',
  parent: {
    id: 'MoreQuestions'
  }
}

export const LongLabel = DefaultTemplate.bind({})
LongLabel.args = {
  id: 'NestedOptions2',
  __typename: 'RadioOption',
  label:
    'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the ',
  parent: {
    id: 'MoreQuestions'
  }
}

const SelectedTemplate: Story<RadioOptionType> = ({ ...props }) => (
  <RadioOption {...props} selected={true} disabled={false} />
)

export const SelectedLabel = SelectedTemplate.bind({})
SelectedLabel.args = {
  id: 'NestedOptions3',
  __typename: 'RadioOption',
  label: 'Watch more video about Jesus'
}

const DisabledTemplate: Story<RadioOptionType> = ({ ...props }) => (
  <RadioOption {...props} selected={false} disabled={true} />
)

export const DisabledLabel = DisabledTemplate.bind({})
DisabledLabel.args = {
  id: 'NestedOptions4',
  __typename: 'RadioOption',
  label: 'Ask a question'
}

export default Demo as Meta
