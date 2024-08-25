import { z } from 'zod'

import { prismaMock } from '../../../test/prismaMock'

import {
  client,
  createQueryJob,
  getCurrentTimeStamp,
  parse,
  parseMany,
  processTable
} from './importer'

jest.mock('@google-cloud/bigquery')

describe('bigquery/importer', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('createQueryJob', () => {
    it('should create a query job', async () => {
      jest.spyOn(client, 'createQueryJob')
      const job = await createQueryJob('table', undefined, false)
      expect(client.createQueryJob).toHaveBeenCalledWith({
        query: 'SELECT * FROM `table` ',
        params: {
          updatedAt: undefined
        },
        location: 'US'
      })
      expect(job).toEqual(job)
    })
  })

  describe('getCurrentTimeStamp', () => {
    it('should get current timestamp', async () => {
      const timestamp = await getCurrentTimeStamp()
      expect(timestamp).toBe('timestamp')
    })
  })

  describe('parse', () => {
    it('should parse a row', () => {
      const schema = z.object({
        id: z.string(),
        name: z.string()
      })
      const row = {
        id: 'id',
        name: 'name'
      }
      expect(parse(schema, row)).toEqual({
        id: 'id',
        name: 'name'
      })
    })

    it('should throw an error if row does not match schema', () => {
      const schema = z.object({
        id: z.string(),
        name: z.string()
      })
      const row = {
        id: 'id',
        name: 2
      }
      expect(() => parse(schema, row)).toThrow()
    })
  })

  describe('parseMany', () => {
    it('should parse many rows', () => {
      const schema = z.object({
        id: z.string(),
        name: z.string()
      })
      const rows = [
        {
          id: 'id',
          name: 'name'
        },
        {
          id: 'id2',
          name: 'name2'
        }
      ]
      expect(parseMany(schema, rows)).toEqual({
        data: [
          {
            id: 'id',
            name: 'name'
          },
          {
            id: 'id2',
            name: 'name2'
          }
        ],
        inValidRowIds: []
      })
    })

    it('should parse many rows with invalid rows', () => {
      const schema = z.object({
        id: z.string(),
        name: z.string()
      })
      const rows = [
        {
          id: 'id',
          name: 'name'
        },
        {
          id: 'id2',
          name: 2
        }
      ]
      expect(parseMany(schema, rows)).toEqual({
        data: [
          {
            id: 'id',
            name: 'name'
          }
        ],
        inValidRowIds: ['id2']
      })
    })
  })

  describe('processTable', () => {
    it('should process a table without updatedAt', async () => {
      prismaMock.importTimes.findUnique.mockResolvedValue(null)
      prismaMock.importTimes.upsert.mockResolvedValue({
        lastImport: new Date(),
        modelName: 'table'
      })
      const importOne = jest.fn()
      const importMany = jest.fn()
      await processTable('table', importOne, importMany, false)
      expect(importOne).toHaveBeenCalledTimes(1)
      expect(importMany).toHaveBeenCalledTimes(0)
      expect(prismaMock.importTimes.findUnique).toHaveBeenCalledWith({
        where: { modelName: 'table' }
      })
    })

    it('should process a table', async () => {
      prismaMock.importTimes.findUnique.mockResolvedValue(null)
      prismaMock.importTimes.upsert.mockResolvedValue({
        lastImport: new Date(),
        modelName: 'table'
      })
      const importOne = jest.fn()
      const importMany = jest.fn()
      await processTable('table', importOne, importMany, true)
      expect(importOne).toHaveBeenCalledTimes(0)
      expect(importMany).toHaveBeenCalledTimes(1)
      expect(prismaMock.importTimes.findUnique).toHaveBeenCalledWith({
        where: { modelName: 'table' }
      })
    })

    it('should process a table with prior import', async () => {
      prismaMock.importTimes.findUnique.mockResolvedValue({
        modelName: 'table',
        lastImport: new Date('2022-01-01T00:00:00.000Z')
      })
      prismaMock.importTimes.upsert.mockResolvedValue({
        lastImport: new Date(),
        modelName: 'table'
      })
      const importOne = jest.fn()
      const importMany = jest.fn()
      await processTable('table', importOne, importMany, true)
      expect(importOne).toHaveBeenCalledTimes(1)
      expect(importMany).toHaveBeenCalledTimes(0)
      expect(prismaMock.importTimes.findUnique).toHaveBeenCalledWith({
        where: { modelName: 'table' }
      })
    })
  })
})
