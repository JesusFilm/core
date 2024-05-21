import mediaQuery from 'css-mediaquery'
// comment so it will create an env to run tests
const createMatchMedia =
  (width: number) =>
  (query: string): MediaQueryList => ({
    matches: mediaQuery.match(query, { width }),
    media: query,
    onchange: null,
    addListener: () => jest.fn(),
    removeListener: () => jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  })

window.matchMedia = createMatchMedia(window.innerWidth)

export default createMatchMedia
