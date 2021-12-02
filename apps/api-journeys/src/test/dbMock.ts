import { Database } from 'arangojs'
import { mockDeep, mockReset } from 'jest-mock-extended'
import { DeepMockProxy } from 'jest-mock-extended/lib/cjs/Mock'
// import db from '../src/lib/db'

jest.mock('../src/lib/db', () => ({
  __esModule: true,
  default: mockDeep<Database>()
}))

beforeEach(() => {
  mockReset(dbMock)
})

const dbMock = new Database()

export default dbMock as unknown as DeepMockProxy<Database>
