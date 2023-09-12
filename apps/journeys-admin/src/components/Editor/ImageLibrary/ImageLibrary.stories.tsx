import { MockedProvider } from '@apollo/client/testing'
import { Meta, StoryObj } from '@storybook/react'
import { ComponentProps, ReactElement, useState } from 'react'

import { FlagsProvider } from '@core/shared/ui/FlagsProvider'

import { simpleComponentConfig } from '../../../libs/storybook'
import { listUnsplashCollectionMock } from '../ImageBlockEditor/UnsplashGallery/data'

import { ImageLibrary } from '.'

const ImageLibraryStory: Meta<typeof ImageLibrary> = {
  ...simpleComponentConfig,
  component: ImageLibrary,
  title: 'Journeys-Admin/Editor/ImageLibrary'
}

const ImageLibraryComponent = (args): ReactElement => {
  const [open, setOpen] = useState(true)

  return (
    <FlagsProvider flags={{ segmind: args.segmind }}>
      <MockedProvider mocks={[listUnsplashCollectionMock]}>
        <ImageLibrary open={open} onClose={() => setOpen(false)} {...args} />
      </MockedProvider>
    </FlagsProvider>
  )
}

const Template: StoryObj<
  ComponentProps<typeof ImageLibrary> & { segmind: boolean }
> = {
  render: ({ ...args }) => <ImageLibraryComponent {...args} />
}

export const Default = {
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
    segmind: false
  }
}

export const WithSegmind = {
  ...Default,
  args: {
    segmind: true
  }
}

export default ImageLibraryStory
