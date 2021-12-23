import { mockDeep, mockReset } from 'jest-mock-extended'
import { DeepMockProxy } from 'jest-mock-extended/lib/cjs/Mock'
import db from '../src/lib/db'
import { PrismaClient } from '.prisma/api-journeys-client'

jest.mock('../src/lib/db', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>()
}))

beforeEach(() => {
  mockReset(dbMock)
})

const dbMock = db

export default dbMock as unknown as DeepMockProxy<PrismaClient>
