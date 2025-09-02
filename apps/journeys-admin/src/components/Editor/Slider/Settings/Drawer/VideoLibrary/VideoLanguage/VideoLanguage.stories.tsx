import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps, ReactElement, useState } from 'react'

import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { GetVideo_video_variantLanguages as Language } from '../../../../../../../../__generated__/GetVideo'

import { VideoLanguage } from '.'

const VideoLanguageStory: Meta<
  ComponentProps<typeof VideoLanguage> & { onSelect: { action: string } }
> = {
  ...simpleComponentConfig,
  component: VideoLanguage,
  title:
    'Journeys-Admin/Editor/Slider/Settings/Drawer/VideoLibrary/VideoLanguage',
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

const VideoLanguageComponent = ({ onSelect }): ReactElement => {
  const [open, setOpen] = useState(true)
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
    <VideoLanguage
      open={open}
      onClose={() => setOpen(false)}
      onChange={handleChange}
      language={language}
      languages={languages}
      loading={false}
    />
  )
}

const Template: StoryObj<
  ComponentProps<typeof VideoLanguage> & { onSelect: { action: string } }
> = {
  render: ({ onSelect }) => <VideoLanguageComponent onSelect={onSelect} />
}

export const Default = { ...Template }

export default VideoLanguageStory
