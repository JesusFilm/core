export const createMockPlaylistItem = (
  overrides?: Partial<{
    id: string
    order: number | null
    videoVariant: {
      id: string
      hls: string | null
      duration: number
      language: {
        id: string
        name: { value: string }[]
      }
      video: {
        id: string
        title: { value: string }[]
        description: { value: string; primary: boolean }[]
        studyQuestions: { value: string; primary: boolean }[]
        images: { mobileCinematicHigh: string | null }[]
      } | null
    }
  }>
) => ({
  id: 'item-1',
  order: 1,
  videoVariant: {
    id: 'variant-1',
    hls: 'https://example.com/video.m3u8',
    duration: 3600,
    language: {
      id: 'lang-1',
      name: [{ value: 'English' }]
    },
    video: {
      id: 'video-1',
      title: [{ value: 'Test Video' }],
      description: [{ value: 'Test description', primary: true }],
      studyQuestions: [{ value: 'Question 1?', primary: true }],
      images: [{ mobileCinematicHigh: 'https://example.com/thumb.jpg' }]
    }
  },
  ...overrides
})

export const createMockPlaylist = (
  overrides?: Partial<{
    id: string
    name: string
    owner: {
      id: string
      firstName: string
      lastName: string | null
    }
    items: ReturnType<typeof createMockPlaylistItem>[]
  }>
) => ({
  id: 'playlist-1',
  name: 'Test Playlist',
  owner: {
    id: 'owner-1',
    firstName: 'John',
    lastName: 'Doe'
  },
  items: [createMockPlaylistItem()],
  ...overrides
})
