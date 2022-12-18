import { MockedProvider } from '@apollo/client/testing'
import { ComponentProps, useState } from 'react'
import { Meta, Story } from '@storybook/react'
import { watchConfig } from '../../libs/storybook'
import { GET_VIDEO_LANGUAGES } from '../VideoContentPage/AudioLanguageButton'
import { AudioLanguageDialog } from '.'

const AudioLanguageDialogStory = {
  ...watchConfig,
  component: AudioLanguageDialog,
  title: 'Watch/AudioLanguageDialog'
}

const Template: Story<ComponentProps<typeof AudioLanguageDialog>> = ({
  ...args
}) => {
  const [open, setOpen] = useState(true)
  const slug = 'the-story-of-jesus-for-children/english'

  return (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GET_VIDEO_LANGUAGES,
            variables: {
              id: slug
            }
          },
          result: {
            data: {
              video: {
                id: '1_jf-0-0',
                variant: args.variant,
                variantLanguagesWithSlug: args.variantLanguagesWithSlug
              }
            }
          }
        }
      ]}
    >
      <AudioLanguageDialog
        {...args}
        open={open}
        onClose={() => setOpen(false)}
      />
    </MockedProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  variant: {
    id: '529',
    __typename: 'VideoVariant',
    language: {
      __typename: 'Language',
      name: [
        {
          value: 'English',
          primary: true,
          __typename: 'Translation'
        }
      ]
    }
  },
  variantLanguagesWithSlug: [
    {
      __typename: 'LanguageWithSlug',
      slug: 'the-story-of-jesus-for-children/english',
      language: {
        id: '529',
        __typename: 'Language',
        name: [
          {
            value: 'English',
            primary: true,
            __typename: 'Translation'
          }
        ]
      }
    },
    {
      __typename: 'LanguageWithSlug',
      slug: 'the-story-of-jesus-for-children/french',
      language: {
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
      }
    },
    {
      __typename: 'LanguageWithSlug',
      slug: 'the-story-of-jesus-for-children/Deutsch',
      language: {
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
    }
  ],
  loading: false
}

export default AudioLanguageDialogStory as Meta
