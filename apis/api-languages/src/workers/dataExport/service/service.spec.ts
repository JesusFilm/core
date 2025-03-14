import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import { join } from 'path'

import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'

import { service } from './service'

// Mock the prisma client
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    language: {
      findMany: jest.fn().mockResolvedValue([{ id: 'test-language' }])
    },
    languageName: {
      findMany: jest.fn().mockResolvedValue([{ id: 'test-language-name' }])
    },
    country: {
      findMany: jest.fn().mockResolvedValue([{ id: 'test-country' }])
    },
    countryLanguage: {
      findMany: jest.fn().mockResolvedValue([{ id: 'test-country-language' }])
    },
    countryName: {
      findMany: jest.fn().mockResolvedValue([{ id: 'test-country-name' }])
    },
    continent: {
      findMany: jest.fn().mockResolvedValue([{ id: 'test-continent' }])
    },
    continentName: {
      findMany: jest.fn().mockResolvedValue([{ id: 'test-continent-name' }])
    },
    audioPreview: {
      findMany: jest.fn().mockResolvedValue([{ id: 'test-audio-preview' }])
    },
    importTimes: {
      findMany: jest.fn().mockResolvedValue([{ id: 'test-import-times' }])
    }
  }
}))

// Mock fs functions
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockImplementation((path) => {
      if (path.includes('manifest.json')) {
        return Promise.resolve(
          JSON.stringify({
            exportDate: '2023-01-01T00:00:00.000Z',
            models: [],
            version: '1.0.0'
          })
        )
      }
      return Promise.resolve(JSON.stringify([{ id: 'test' }]))
    }),
    rm: jest.fn().mockResolvedValue(undefined)
  },
  createWriteStream: jest.fn().mockReturnValue({
    on: jest.fn(),
    end: jest.fn()
  })
}))

// Mock child_process
jest.mock('child_process', () => ({
  spawn: jest.fn().mockImplementation(() => {
    const mockProcess = {
      stdout: { on: jest.fn() },
      stderr: { on: jest.fn() },
      on: jest.fn()
    }

    // Simulate successful completion
    setTimeout(() => {
      const closeHandler = mockProcess.on.mock.calls.find(
        (call) => call[0] === 'close'
      )[1]
      closeHandler(0) // Call with exit code 0 (success)
    }, 10)

    return mockProcess
  })
}))

describe('Data Export Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should export all models and create a tar.gz archive', async () => {
    // Create a mock logger
    const mockLogger = {
      info: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      child: jest.fn().mockReturnThis()
    } as unknown as Logger

    await service(mockLogger)

    // Verify temp directory was created
    expect(fs.mkdir).toHaveBeenCalledWith(
      expect.stringContaining('temp_export'),
      { recursive: true }
    )

    // Verify all models were queried
    expect(prisma.language.findMany).toHaveBeenCalled()
    expect(prisma.languageName.findMany).toHaveBeenCalled()
    expect(prisma.country.findMany).toHaveBeenCalled()
    expect(prisma.countryLanguage.findMany).toHaveBeenCalled()
    expect(prisma.countryName.findMany).toHaveBeenCalled()
    expect(prisma.continent.findMany).toHaveBeenCalled()
    expect(prisma.continentName.findMany).toHaveBeenCalled()
    expect(prisma.audioPreview.findMany).toHaveBeenCalled()
    expect(prisma.importTimes.findMany).toHaveBeenCalled()

    // Verify files were written
    expect(fs.writeFile).toHaveBeenCalledTimes(10) // 9 models + manifest

    // Verify tar command was called
    expect(spawn).toHaveBeenCalledWith(
      'tar',
      expect.arrayContaining(['-czf']),
      expect.any(String)
    )

    // Verify cleanup
    expect(fs.rm).toHaveBeenCalledWith(expect.stringContaining('temp_export'), {
      recursive: true,
      force: true
    })

    // Verify logger was used
    expect(mockLogger.info).toHaveBeenCalledWith('Starting data export')
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('Data export completed successfully')
    )
  })
})
