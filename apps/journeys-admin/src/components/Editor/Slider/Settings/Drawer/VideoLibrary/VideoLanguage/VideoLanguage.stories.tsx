import { Meta, StoryObj } from '@storybook/nextjs'
import { ComponentProps, ReactElement, useState } from 'react'

import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { GetVideo_video_variantLanguages as Language } from '../../../../../../../../__generated__/GetVideo'

import { VideoLanguagePicker } from '.'

const VideoLanguagePickerStory: Meta<
  ComponentProps<typeof VideoLanguagePicker> & {
    onSelect: { action: string }
  }
> = {
  ...simpleComponentConfig,
  component: VideoLanguagePicker,
  title:
    'Journeys-Admin/Editor/Slider/Settings/Drawer/VideoLibrary/VideoLanguagePicker',
  argTypes: { onSelect: { action: 'onSelect' } }
}

const languages: Language[] = [
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

const VideoLanguagePickerComponent = ({ onSelect }): ReactElement => {
  const [language, setLanguage] = useState<LanguageOption>({
    id: '529',
    localName: undefined,
    nativeName: 'English'
  })
  const handleChange = (language: LanguageOption): void => {
    setLanguage(language)
    onSelect(language)
  }

  return (
    <VideoLanguagePicker
      onChange={handleChange}
      language={language}
      languages={languages}
      loading={false}
    />
  )
}

const Template: StoryObj<
  ComponentProps<typeof VideoLanguagePicker> & {
    onSelect: { action: string }
  }
> = {
  render: ({ onSelect }) => <VideoLanguagePickerComponent onSelect={onSelect} />
}

export const Default = { ...Template }

export default VideoLanguagePickerStory
