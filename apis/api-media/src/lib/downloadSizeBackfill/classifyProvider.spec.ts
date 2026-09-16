import { classifyProvider } from './classifyProvider'

describe('classifyProvider', () => {
  it('classifies a Mux stream URL as mux', () => {
    expect(
      classifyProvider({
        url: 'https://stream.mux.com/abc123/720p.mp4',
        assetId: null
      })
    ).toBe('mux')
  })

  it('classifies a non-Mux URL with a linked asset as r2', () => {
    expect(
      classifyProvider({
        url: 'https://legacy.example.com/file.mp4',
        assetId: 'asset-1'
      })
    ).toBe('r2')
  })

  it('classifies a non-Mux URL without a linked asset as legacy', () => {
    expect(
      classifyProvider({
        url: 'https://legacy.example.com/file.mp4',
        assetId: null
      })
    ).toBe('legacy')
  })

  it('deterministically prefers mux over a conflicting linked asset', () => {
    // Provider disagreement: a Mux stream URL alongside a leftover R2
    // asset link from an earlier migration. The URL a client actually
    // fetches from must win.
    expect(
      classifyProvider({
        url: 'https://stream.mux.com/abc123/720p.mp4',
        assetId: 'stale-r2-asset'
      })
    ).toBe('mux')
  })
})
