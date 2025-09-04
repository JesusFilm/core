import '@testing-library/jest-dom'
import 'isomorphic-fetch'
import { configure } from '@testing-library/react'

configure({ asyncUtilTimeout: 2500 })

// Mock Next.js components
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  )
}))

jest.mock('next/router', () => require('next-router-mock'))

// Mock environment variables for testing
process.env.NEXT_PUBLIC_ALGOLIA_APP_ID = 'test_app_id'
process.env.NEXT_PUBLIC_ALGOLIA_API_KEY = 'test_api_key'
process.env.NEXT_PUBLIC_ALGOLIA_INDEX = 'test_index'
process.env.NEXT_PUBLIC_ALGOLIA_SUGGESTIONS_INDEX = 'test_suggestions_index'
process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE = 'test_customer_code'
process.env.SKIP_ENV_VALIDATION = 'true'

// Mock algoliasearch
jest.mock('algoliasearch', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    search: jest.fn(() => Promise.resolve({
      results: [{ hits: [] }]
    }))
  }))
}))

// Mock the env module to avoid ES module issues
jest.mock('./src/env', () => ({
  env: {
    NEXT_PUBLIC_ALGOLIA_APP_ID: 'test_app_id',
    NEXT_PUBLIC_ALGOLIA_API_KEY: 'test_api_key',
    NEXT_PUBLIC_ALGOLIA_INDEX: 'test_index',
    NEXT_PUBLIC_ALGOLIA_SUGGESTIONS_INDEX: 'test_suggestions_index',
    NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE: 'test_customer_code'
  }
}))

Object.defineProperty(
  window.navigator,
  'userAgent',
  ((value) => ({
    get() {
      return value
    },
    set(v) {
      value = v
    }
  }))(window.navigator.userAgent)
)

if (process.env['CI'] === 'true')
  jest.retryTimes(3, { logErrorsBeforeRetry: true })
