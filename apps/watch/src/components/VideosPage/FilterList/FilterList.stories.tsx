import type { Meta, StoryObj } from '@storybook/react'

import { InstantSearchTestWrapper } from '@core/journeys/ui/algolia/InstantSearchTestWrapper'

import { watchConfig } from '../../../libs/storybook'
import { languages } from '../testData'

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
      <InstantSearchTestWrapper indexName="video-variants-stg">
        <FilterList languagesData={{ languages }} languagesLoading={false} />
      </InstantSearchTestWrapper>
    )
  }
}

export const Default = { ...Template }

export default FilterListStory
