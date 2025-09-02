import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'

import { journeysAdminConfig } from '@core/shared/ui/storybook'

import { GetVideo_video_variantLanguages as Language } from '../../../../../../../../../__generated__/GetVideo'
import { ApolloLoadingProvider } from '../../../../../../../../../test/ApolloLoadingProvider'

import { GET_VIDEO } from './LocalDetails'

import { LocalDetails } from '.'

const LocalDetailsStory: Meta<typeof LocalDetails> = {
  ...journeysAdminConfig,
  component: LocalDetails,
  title:
    'Journeys-Admin/Editor/Slider/Settings/Drawer/VideoLibrary/VideoFromLocal/LocalDetails',
  argTypes: { onSelect: { action: 'clicked' } }
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

const Template: StoryObj<typeof LocalDetails> = {
  render: ({ id, onSelect }) => {
    return (
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_VIDEO,
              variables: {
                id: '2_Acts7302-0-0',
                languageId: '529'
              }
            },
            result: {
              data: {
                video: {
                  id: '2_Acts7302-0-0',
                  image:
                    'https://d1wl257kev7hsz.cloudfront.net/cinematics/2_Acts7302-0-0.mobileCinematicHigh.jpg',
                  primaryLanguageId: '529',
                  title: [
                    {
                      primary: true,
                      value: 'Jesus Taken Up Into Heaven'
                    }
                  ],
                  description: [
                    {
                      primary: true,
                      value:
                        'Jesus promises the Holy Spirit; then ascends into the clouds.'
                    }
                  ],
                  variant: {
                    id: 'variantA',
                    duration: 144,
                    hls: 'https://arc.gt/opsgn'
                  },
                  variantLanguages: languages
                }
              }
            }
          }
        ]}
      >
        <LocalDetails id={id} open onSelect={onSelect} />
      </MockedProvider>
    )
  }
}

export const Default = {
  ...Template,
  args: {
    id: '2_Acts7302-0-0'
  }
}

export const Loading: StoryObj<typeof LocalDetails> = {
  render: ({ id, onSelect }) => {
    return (
      <ApolloLoadingProvider>
        <LocalDetails id={id} open onSelect={onSelect} />
      </ApolloLoadingProvider>
    )
  },
  args: {
    id: '2_Acts7302-0-0'
  }
}

export default LocalDetailsStory
