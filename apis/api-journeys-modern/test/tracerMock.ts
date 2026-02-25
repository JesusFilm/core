import { Plugin } from 'graphql-yoga'

export const provider = {
  register: jest.fn(),
  shutdown: jest.fn().mockResolvedValue(undefined)
}

export const tracingPlugin: Plugin = {}

export const tracer = {
  startActiveSpan: jest.fn((_name, _options, fn) =>
    fn({ end: jest.fn(), recordException: jest.fn() })
  ),
  startSpan: jest.fn()
}
