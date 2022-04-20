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
      blurImage(image.width, image.height, image.blurhash, '#000000')
    ).toBe(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAJCAYAAAA7KqwyAAAABmJLR0QA/wD/AP+gvaeTAAABA0lEQVQokV2RMY4cQQwDi5S69x7hwP9/ngMfPDstOpiFAwcVECAqIPXz60fUxq9F7UWtRlUgmBzuuXnfF3+ui+/r4tcVcgumQIUFiHyA/7OTB0IRXgwk/2h7kEwBxVNWHpMIEMIQDskNOSjFdwQR3Q0YymCLspCFFAJYIAVxkN/IN9JCMr8R7W1k4/WhC7uQgIhocAq30Qh6gMNkCEPr1ciFeuG18VrUR6A55AhrEAdyCHBKdERJNHuBC9ZGe6NeqJoSaAZuM3pGJcNI1ARjpKKzFlTBWrAX6o26EcJzwEKEZPAcDDiDgNh0usFFqqEb1kJVjyB+XjgL1xvXwjMoNxKMzF9Ukn10nay9yQAAAABJRU5ErkJggg=='
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
      blurImage(image.width, image.height, image.blurhash, '#000000')
    ).toBe(undefined)
  })

  it('returns undefined if blurhash is empty string', () => {
    expect(blurImage(image.width, image.height, '', '#00000088')).toBe(
      undefined
    )
  })
})
