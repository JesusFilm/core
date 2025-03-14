import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import { join } from 'path'

import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'

import { service } from './service'

// Mock the logger
const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn().mockReturnThis()
} as unknown as Logger

// Mock the prisma client
jest.mock('../../../lib/prisma', () => ({
  prisma: {
    language: {
      deleteMany: jest.fn().mockResolvedValue(undefined),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
      create: jest.fn().mockResolvedValue({ id: 'test-language' })
    },
    languageName: {
      deleteMany: jest.fn().mockResolvedValue(undefined),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
      create: jest.fn().mockResolvedValue({ id: 'test-language-name' })
    },
    country: {
      deleteMany: jest.fn().mockResolvedValue(undefined),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
      create: jest.fn().mockResolvedValue({ id: 'test-country' })
    },
    countryLanguage: {
      deleteMany: jest.fn().mockResolvedValue(undefined),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
      create: jest.fn().mockResolvedValue({ id: 'test-country-language' })
    },
    countryName: {
      deleteMany: jest.fn().mockResolvedValue(undefined),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
      create: jest.fn().mockResolvedValue({ id: 'test-country-name' })
    },
    continent: {
      deleteMany: jest.fn().mockResolvedValue(undefined),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
      create: jest.fn().mockResolvedValue({ id: 'test-continent' })
    },
    continentName: {
      deleteMany: jest.fn().mockResolvedValue(undefined),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
      create: jest.fn().mockResolvedValue({ id: 'test-continent-name' })
    },
    audioPreview: {
      deleteMany: jest.fn().mockResolvedValue(undefined),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
      create: jest.fn().mockResolvedValue({ id: 'test-audio-preview' })
    },
    importTimes: {
      deleteMany: jest.fn().mockResolvedValue(undefined),
      createMany: jest.fn().mockResolvedValue({ count: 1 }),
      create: jest.fn().mockResolvedValue({ id: 'test-import-times' }),
      upsert: jest
        .fn()
        .mockResolvedValue({ modelName: 'dataImport', lastImport: new Date() })
    }
  }
}))

// Mock fs functions
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn().mockResolvedValue(undefined),
    stat: jest.fn().mockResolvedValue({ isFile: () => true }),
    readFile: jest.fn().mockImplementation((path) => {
      if (path.includes('manifest.json')) {
        return Promise.resolve(
          JSON.stringify({
            exportDate: '2023-01-01T00:00:00.000Z',
            models: [
              'Language',
              'LanguageName',
              'Country',
              'CountryLanguage',
              'CountryName',
              'Continent',
              'ContinentName',
              'AudioPreview',
              'ImportTimes'
            ],
            version: '1.0.0'
          })
        )
      }
      return Promise.resolve(JSON.stringify([{ id: 'test' }]))
    }),
    rm: jest.fn().mockResolvedValue(undefined)
  }
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

describe('Data Import Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should import data from a tar.gz archive', async () => {
    await service('test-file.tar.gz', {}, mockLogger)

    // Verify temp directory was created
    expect(fs.mkdir).toHaveBeenCalledWith(
      expect.stringContaining('temp_import'),
      { recursive: true }
    )

    // Verify file was checked
    expect(fs.stat).toHaveBeenCalledWith('test-file.tar.gz')

    // Verify tar command was called
    expect(spawn).toHaveBeenCalledWith(
      'tar',
      expect.arrayContaining(['-xzf']),
      expect.any(String)
    )

    // Verify manifest was read
    expect(fs.readFile).toHaveBeenCalledWith(
      expect.stringContaining('manifest.json'),
      'utf-8'
    )

    // Verify data was imported
    expect(prisma.language.createMany).toHaveBeenCalled()
    expect(prisma.languageName.createMany).toHaveBeenCalled()
    expect(prisma.country.createMany).toHaveBeenCalled()
    expect(prisma.countryLanguage.createMany).toHaveBeenCalled()
    expect(prisma.countryName.createMany).toHaveBeenCalled()
    expect(prisma.continent.createMany).toHaveBeenCalled()
    expect(prisma.continentName.createMany).toHaveBeenCalled()
    expect(prisma.audioPreview.createMany).toHaveBeenCalled()
    expect(prisma.importTimes.createMany).toHaveBeenCalled()

    // Verify import times were updated
    expect(prisma.importTimes.upsert).toHaveBeenCalledWith({
      where: { modelName: 'dataImport' },
      update: { lastImport: expect.any(Date) },
      create: { modelName: 'dataImport', lastImport: expect.any(Date) }
    })

    // Verify cleanup
    expect(fs.rm).toHaveBeenCalledWith(expect.stringContaining('temp_import'), {
      recursive: true,
      force: true
    })

    // Verify logger was used
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.objectContaining({ filePath: 'test-file.tar.gz' }),
      'Starting data import'
    )
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Data import completed successfully'
    )
  })

  it('should clear existing data when requested', async () => {
    await service('test-file.tar.gz', { clearExistingData: true }, mockLogger)

    // Verify data was cleared
    expect(prisma.importTimes.deleteMany).toHaveBeenCalled()
    expect(prisma.audioPreview.deleteMany).toHaveBeenCalled()
    expect(prisma.continentName.deleteMany).toHaveBeenCalled()
    expect(prisma.countryName.deleteMany).toHaveBeenCalled()
    expect(prisma.countryLanguage.deleteMany).toHaveBeenCalled()
    expect(prisma.languageName.deleteMany).toHaveBeenCalled()
    expect(prisma.country.deleteMany).toHaveBeenCalled()
    expect(prisma.continent.deleteMany).toHaveBeenCalled()
    expect(prisma.language.deleteMany).toHaveBeenCalled()
  })

  it('should filter models when importModels is specified', async () => {
    await service(
      'test-file.tar.gz',
      { importModels: ['Language', 'Country'] },
      mockLogger
    )

    // Verify only specified models were imported
    expect(prisma.language.createMany).toHaveBeenCalled()
    expect(prisma.country.createMany).toHaveBeenCalled()

    // Verify other models were not imported
    expect(prisma.languageName.createMany).not.toHaveBeenCalled()
    expect(prisma.countryLanguage.createMany).not.toHaveBeenCalled()
    expect(prisma.countryName.createMany).not.toHaveBeenCalled()
    expect(prisma.continent.createMany).not.toHaveBeenCalled()
    expect(prisma.continentName.createMany).not.toHaveBeenCalled()
    expect(prisma.audioPreview.createMany).not.toHaveBeenCalled()
  })
})
