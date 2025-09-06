import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/nextjs'
import noop from 'lodash/noop'

import { simpleComponentConfig } from '@core/shared/ui/storybook'

import { listUnsplashCollectionPhotosMock } from './data'
import { UnsplashGallery } from './UnsplashGallery'

const UnsplashGalleryStory: Meta<typeof UnsplashGallery> = {
  ...simpleComponentConfig,
  component: UnsplashGallery,
  title:
    'Journeys-Admin/Editor/Slider/Settings/Drawer/ImageBlockEditor/UnsplashGallery'
}

const Template: StoryObj<typeof UnsplashGallery> = {
  render: () => (
    <MockedProvider mocks={[listUnsplashCollectionPhotosMock]}>
      <UnsplashGallery selectedBlock={null} onChange={noop} />
    </MockedProvider>
  )
}

export const Default = { ...Template }

export default UnsplashGalleryStory
