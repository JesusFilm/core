import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/test'
import noop from 'lodash/noop'

import { watchConfig } from '../../../../libs/storybook'

import { LanguagesFilter } from '.'

const LanguagesFilterStory: Meta<typeof LanguagesFilter> = {
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

const Template: StoryObj<typeof LanguagesFilter> = {
  render: () => {
    return (
      <LanguagesFilter onChange={noop} loading={false} languages={languages} />
    )
  }
}

export const Default = {
  ...Template,
  play: async () => {
    const button = screen.getAllByRole('button', { name: 'Open' })[0]
    await userEvent.click(button)
  }
}

export default LanguagesFilterStory
