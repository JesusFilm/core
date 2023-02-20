import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { watchConfig } from '../../libs/storybook'
import { FilterContainer } from './FilterContainer'

const FilterContainerStory = {
  ...watchConfig,
  component: FilterContainer,
  title: 'Watch/FilterContainer',
  parameters: {
    theme: 'light'
  }
}

const Template: Story<ComponentProps<typeof FilterContainer>> = () => {
  return <FilterContainer />
}

export const Default = Template.bind({})
Default.args = {}

export default FilterContainerStory as Meta
