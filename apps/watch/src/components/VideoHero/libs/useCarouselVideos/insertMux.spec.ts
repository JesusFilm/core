describe('mergeMuxInserts', () => {
  const baseOverlay = {
    label: 'Today’s Pick',
    title: 'Morning Nature Background',
    collection: 'Daily Inspirations',
    description: 'A calm intro before your playlist.'
  }

  beforeEach(() => {
    jest.resetModules()
  })

  it('adds sequence-start inserts before the first video', async () => {
    jest.doMock('../../../../../config/video-inserts.mux.json', () => ({
      __esModule: true,
      default: {
        version: '1.0.0',
        inserts: [
          {
            id: 'welcome',
            enabled: true,
            source: 'mux',
            playbackIds: ['abc123'],
            overlay: baseOverlay,
            trigger: { type: 'sequence-start' }
          }
        ]
      }
    }))

    const { mergeMuxInserts } = await import('./insertMux')

    const slides = mergeMuxInserts([
      { id: 'video-1' } as any,
      { id: 'video-2' } as any
    ])

    expect(slides[0].source).toBe('mux')
    expect(slides[1].source).toBe('video')
  })

  it('inserts after the configured count', async () => {
    jest.doMock('../../../../../config/video-inserts.mux.json', () => ({
      __esModule: true,
      default: {
        version: '1.0.0',
        inserts: [
          {
            id: 'after-two',
            enabled: true,
            source: 'mux',
            playbackIds: ['abc123'],
            overlay: baseOverlay,
            trigger: { type: 'after-count', count: 2 }
          }
        ]
      }
    }))

    const { mergeMuxInserts } = await import('./insertMux')

    const slides = mergeMuxInserts([
      { id: 'video-1' } as any,
      { id: 'video-2' } as any,
      { id: 'video-3' } as any
    ])

    expect(slides[2].source).toBe('mux')
    expect(slides[3].source).toBe('video')
  })
})
