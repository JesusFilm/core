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
  return <CurrentFilters onDelete={noop} languageFilters={args.languages} />
}

export const Default = Template.bind({})
Default.args = {
  languages: [
    {
      id: '1',
      nativeName: 'English'
    },
    {
      id: '2',
      nativeName: 'French'
    },
    {
      id: '3',
      nativeName: 'Chinese'
    }
  ]
}

export const Excess = Template.bind({})
Excess.args = {
  languages: [
    {
      id: '1',
      nativeName: 'English'
    },
    {
      id: '2',
      nativeName: 'French'
    },
    {
      id: '3',
      nativeName: 'Chinese'
    },
    {
      id: '4',
      nativeName: 'Arabic'
    },
    {
      id: '5',
      nativeName: 'German'
    },
    {
      id: '6',
      nativeName: 'Hindi'
    },
    {
      id: '7',
      nativeName: 'Zulu'
    },
    {
      id: '8',
      nativeName: 'Sara'
    },
    {
      id: '9',
      nativeName: 'Ngulu'
    },
    {
      id: '10',
      nativeName: 'Vietnamese'
    },
    {
      id: '11',
      nativeName: 'Greek'
    }
  ]
}

export default CurrentFiltersStory as Meta
