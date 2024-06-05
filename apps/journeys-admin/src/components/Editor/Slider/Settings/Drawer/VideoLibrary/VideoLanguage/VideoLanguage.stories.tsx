import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps, ReactElement, useState } from 'react'

import { LanguageOption } from '@core/shared/ui/LanguageAutocomplete'

import { GetVideo_video_variantLanguages as Language } from '../../../../../../../../__generated__/GetVideo'
import { simpleComponentConfig } from '@core/shared/ui/storybook'

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
    name: [
      {
        value: 'English',
        primary: true,
        __typename: 'Translation'
      }
    ]
  },
  {
    id: '496',
    __typename: 'Language',
    name: [
      {
        value: 'Français',
        primary: true,
        __typename: 'Translation'
      },
      {
        value: 'French',
        primary: false,
        __typename: 'Translation'
      }
    ]
  },
  {
    id: '1106',
    __typename: 'Language',
    name: [
      {
        value: 'Deutsch',
        primary: true,
        __typename: 'Translation'
      },
      {
        value: 'German, Standard',
        primary: false,
        __typename: 'Translation'
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
