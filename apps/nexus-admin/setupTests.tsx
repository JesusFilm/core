import '@testing-library/jest-dom'

import { TextDecoder, TextEncoder } from 'util'

import { configure } from '@testing-library/react'

import './test/i18n'

Object.assign(global, { TextDecoder, TextEncoder })

configure({ asyncUtilTimeout: 2500 })

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, priority, className }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      rel={priority === true ? 'preload' : undefined}
      className={className}
    />
  )
}))

jest.setTimeout(10000)

Element.prototype.scrollIntoView = jest.fn()

jest.mock('next/router', () => require('next-router-mock'))

if (process.env.CI === 'true')
  jest.retryTimes(3, { logErrorsBeforeRetry: true })
