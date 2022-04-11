import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { AqlQuery } from 'arangojs/aql'
import { ArrayCursor } from 'arangojs/cursor'
import { DeepMockProxy, mockDeep } from 'jest-mock-extended'

import { VideoTagService } from './tag.service'
import { tag } from './testData'

describe('VideoTagService', () => {
  let service: VideoTagService, db: DeepMockProxy<Database>

  beforeEach(async () => {
    db = mockDeep<Database>()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideoTagService,
        {
          provide: 'DATABASE',
          useFactory: () => db
        }
      ]
    }).compile()
    service = await module.get<VideoTagService>(VideoTagService)
  })

  it('should get 1 tag', async () => {
    db.query.mockImplementationOnce(async (q) => {
      const { query, bindVars } = q as unknown as AqlQuery
      expect(query).toEqual(`
    FOR item IN 
      FILTER item._key == @value0
      LIMIT 1
      RETURN item`)
      expect(bindVars).toEqual({ value0: 'JFM1' })
      return { next: () => tag } as unknown as ArrayCursor
    })
    expect(await service.get('JFM1')).toEqual(tag)
  })

  it('should get all tags', async () => {
    db.query.mockImplementationOnce(async (q) => {
      const { query } = q as unknown as AqlQuery
      expect(query).toEqual(`
    FOR item IN 
      RETURN item`)
      return { all: () => [tag, tag] } as unknown as ArrayCursor
    })
    expect(await service.getAll()).toEqual([tag, tag])
  })
})
