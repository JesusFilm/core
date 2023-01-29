import { Meta, Story } from '@storybook/react'
import { noop } from 'lodash'
import { screen, userEvent } from '@storybook/testing-library'
import { watchConfig } from '../../../libs/storybook'
import { TitlesFilter } from '.'

const TitlesFilterStory = {
  ...watchConfig,
  component: TitlesFilter,
  title: 'Watch/VideosPage/TitlesFilter'
}

const titles = [
  {
    id: '529',
    name: [
      {
        value: 'English',
        primary: true
      }
    ]
  },
  {
    id: '496',
    name: [
      {
        value: 'Français',
        primary: true
      },
      {
        value: 'French',
        primary: false
      }
    ]
  },
  {
    id: '1106',
    name: [
      {
        value: 'Deutsch',
        primary: true
      },
      {
        value: 'German, Standard',
        primary: false
      }
    ]
  }
]

const Template: Story = () => {
  return <TitlesFilter onChange={noop} loading={false} titles={titles} />
}

export const Default = Template.bind({})
Default.play = () => {
  const button = screen.getAllByRole('button', { name: 'Open' })[0]
  userEvent.click(button)
}

export default TitlesFilterStory as Meta
