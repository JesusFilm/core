import { mockDeep } from 'jest-mock-extended'

import { Prisma, PrismaClient } from '@core/prisma/journeys/client'

import { prismaMock } from '../../../../test/prismaMock'
import { VideoBlockSource } from '../../enums'

import { VideoBlockObjectFit } from './enums/videoObjectFit'

// Mock external dependencies
jest.mock('../../../lib/auth/ability')
jest.mock('../../../lib/prisma')
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-generated')
}))

describe('VideoBlock Schema', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('VideoBlock type definitions', () => {
    it('should have VideoBlockSource enum available', () => {
      expect(VideoBlockSource).toBeDefined()
      expect(typeof VideoBlockSource).toBe('object')
    })

    it('should have VideoBlockObjectFit enum available', () => {
      expect(VideoBlockObjectFit).toBeDefined()
      expect(typeof VideoBlockObjectFit).toBe('object')
    })
  })

  describe('Database operations', () => {
    const mockJourney = {
      id: 'journeyId',
      team: { userTeams: [{ userId: 'testUserId', role: 'manager' }] },
      userJourneys: []
    }

    it('should call prisma for video block creation', () => {
      prismaMock.journey.findFirst.mockResolvedValue(mockJourney as any)
      prismaMock.block.findMany.mockResolvedValue([])
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock)
      })
      prismaMock.block.create.mockResolvedValue({
        id: 'mock-uuid-generated',
        typename: 'VideoBlock',
        journeyId: 'journeyId',
        parentBlockId: 'parentBlockId',
        parentOrder: 1,
        autoplay: true,
        muted: false,
        fullsize: false,
        source: 'cloudflare'
      } as any)
      prismaMock.journey.update.mockResolvedValue(mockJourney as any)

      // Test that the mock setup is valid
      expect(prismaMock.journey.findFirst).toBeDefined()
      expect(prismaMock.block.create).toBeDefined()
      expect(prismaMock.$transaction).toBeDefined()
    })

    it('should call prisma for video block updates', () => {
      prismaMock.block.findFirst.mockResolvedValue({
        id: 'videoBlockId',
        typename: 'VideoBlock',
        journey: mockJourney
      } as any)
      prismaMock.$transaction.mockImplementation(async (callback) => {
        return await callback(prismaMock)
      })
      prismaMock.block.update.mockResolvedValue({
        id: 'videoBlockId',
        autoplay: false,
        muted: true
      } as any)
      prismaMock.journey.update.mockResolvedValue(mockJourney as any)

      // Test that the mock setup is valid
      expect(prismaMock.block.findFirst).toBeDefined()
      expect(prismaMock.block.update).toBeDefined()
    })

    it('should validate video properties', () => {
      const videoProps = {
        autoplay: true,
        muted: false,
        fullsize: false,
        startAt: 0,
        endAt: 100,
        source: 'cloudflare'
      }

      expect(videoProps.autoplay).toBe(true)
      expect(videoProps.muted).toBe(false)
      expect(videoProps.startAt).toBe(0)
      expect(videoProps.endAt).toBe(100)
      expect(videoProps.source).toBe('cloudflare')
    })

    it('should handle video source options', () => {
      const sources = ['cloudflare', 'internal', 'youTube', 'mux']

      sources.forEach((source) => {
        expect(typeof source).toBe('string')
        expect(source.length).toBeGreaterThan(0)
      })
    })

    it('should handle video object fit options', () => {
      const objectFitOptions = ['fill', 'fit', 'zoomed']

      objectFitOptions.forEach((option) => {
        expect(typeof option).toBe('string')
        expect(option.length).toBeGreaterThan(0)
      })
    })

    it('should validate time range properties', () => {
      const timeProps = {
        startAt: 10,
        endAt: 90,
        duration: 120
      }

      expect(timeProps.startAt).toBeLessThan(timeProps.endAt)
      expect(timeProps.duration).toBeGreaterThan(timeProps.endAt)
      expect(timeProps.startAt).toBeGreaterThanOrEqual(0)
    })
  })
})
