import mediaQuery from 'css-mediaquery'

const createMatchMedia =
  (width: number) =>
  (query: string): MediaQueryList => ({
    matches: mediaQuery.match(query, { width }),
    media: query,
    onchange: null,
    addListener: () => vi.fn(),
    removeListener: () => vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  })

window.matchMedia = createMatchMedia(window.innerWidth)

export default createMatchMedia
