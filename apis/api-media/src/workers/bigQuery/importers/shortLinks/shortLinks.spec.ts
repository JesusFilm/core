import { Service as PrismaService } from '.prisma/api-media-client'

import { prismaMock } from '../../../../../test/prismaMock'
import { processTable } from '../../importer'

import { importMany, importOne } from './shortLinks'

import { importShortLinks } from '.'

// Mock the domain ID and environment
const mockDomainId = 'domain-id'

// Mock the importer module
jest.mock('../../importer', () => ({
  processTable: jest.fn(),
  parse: jest.requireActual('../../importer').parse,
  parseMany: jest.requireActual('../../importer').parseMany
}))

describe('bigQuery/importers/shortLinks', () => {
  // Mock environment
  const originalEnv = process.env.DOPPLER_ENVIRONMENT

  beforeAll(() => {
    process.env.DOPPLER_ENVIRONMENT = 'dev'
  })

  afterAll(() => {
    process.env.DOPPLER_ENVIRONMENT = originalEnv
  })

  describe('importShortLinks', () => {
    it('should import shortLinks', async () => {
      await importShortLinks()
      expect(processTable).toHaveBeenCalledWith(
        'jfp-data-warehouse.jfp_shorturls_prod.yourls_url',
        importOne,
        importMany,
        true,
        undefined
      )
    })
  })

  describe('importOne', () => {
    it('should import one shortLink', async () => {
      // Mock the domain creation
      prismaMock.shortLinkDomain.upsert.mockResolvedValue({
        id: mockDomainId,
        hostname: 'dev.arc.gt',
        apexName: 'arc.gt',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [PrismaService.apiMedia]
      })

      // Mock the shortLink upsert
      prismaMock.shortLink.upsert.mockResolvedValue({
        id: 'shortlink-id',
        pathname: 'test-path',
        to: 'https://example.com',
        domainId: mockDomainId,
        userId: null,
        service: PrismaService.apiMedia,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const row = {
        keyword: 'test-path',
        url: 'https://example.com',
        title: 'Test Title',
        timestamp: { value: '2023-01-01T12:00:00Z' },
        ip: '127.0.0.1',
        clicks: 0
      }

      await importOne(row)

      expect(prismaMock.shortLinkDomain.upsert).toHaveBeenCalled()
      expect(prismaMock.shortLink.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            pathname_domainId: expect.objectContaining({
              pathname: 'test-path',
              domainId: mockDomainId
            })
          }),
          update: expect.objectContaining({
            pathname: 'test-path',
            to: 'https://example.com',
            service: PrismaService.apiMedia
          }),
          create: expect.objectContaining({
            pathname: 'test-path',
            to: 'https://example.com',
            domainId: mockDomainId,
            service: PrismaService.apiMedia
          })
        })
      )
    })

    it('should throw error if URL is invalid', async () => {
      // Mock the domain creation
      prismaMock.shortLinkDomain.upsert.mockResolvedValue({
        id: mockDomainId,
        hostname: 'dev.arc.gt',
        apexName: 'arc.gt',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [PrismaService.apiMedia]
      })

      const row = {
        keyword: 'test-path',
        url: 'invalid-url',
        title: 'Test Title',
        timestamp: { value: '2023-01-01T12:00:00Z' },
        ip: '127.0.0.1',
        clicks: 0,
        datastream_metadata: {
          source_timestamp: '2023-01-01T12:00:00Z',
          uuid: 'test-uuid'
        }
      }

      await expect(importOne(row)).rejects.toThrow(
        'row does not match schema: test-path'
      )
    })

    it('should throw error if timestamp format is invalid', async () => {
      // Mock the domain creation
      prismaMock.shortLinkDomain.upsert.mockResolvedValue({
        id: mockDomainId,
        hostname: 'dev.arc.gt',
        apexName: 'arc.gt',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [PrismaService.apiMedia]
      })

      const row = {
        keyword: 'test-path',
        url: 'https://example.com',
        title: 'Test Title',
        timestamp: { value: 'invalid-date' },
        ip: '127.0.0.1',
        clicks: 0
      }

      await expect(importOne(row)).rejects.toThrow(
        'row does not match schema: test-path'
      )
    })
  })

  describe('importMany', () => {
    it('should import many shortLinks', async () => {
      // Mock the domain creation
      prismaMock.shortLinkDomain.upsert.mockResolvedValue({
        id: mockDomainId,
        hostname: 'dev.arc.gt',
        apexName: 'arc.gt',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [PrismaService.apiMedia]
      })

      prismaMock.shortLink.createMany.mockResolvedValue({ count: 2 })

      const rows = [
        {
          keyword: 'test-path-1',
          url: 'https://example1.com',
          title: 'Test Title 1',
          timestamp: { value: '2023-01-01T12:00:00Z' },
          ip: '127.0.0.1',
          clicks: 0,
          datastream_metadata: {
            source_timestamp: '2023-01-01T12:00:00Z',
            uuid: 'test-uuid-1'
          }
        },
        {
          keyword: 'test-path-2',
          url: 'https://example2.com',
          title: 'Test Title 2',
          timestamp: { value: '2023-01-02T12:00:00Z' },
          ip: '127.0.0.2',
          clicks: 5,
          datastream_metadata: {
            source_timestamp: '2023-01-02T12:00:00Z',
            uuid: 'test-uuid-2'
          }
        }
      ]

      await importMany(rows)

      expect(prismaMock.shortLink.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              pathname: 'test-path-1',
              to: 'https://example1.com',
              domainId: mockDomainId,
              service: PrismaService.apiMedia
            }),
            expect.objectContaining({
              pathname: 'test-path-2',
              to: 'https://example2.com',
              domainId: mockDomainId,
              service: PrismaService.apiMedia
            })
          ]),
          skipDuplicates: true
        })
      )
    })

    it('should skip invalid rows and continue processing', async () => {
      // Mock the domain creation
      prismaMock.shortLinkDomain.upsert.mockResolvedValue({
        id: mockDomainId,
        hostname: 'dev.arc.gt',
        apexName: 'arc.gt',
        createdAt: new Date(),
        updatedAt: new Date(),
        services: [PrismaService.apiMedia]
      })

      // Mock createMany to return count of 0 (no valid rows to insert)
      prismaMock.shortLink.createMany.mockResolvedValue({ count: 0 })

      // This should not throw, but should skip invalid rows
      await expect(
        importMany([
          {
            keyword: 'invalid-row-1',
            url: 'http://example.com',
            timestamp: { value: 'invalid-date' }
          },
          {
            keyword: 'invalid-row-2',
            url: 'invalid-url-2',
            timestamp: { value: '2023-01-01T12:00:00Z' }
          }
        ])
      ).resolves.toBeUndefined()

      // Should call createMany with empty array since all rows are invalid
      expect(prismaMock.shortLink.createMany).toHaveBeenCalledWith({
        data: [],
        skipDuplicates: true
      })
    })
  })
})
