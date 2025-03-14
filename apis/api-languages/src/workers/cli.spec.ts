import { spawn } from 'child_process'

import { Logger } from 'pino'

import { cli } from './cli'
import { service } from './dataExport/service'
import { service } from './dataImport/service'

// Mock the services
jest.mock('./dataExport/service', () => ({
  service: jest.fn().mockResolvedValue(undefined)
}))

jest.mock('./dataImport/service', () => ({
  service: jest.fn().mockResolvedValue(undefined)
}))

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
  return undefined as never
})

// Mock console.log and console.error
const mockConsoleLog = jest
  .spyOn(console, 'log')
  .mockImplementation(() => undefined)
const mockConsoleError = jest
  .spyOn(console, 'error')
  .mockImplementation(() => undefined)

describe('CLI', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should show usage when no arguments are provided', async () => {
    process.argv = ['node', 'cli.js']
    await cli()
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Usage')
    )
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should show usage when an invalid command is provided', async () => {
    process.argv = ['node', 'cli.js', 'invalid-command']
    await cli()
    expect(mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Usage')
    )
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should run data export when data-export command is provided', async () => {
    process.argv = ['node', 'cli.js', 'data-export']
    await cli()
    expect(service).toHaveBeenCalled()
    expect(mockExit).toHaveBeenCalledWith(0)
  })

  it('should run data import when data-import command is provided with a file path', async () => {
    process.argv = ['node', 'cli.js', 'data-import', 'test-file.pgdump']
    await cli()
    expect(service).toHaveBeenCalledWith(
      'test-file.pgdump',
      { clearExistingData: false },
      expect.any(Object)
    )
    expect(mockExit).toHaveBeenCalledWith(0)
  })

  it('should run data import with clear flag when --clear is provided', async () => {
    process.argv = [
      'node',
      'cli.js',
      'data-import',
      'test-file.pgdump',
      '--clear'
    ]
    await cli()
    expect(service).toHaveBeenCalledWith(
      'test-file.pgdump',
      { clearExistingData: true },
      expect.any(Object)
    )
    expect(mockExit).toHaveBeenCalledWith(0)
  })

  it('should show an error when data-import command is provided without a file path', async () => {
    process.argv = ['node', 'cli.js', 'data-import']
    await cli()
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining('Error')
    )
    expect(mockExit).toHaveBeenCalledWith(1)
  })

  it('should warn when file path does not end with .pgdump', async () => {
    process.argv = ['node', 'cli.js', 'data-import', 'test-file.txt']
    await cli()
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining('Warning')
    )
    expect(service).toHaveBeenCalled()
  })
})
