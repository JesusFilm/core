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
    Story => (
      <Provider store={configureStoreWithState(preloadedState)}>
        <Story/>
      </Provider>
    )
  ]
}

const Template: Story<RadioOptionType> = ({ ...props }) => <RadioOption {...props} />

export const Primary = Template.bind({})
Primary.args = {
  __typename: 'RadioOption',
  label: 'Label'
}

export default Demo as Meta
