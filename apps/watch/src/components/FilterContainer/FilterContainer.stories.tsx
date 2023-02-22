import { ComponentProps } from 'react'
import { Story, Meta } from '@storybook/react'
import TextField from '@mui/material/TextField'
import { watchConfig } from '../../libs/storybook'
import { LanguagesFilter } from '../VideosPage/LanguagesFilter'
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
  return (
    <FilterContainer
      audioSwitcher={
        <LanguagesFilter onChange={() => null} languages={[]} loading={false} />
      }
      subtitleSwitcher={
        <LanguagesFilter
          onChange={() => null}
          languages={[]}
          loading={false}
          helperText="54 languages"
        />
      }
      titleSearch={
        <TextField
          onChange={() => null}
          label="Search Titles"
          variant="outlined"
          helperText="724+ titles"
        />
      }
    />
  )
}

export const Default = Template.bind({})
Default.args = {}

export default FilterContainerStory as Meta
