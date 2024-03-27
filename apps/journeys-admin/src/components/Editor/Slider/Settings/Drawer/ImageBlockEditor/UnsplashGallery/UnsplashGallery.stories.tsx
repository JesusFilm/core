import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import noop from 'lodash/noop'

import { simpleComponentConfig } from '../../../../../../../libs/storybook'
import { Drawer } from '../../Drawer'

import { listUnsplashCollectionMock } from './data'
import { UnsplashGallery } from './UnsplashGallery'

const UnsplashGalleryStory: Meta<typeof UnsplashGallery> = {
  ...simpleComponentConfig,
  component: UnsplashGallery,
  title:
    'Journeys-Admin/Editor/Slider/Settings/Drawer/ImageBlockEditor/UnsplashGallery'
}

const Template: StoryObj<typeof UnsplashGallery> = {
  render: () => (
    <MockedProvider mocks={[listUnsplashCollectionMock]}>
      <Drawer>
        <UnsplashGallery onChange={noop} />
      </Drawer>
    </MockedProvider>
  )
}

export const Default = { ...Template }

export default UnsplashGalleryStory
