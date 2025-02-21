import { videosFilter } from '.'

describe('videosFilter', () => {
  it('should search with title', () => {
    expect(
      videosFilter({
        title: 'abc'
      })
    ).toEqual({
      id: undefined,
      label: undefined,
      title: { some: { value: { search: 'abc' } } },
      variants: undefined
    })
  })

  it('should search with title and escape special characters', () => {
    expect(
      videosFilter({
        title: 'a-bc 1:23'
      })
    ).toEqual({
      id: undefined,
      label: undefined,
      title: { some: { value: { search: '"a\\-bc" & "1\\:23"' } } },
      variants: undefined
    })
  })

  it('should filter with availableVariantLanguageIds', () => {
    expect(
      videosFilter({
        availableVariantLanguageIds: ['en']
      })
    ).toEqual({
      id: undefined,
      label: undefined,
      title: undefined,
      variants: {
        some: {
          languageId: { in: ['en'] },
          subtitle: undefined
        }
      }
    })
  })

  it('should filter by label', () => {
    expect(
      videosFilter({
        labels: ['collection']
      })
    ).toEqual({
      id: undefined,
      label: { in: ['collection'] },
      title: undefined,
      variants: undefined
    })
  })

  it('should filter by id', () => {
    expect(
      videosFilter({
        ids: ['videoId']
      })
    ).toEqual({
      id: { in: ['videoId'] },
      label: undefined,
      title: undefined,
      variants: undefined
    })
  })

  it('should filter and search by all', () => {
    expect(
      videosFilter({
        title: 'abc 123',
        availableVariantLanguageIds: ['en'],
        labels: ['collection'],
        ids: ['videoId'],
        published: true,
        locked: true
      })
    ).toEqual({
      id: { in: ['videoId'] },
      label: { in: ['collection'] },
      title: { some: { value: { search: 'abc & 123' } } },
      variants: {
        some: {
          languageId: { in: ['en'] },
          subtitle: undefined
        }
      },
      published: true,
      locked: true
    })
  })

  it('should filter with subtitleLanguageIds', () => {
    expect(
      videosFilter({
        subtitleLanguageIds: ['529']
      })
    ).toEqual({
      id: undefined,
      label: undefined,
      title: undefined,
      subtitles: {
        some: {
          languageId: { in: ['529'] }
        }
      },
      variants: undefined
    })
  })

  it('should filter with published status', () => {
    expect(videosFilter({ published: true })).toEqual({
      id: undefined,
      label: undefined,
      title: undefined,
      subtitels: undefined,
      variants: undefined,
      published: true
    })
  })

  it('should filter with locked status', () => {
    expect(videosFilter({ locked: true })).toEqual({
      id: undefined,
      label: undefined,
      title: undefined,
      subtitles: undefined,
      variants: undefined,
      locked: true
    })
  })
})
