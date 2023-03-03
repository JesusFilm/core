import { MockedProvider } from '@apollo/client/testing'
import { Story, Meta } from '@storybook/react'
import { noop } from 'lodash'
import { simpleComponentConfig } from '../../../../libs/storybook'
import { listUnsplashCollectionMock } from './data'
import { UnsplashGallery } from './UnsplashGallery'

const UnsplashGalleryStory = {
  ...simpleComponentConfig,
  component: UnsplashGallery,
  title: 'Journeys-Admin/Editor/ImageBlockEditor/UnsplashGallery'
}

const Template: Story = () => (
  <MockedProvider mocks={[listUnsplashCollectionMock]}>
    <UnsplashGallery onChange={noop} />
  </MockedProvider>
)

export const Default = Template.bind({})

export default UnsplashGalleryStory as Meta
