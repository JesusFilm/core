import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'
import { SnackbarProvider } from 'notistack'

import { GET_LANGUAGES } from '@core/journeys/ui/useLanguagesQuery'

import { videosAdminConfig } from '../../../../../../../libs/storybookConfig'
import { CREATE_VIDEO_VARIANT } from '../../../../../../../libs/UploadVideoVariantProvider'

import { AddAudioLanguageDialog } from './AddAudioLanguageDialog'

const meta: Meta<typeof AddAudioLanguageDialog> = {
  title: 'Videos-Admin/Variants/AddAudioLanguageDialog',
  component: AddAudioLanguageDialog,
  parameters: {
    ...videosAdminConfig.parameters,
    tags: ['!autodocs']
  }
}

const Template: Story = {
  render: (args) => (
    <MockedProvider
      mocks={[
        {
          request: {
            query: GET_LANGUAGES,
            variables: { languageId: '529' }
          },
          result: {
            data: {
              languages: [
                {
                  id: '529',
                  name: [
                    { value: 'English', primary: true },
                    { value: 'English', primary: false }
                  ],
                  slug: 'en'
                },
                {
                  id: '496',
                  name: [
                    { value: 'Spanish', primary: true },
                    { value: 'Español', primary: false }
                  ],
                  slug: 'es'
                }
              ]
            }
          }
        },
        {
          request: {
            query: CREATE_VIDEO_VARIANT,
            variables: {
              input: {
                id: '529_video123',
                videoId: 'video123',
                edition: 'base',
                languageId: '529',
                slug: 'video123/en',
                downloadable: true,
                published: true
              }
            }
          },
          result: {
            data: {
              videoVariantCreate: {
                id: 'variant1',
                videoId: 'video123',
                slug: 'video123/en',
                language: {
                  id: '529',
                  name: [
                    { value: 'English', primary: true },
                    { value: 'English', primary: false }
                  ]
                }
              }
            }
          }
        }
      ]}
    >
      <SnackbarProvider>
        
          <AddAudioLanguageDialog {...args} />
        
      </SnackbarProvider>
    </MockedProvider>
  )
}

export default meta

type Story = StoryObj<typeof AddAudioLanguageDialog>

export const Default: Story = {
  ...Template,
  args: {
    open: true,
    handleClose: noop,
    variantLanguagesMap: new Map(),
    editions: [
      {
        id: 'edition1',
        name: 'base',
        videoSubtitles: [
          {
            id: 'subtitle1',
            vttSrc: null,
            srtSrc: null,
            value: 'English Subtitle',
            primary: true,
            vttAsset: null,
            srtAsset: null,
            vttVersion: 0,
            srtVersion: 0,
            language: {
              id: '529',
              slug: 'en',
              name: [{ value: 'English', primary: true }]
            }
          }
        ]
      },
      {
        id: 'edition2',
        name: 'director-cut',
        videoSubtitles: [
          {
            id: 'subtitle2',
            vttSrc: null,
            srtSrc: null,
            value: 'Spanish Subtitle',
            primary: true,
            vttAsset: null,
            srtAsset: null,
            vttVersion: 0,
            srtVersion: 0,
            language: {
              id: '496',
              slug: 'es',
              name: [{ value: 'Spanish', primary: true }]
            }
          }
        ]
      }
    ]
  }
}
