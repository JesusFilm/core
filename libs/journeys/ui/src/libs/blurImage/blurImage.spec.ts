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
    expect(blurImage(image.blurhash, '#000000')).toBe(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAECklEQVRYhY2X667jNgyEv6FdoA9RoO//hm13w+kPUpSck9NuAsG2HInDGV4U/fn7H5ZAV9S4L3QFcV3EFSgChUA9AGPsJJ1kJpkvXj1+vmr8eL3452X+ehmn4CWwgKjRe0Vd/ufjbx/+8/Mre8eXjf228IM99eRXAwaMMOrfBYD9tpHnMegfrw3VL/XJ+PG813iPA7xcxq/3TbyM1zX02NCP+wEEvbkPYOv9E3zMqOfL9VyGDzBNSqyF70BOeh/vzBiWN8iT9vI+CZsLc4/hE0iNW3JHZBvVu1d8BLOYXTobCEw2A8ZcJAncQJL89LVdd+10LwuVZe2JTkn0NLw2ON6qjXuu9Q2KASNuB4nJpb9qj1vNq6SHx4IB8s7CAhJAfgGxvkmQbJ9r7m+uXl5algRoGzysCW0Qpy5eE0vvbSIAqyVQYuBCpOCy+E3mh1e6qBk4Ct1p8GSCufaLDqxAJLRhhvoFImQscSEskzYp82pPNoBYe7fXjUBS34sl1/oISEGoPFzBiBqAkkvGCiJMZMVEAomx4NaqBKJqfgChQw4NQzS4LYHGuBpg53UJovI2lMQC4QVC/BTcVSuFYns+HseaP+YmDjbweOhWo+RgJAiZEITLx0vFRDOg7W00iChd6j6OOFAXo64AYXB5SAgsnA3c9Tqjie3KF511AdyjrY7WG9t7ViuOnaYowQE2SpFteDEVIezACiyIOGqGd4DHMKBthA8gFiNqv6uHJcrAYcJBhggHqAyHAkeQNpHU+6kZO+1v3gBoQERBj0BLCi0Au52ShgiCi3QiB+HADuSLiIp4uSWZuC6bNxGdYjHGOa6K8mpJsNQfADIiSLeEuQAXCxmrVQfyOgntAlcAYBvtoNsgomWI3ahcHp0MLM9L8KuPbEYJiiwG5rvT+J4TwUH5NryAXNMraq2Rp/5hBxHNgi/IRFGA0t7FzUfF2xJoJXPHwUH9GQtTB6r+rzpQctQRRHkhJRGBXfcKkLOa32p46nCWuOsXwoov1D+YWBURNYB9qKiUvCBytFYGiqsM5tHM+kTs1rMBVAx4aT1ADkYUuyW/SYAvcNWGCcKOC8nF+khxdD/gduc3p2Gdz4cEK38xJLNxR9pmMTtziv8t1XTT3kVdCT2ltzz2ANkpSkz8ljfrNBKVYuV9Szl1IyoO2PJ1FJd4FQNHIVpgxAb1YEVLgTLYZzu3t0/DZbyQLqYmjSYObmvrMvdD3+6Cq17MHjAUq6PM2qwxoPLw/AmgDqyz8DD2aRyBU9Gf8/u9PibQFu1n7FQbrflq10sC3g2xFx/gdiq9ren3/g44at2eoND6bzgbD7d7Ul/np5lMUL8Bn5q9WH3OuR+rizwMHfeD9Il4e/V2/1j4watvQPwLHofWAFzN4eMAAAAASUVORK5CYII='
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

    expect(blurImage(image.blurhash, '#000000')).toBeUndefined()
  })

  it('returns undefined if blurhash is empty string', () => {
    expect(blurImage('', '#00000088')).toBeUndefined()
  })
})
