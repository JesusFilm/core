import { Test, TestingModule } from '@nestjs/testing'

import { DateTimeScalar } from './dateTime.provider'

const testDate = '2021-11-19T12:34:56.647Z'

describe('DateTime', () => {
  let service: DateTimeScalar

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DateTimeScalar]
    }).compile()
    service = await module.resolve(DateTimeScalar)
  })

  describe('DateTime', () => {
    it('returns DateTime string', async () => {
      expect(service.serialize(testDate)).toEqual(testDate)
    })
  })
})
