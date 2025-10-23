import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

configure({ asyncUtilTimeout: 2500 })

jest.mock('next/router', () => require('next-router-mock'))

if (process.env.CI === 'true')
  jest.retryTimes(3, { logErrorsBeforeRetry: true })

// Mock HTMLCanvasElement.getContext for tests
HTMLCanvasElement.prototype.getContext = jest.fn((contextId: string) => {
  if (contextId === '2d') {
    return {
      createImageData: jest.fn(() => ({
        data: new Uint8ClampedArray(32 * 32 * 4)
      })),
      putImageData: jest.fn(),
      fillRect: jest.fn(),
      fillStyle: ''
    } as unknown as CanvasRenderingContext2D
  }
  return null
}) as any

// Mock HTMLCanvasElement.toDataURL
HTMLCanvasElement.prototype.toDataURL = jest.fn(
  () => 'data:image/webp;base64,mock'
)
