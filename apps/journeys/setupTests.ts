import '@testing-library/jest-dom'
import { configure } from '@testing-library/react'

configure({ asyncUtilTimeout: 2500 })

jest.mock('next/router', () => require('next-router-mock'))

// Mock TransformStream for AI SDK compatibility
global.TransformStream = class TransformStream {
  constructor() {}
  readable = new ReadableStream()
  writable = new WritableStream()
}

// Mock AI SDK modules
jest.mock('ai', () => ({
  DefaultChatTransport: jest.fn().mockImplementation(() => ({
    sendMessage: jest.fn(),
    subscribe: jest.fn()
  }))
}))

jest.mock('@ai-sdk/react', () => ({
  useChat: jest.fn(() => ({
    messages: [],
    sendMessage: jest.fn(),
    status: 'idle',
    regenerate: jest.fn()
  }))
}))

// Mock use-stick-to-bottom package
jest.mock('use-stick-to-bottom', () => ({
  StickToBottom: ({ children }: { children: React.ReactNode }) => children,
  useStickToBottomContext: () => ({
    isStuck: false,
    stickToBottom: jest.fn(),
    unstickFromBottom: jest.fn()
  })
}))

// Mock streamdown package
jest.mock('streamdown', () => ({
  Streamdown: ({ children }: { children: React.ReactNode }) => children
}))

// Mock react-markdown package
jest.mock('react-markdown', () => ({
  default: ({ children }: { children: React.ReactNode }) => children
}))

if (process.env.CI === 'true')
  jest.retryTimes(3, { logErrorsBeforeRetry: true })
