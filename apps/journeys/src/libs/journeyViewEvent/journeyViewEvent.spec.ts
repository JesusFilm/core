import { v4 as uuidv4 } from 'uuid'
import { journeyViewEvent } from './journeyViewEvent'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('journeyViewEvent', () => {
  it('should create a journeyViewEvent', async () => {
    mockUuidv4.mockReturnValueOnce('uuid')
    void journeyViewEvent({ journeyId: 'journeyId' })
  })
})
