import { Meta, StoryObj } from '@storybook/nextjs'
import { screen, userEvent } from 'storybook/test'
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
    __typename: 'Language',
    id: '529',
    slug: 'english',
    name: [
      {
        value: 'English',
        primary: true,
        __typename: 'LanguageName'
      }
    ]
  },
  {
    id: '496',
    __typename: 'Language',
    slug: 'french',
    name: [
      {
        value: 'Français',
        primary: true,
        __typename: 'LanguageName'
      },
      {
        value: 'French',
        primary: false,
        __typename: 'LanguageName'
      }
    ]
  },
  {
    id: '1106',
    __typename: 'Language',
    slug: 'german-standard',
    name: [
      {
        value: 'Deutsch',
        primary: true,
        __typename: 'LanguageName'
      },
      {
        value: 'German, Standard',
        primary: false,
        __typename: 'LanguageName'
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
