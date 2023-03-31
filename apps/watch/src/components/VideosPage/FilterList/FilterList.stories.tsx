import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import { watchConfig } from '../../../libs/storybook'
import { languages } from '../testData'
import { FilterList } from './FilterList'

const FilterListStory = {
  ...watchConfig,
  component: FilterList,
  title: 'Watch/FilterList',
  argTypes: { onChange: { action: 'onChange' } },
  parameters: {
    theme: 'light'
  }
}

const Template: Story<ComponentProps<typeof FilterList>> = ({ onChange }) => {
  return (
    <FilterList
      filter={{}}
      onChange={onChange}
      languagesData={{ languages }}
      languagesLoading={false}
    />
  )
}

export const Default = Template.bind({})
Default.args = {}

export default FilterListStory as Meta
