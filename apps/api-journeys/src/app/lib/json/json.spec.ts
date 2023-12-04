import { Test, TestingModule } from '@nestjs/testing'

import { JsonScalar } from './json.provider'

describe('Json', () => {
  let service: JsonScalar

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JsonScalar]
    }).compile()
    service = await module.resolve(JsonScalar)
  })

  it('returns the Json object', () => {
    const value = '{ foo: "bar" }'
    expect(service.serialize(value)).toBe('{ foo: "bar" }')
  })
})
