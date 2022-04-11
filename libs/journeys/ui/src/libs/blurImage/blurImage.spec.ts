import { blurImage } from './blurImage'

describe('blurImage', () => {
  const image = {
    id: 'image1.id',
    __typename: 'ImageBlock',
    src: 'https://images.unsplash.com/photo-1508363778367-af363f107cbb?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&dl=chester-wade-hLP7lVm4KUE-unsplash.jpg&w=1920',
    blurhash: 'L9AS}j^-0dVC4Tq[=~PATeXSV?aL',
    width: 1920,
    height: 1080,
    alt: 'random image from unsplash',
    parentBlockId: 'card1.id',
    parentOrder: 0,
    children: []
  }

  it('returns url of blurred image', () => {
    expect(
      blurImage(image.width, image.height, image.blurhash, '#00000088')
    ).toBe(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAABmJLR0QA/wD/AP+gvaeTAAAAGElEQVQokWNkYGD4z0ABYKJE86gBw8YAAFmzAREE4ESyAAAAAElFTkSuQmCC'
    )
  })

  it('returns undefined as fallback', () => {
    // Prevent 2d canvas from being generated
    const createElement = document.createElement.bind(document)
    document.createElement = <K extends keyof HTMLElementTagNameMap>(
      tagName: K
    ) => {
      if (tagName === 'canvas') {
        return {
          getContext: () => null,
          setAttribute: () => ({})
        }
      }
      return createElement(tagName)
    }

    expect(
      blurImage(image.width, image.height, image.blurhash, '#00000088')
    ).toBe(undefined)
  })
})
