import type { Meta, StoryObj } from '@storybook/nextjs'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'

import { watchConfig } from '../../../libs/storybook'
import { languages } from '../data'

import { FilterList } from './FilterList'

const FilterListStory: Meta<typeof FilterList> = {
  ...watchConfig,
  component: FilterList,
  title: 'Watch/VideosPage/FilterList',
  parameters: {
    theme: 'light'
  }
}

const Template: StoryObj<typeof FilterList> = {
  render: () => {
    return (
      <InstantSearchTestWrapper>
        <FilterList languagesData={{ languages }} languagesLoading={false} />
      </InstantSearchTestWrapper>
    )
  }
}

export const Default = { ...Template }

export default FilterListStory
