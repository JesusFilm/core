import { Meta, StoryObj } from '@storybook/react'

import { watchConfig } from '../../../libs/storybook'
import { languages } from '../testData'

import { FilterList } from './FilterList'

const FilterListStory: Meta<typeof FilterList> = {
  ...watchConfig,
  component: FilterList,
  title: 'Watch/VideosPage/FilterList',
  argTypes: { onChange: { action: 'onChange' } },
  parameters: {
    theme: 'light'
  }
}

const Template: StoryObj<typeof FilterList> = {
  render: ({ onChange }) => {
    return (
      <FilterList
        filter={{}}
        onChange={onChange}
        languagesData={{ languages }}
        languagesLoading={false}
      />
    )
  }
}

export const Default = { ...Template }

export default FilterListStory
