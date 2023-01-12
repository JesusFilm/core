import { Meta, Story } from '@storybook/react'
import { noop } from 'lodash'
import { watchConfig } from '../../../libs/storybook'
import { CurrentFilters } from '.'

const CurrentFiltersStory = {
  ...watchConfig,
  component: CurrentFilters,
  title: 'Watch/VideosPage/CurrentFilters'
}

const Template: Story = ({ ...args }) => {
  return (
    <CurrentFilters
      audioLanguages={{
        value: ['Language1', 'Language2'],
        onDelete: noop
      }}
      subtitleLanguages={{ value: ['Subtitle1'], onDelete: noop }}
    />
  )
}

export const Default = Template.bind({})
Default.args = {
  audioLanguages: {
    value: ['Language1'],
    onDelete: noop
  },
  subtitleLanguages: { value: ['Subtitle1'], onDelete: noop }
}

export default CurrentFiltersStory as Meta
