import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { screen, userEvent } from '@storybook/testing-library'

import { simpleComponentConfig } from '../../../../../../libs/storybook'
import { Drawer } from '../Drawer'

import { ImageBlockEditor } from './ImageBlockEditor'
import { listUnsplashCollectionMock } from './UnsplashGallery/data'

const ImageBlockEditorStory: Meta<typeof ImageBlockEditor> = {
  ...simpleComponentConfig,
  component: ImageBlockEditor,
  title: 'Journeys-Admin/Editor/Slider/Settings/Drawer/ImageBlockEditor',
  parameters: {
    ...simpleComponentConfig.parameters,
    layout: 'fullscreen'
  }
}

const Template: StoryObj<typeof ImageBlockEditor> = {
  render: (args) => (
    <MockedProvider mocks={[listUnsplashCollectionMock]}>
      <Drawer title="Image">
        <ImageBlockEditor {...args} />
      </Drawer>
    </MockedProvider>
  )
}

export const Default = {
  ...Template
}

export const Filled = {
  ...Template,
  args: {
    selectedBlock: {
      id: 'imageBlockId',
      __typename: 'ImageBlock',
      src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
      alt: 'random image from unsplash',
      width: 1600,
      height: 1067,
      blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
      parentBlockId: 'card',
      parentOrder: 0,
      children: []
    },
    title: 'Image title',
    alt: 'Image alt',
    onChange: () => {
      return null
    }
  }
}

export const Custom = {
  ...Template
}
Custom.play = async () => {
  await userEvent.click(screen.getByRole('tab', { name: 'Custom' }))
}

export const CustomUrl = {
  ...Template
}
CustomUrl.play = async () => {
  await userEvent.click(screen.getByRole('tab', { name: 'Custom' }))
  await userEvent.click(
    screen.getByRole('button', { name: 'Add image by URL' })
  )
}

export const AI = {
  ...Template
}
AI.play = async () => {
  await userEvent.click(screen.getByRole('tab', { name: 'AI' }))
}

export default ImageBlockEditorStory
