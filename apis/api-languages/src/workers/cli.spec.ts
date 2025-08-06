import { cli } from './cli'

// Mock chalk to return the input string without styling
jest.mock('chalk', () => ({
  greenBright: (str: string) => str,
  grey: (str: string) => str,
  bold: (str: string) => str,
  cyan: (...args: string[]) => args.join(' '),
  red: (str: string) => str
}))

// Mock the services
jest.mock('./dataExport/service', () => ({
  service: jest.fn().mockResolvedValue(undefined)
}))

// Mock Queue
jest.mock('bullmq', () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest
      .fn()
      .mockResolvedValue({ id: 'test-id', getState: () => 'waiting' }),
    getJobs: jest.fn().mockResolvedValue([])
  })),
  Worker: jest.fn()
}))

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
  return undefined as never
})

// Mock console.log and console.error
const mockConsoleLog = jest
  .spyOn(console, 'log')
  .mockImplementation(() => undefined)

describe('CLI', () => {
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.NODE_ENV = 'production'
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  it('should run data export when data-export command is provided', async () => {
    process.argv = ['node', 'cli.js', 'data-export']
    await cli()
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      'api-languages-data-export-job',
      expect.any(String)
    )
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('test-id')
    )
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('you must start the worker')
    )
    expect(mockExit).toHaveBeenCalledWith(0)
  })
})
