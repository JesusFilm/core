import { render } from '@testing-library/react'
import type { TreeBlock } from '@core/journeys/ui'
import { Image } from '@core/journeys/ui'
import { ImageWrapper } from '.'

jest.mock('@core/journeys/ui', () => ({
  __esModule: true,
  Image: jest.fn(() => <></>)
}))

describe('ImageWrapper', () => {
  it('should set blurhash and alt text to empty string', () => {
    const block: TreeBlock = {
      __typename: 'ImageBlock',
      parentBlockId: 'card5.id',
      parentOrder: 0,
      id: 'Image',
      src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
      alt: 'random image from unsplash',
      width: 1600,
      height: 1067,
      blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
      children: []
    }
    render(
      <ImageWrapper block={block}>
        <></>
      </ImageWrapper>
    )
    expect(Image).toHaveBeenCalledWith(
      {
        __typename: 'ImageBlock',
        parentBlockId: 'card5.id',
        parentOrder: 0,
        id: 'Image',
        src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
        alt: '',
        width: 1600,
        height: 1067,
        blurhash: '',
        children: []
      },
      {}
    )
  })

  it('should handle where blurhash is not set', () => {
    const block: TreeBlock = {
      __typename: 'ImageBlock',
      parentBlockId: 'card5.id',
      parentOrder: 0,
      id: 'Image',
      src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
      alt: 'random image from unsplash',
      width: 1600,
      height: 1067,
      blurhash: '',
      children: []
    }
    render(
      <ImageWrapper block={block}>
        <></>
      </ImageWrapper>
    )
    expect(Image).toHaveBeenCalledWith(
      {
        __typename: 'ImageBlock',
        parentBlockId: 'card5.id',
        parentOrder: 0,
        id: 'Image',
        src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
        alt: '',
        width: 1600,
        height: 1067,
        blurhash: '',
        children: []
      },
      {}
    )
  })
})
