import '@testing-library/jest-dom'
import './test/createMatchMedia'

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  )
}))

Element.prototype.scrollIntoView = jest.fn()
