import { VideoBlockSource } from '../../../../../__generated__/globalTypes'

import { parseMediaUrl } from './parseMediaUrl'

describe('parseMediaUrl', () => {
  it('reads a Watch address to its variant slug', () => {
    expect(
      parseMediaUrl('https://www.jesusfilm.org/watch/jesus.html/english.html')
    ).toEqual({
      source: VideoBlockSource.internal,
      url: 'https://www.jesusfilm.org/watch/jesus.html/english.html',
      slug: 'jesus/english'
    })
  })

  it('reads a Watch address inside a container to the last two segments', () => {
    expect(
      parseMediaUrl(
        ' https://jesusfilm.org/watch/easter.html/the-resurrection/french.html '
      )
    ).toEqual({
      source: VideoBlockSource.internal,
      url: 'https://jesusfilm.org/watch/easter.html/the-resurrection/french.html',
      slug: 'the-resurrection/french'
    })
  })

  it('refuses addresses that are not Watch video pages', () => {
    expect(parseMediaUrl('https://www.jesusfilm.org/watch')).toBeNull()
    expect(
      parseMediaUrl('https://www.jesusfilm.org/watch/jesus.html')
    ).toBeNull()
    expect(
      parseMediaUrl('http://www.jesusfilm.org/watch/jesus.html/english.html')
    ).toBeNull()
    expect(
      parseMediaUrl('https://example.com/watch/jesus.html/english.html')
    ).toBeNull()
    expect(
      parseMediaUrl('https://www.jesusfilm.org/watch/jesus/english')
    ).toBeNull()
    expect(parseMediaUrl('not a link')).toBeNull()
  })

  it.each([
    'https://www.youtube.com/watch?v=jQaeIJOA6J0',
    'https://youtube.com/watch?v=jQaeIJOA6J0&t=30s',
    'https://m.youtube.com/watch?v=jQaeIJOA6J0',
    'https://youtu.be/jQaeIJOA6J0',
    'https://youtu.be/jQaeIJOA6J0?si=share',
    'https://www.youtube.com/shorts/jQaeIJOA6J0',
    'https://www.youtube.com/embed/jQaeIJOA6J0'
  ])('reads the YouTube id of %s', (link) => {
    expect(parseMediaUrl(link)).toEqual({
      source: VideoBlockSource.youTube,
      videoId: 'jQaeIJOA6J0'
    })
  })

  it('refuses YouTube links without an 11-character video id', () => {
    expect(parseMediaUrl('https://www.youtube.com/watch?v=short')).toBeNull()
    expect(parseMediaUrl('https://www.youtube.com/@channel')).toBeNull()
    expect(parseMediaUrl('https://youtu.be/')).toBeNull()
    expect(
      parseMediaUrl('https://www.youtube.com/playlist?list=PL123')
    ).toBeNull()
  })
})
