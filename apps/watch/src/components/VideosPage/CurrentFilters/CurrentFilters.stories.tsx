import { Meta, Story } from '@storybook/react'
import { noop } from 'lodash'
import { watchConfig } from '../../../libs/storybook'
import { bigFilter, filter, languages } from '../testData'
import { CurrentFilters } from '.'

const CurrentFiltersStory = {
  ...watchConfig,
  component: CurrentFilters,
  title: 'Watch/VideosPage/CurrentFilters'
}

const Template: Story = ({ ...args }) => {
  return (
    <CurrentFilters
      onDelete={noop}
      languages={args.languages}
      filter={filter}
    />
  )
}

export const Default = Template.bind({})
Default.args = {
  languages,
  filter
}

export const Excess = Template.bind({})
Excess.args = {
  filter: bigFilter,
  languages
}

export default CurrentFiltersStory as Meta
