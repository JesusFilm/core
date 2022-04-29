import { Test, TestingModule } from '@nestjs/testing'
import { Database } from 'arangojs'
import { mockDeep } from 'jest-mock-extended'
import { CountryService } from './country.service'

describe('CountryService', () => {
  let service: CountryService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryService,
        {
          provide: 'DATABASE',
          useFactory: () => mockDeep<Database>()
        }
      ]
    }).compile()

    service = module.get<CountryService>(CountryService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
