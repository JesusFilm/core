import { Meta, Story } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'
import noop from 'lodash/noop'

import { watchConfig } from '../../../../libs/storybook'

import { LanguagesFilter } from '.'

const LanguagesFilterStory = {
  ...watchConfig,
  component: LanguagesFilter,
  title: 'Watch/VideosPage/LanguagesFilter'
}

const languages = [
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
  return (
    <LanguagesFilter onChange={noop} loading={false} languages={languages} />
  )
}

export const Default = Template.bind({})
Default.play = () => {
  const button = screen.getAllByRole('button', { name: 'Open' })[0]
  userEvent.click(button)
}

export default LanguagesFilterStory as Meta
