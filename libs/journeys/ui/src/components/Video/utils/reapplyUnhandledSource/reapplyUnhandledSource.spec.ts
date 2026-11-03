import type VideoJsPlayer from '../videoJsTypes'

import { reapplyUnhandledSource } from './reapplyUnhandledSource'

const hls = {
  src: 'https://stream.example.org/video.m3u8',
  type: 'application/x-mpegURL'
}

function fakePlayer(
  el: Element,
  sources: Array<{ src: string; type: string }> = [hls]
): VideoJsPlayer & { src: ReturnType<typeof vi.fn> } {
  return {
    currentSources: () => sources,
    tech: () => ({ el: () => el }),
    src: vi.fn()
  } as unknown as VideoJsPlayer & { src: ReturnType<typeof vi.fn> }
}

describe('reapplyUnhandledSource', () => {
  it('recognizes media elements inside an iframe preview', () => {
    const iframe = document.createElement('iframe')
    document.body.appendChild(iframe)
    try {
      const video = iframe.contentDocument!.createElement('video')
      const player = fakePlayer(video)
      reapplyUnhandledSource(player)
      expect(player.src).toHaveBeenCalledWith([hls])
    } finally {
      iframe.remove()
    }
  })

  it('sets the sources again when the media element was left on its <source> children', () => {
    const video = document.createElement('video')
    video.appendChild(document.createElement('source'))
    const player = fakePlayer(video)

    reapplyUnhandledSource(player)

    expect(player.src).toHaveBeenCalledWith([hls])
  })

  it('leaves an element the handlers already fed alone', () => {
    const video = document.createElement('video')
    video.setAttribute('src', 'blob:https://example.org/abc')
    const player = fakePlayer(video)

    reapplyUnhandledSource(player)

    expect(player.src).not.toHaveBeenCalled()
  })

  it('ignores a player without sources or with a non-media tech', () => {
    const empty = fakePlayer(document.createElement('video'), [])
    reapplyUnhandledSource(empty)
    expect(empty.src).not.toHaveBeenCalled()

    const youTube = fakePlayer(document.createElement('iframe'))
    reapplyUnhandledSource(youTube)
    expect(youTube.src).not.toHaveBeenCalled()
  })
})
