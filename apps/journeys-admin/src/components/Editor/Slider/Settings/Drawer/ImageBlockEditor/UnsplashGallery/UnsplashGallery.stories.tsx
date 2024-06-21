import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'

import { simpleComponentConfig } from '../../../../../../../libs/storybook'

import { UnsplashGallery } from './UnsplashGallery'
import { listUnsplashCollectionMock } from './data'

const UnsplashGalleryStory: Meta<typeof UnsplashGallery> = {
  ...simpleComponentConfig,
  component: UnsplashGallery,
  title:
    'Journeys-Admin/Editor/Slider/Settings/Drawer/ImageBlockEditor/UnsplashGallery'
}

const Template: StoryObj<typeof UnsplashGallery> = {
  render: () => (
    <MockedProvider mocks={[listUnsplashCollectionMock]}>
      <UnsplashGallery onChange={noop} />
    </MockedProvider>
  )
}

export const Default = { ...Template }

export default UnsplashGalleryStory
