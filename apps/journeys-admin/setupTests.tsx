import '@testing-library/jest-dom'
import './test/createMatchMedia'
import { configure } from '@testing-library/react'

configure({ asyncUtilTimeout: 2500 })

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  )
}))

jest.setTimeout(10000)

Element.prototype.scrollIntoView = jest.fn()
