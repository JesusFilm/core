import { v4 as uuidv4 } from 'uuid'

import { generateUuid } from './generateUuid'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('generateUuid', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should have correct tool configuration', () => {
    const tool = generateUuid()

    expect(tool.description).toBe('Generate a new UUID v4 string.')
    expect(tool.parameters).toBeDefined()
  })

  it('should generate a UUID', async () => {
    const mockUuid = 'test-uuid-123'
    mockUuidv4.mockReturnValue(mockUuid)

    const tool = generateUuid()
    const result = await tool.execute!(
      {},
      { toolCallId: 'test-call-id', messages: [] }
    )

    expect(mockUuidv4).toHaveBeenCalledTimes(1)
    expect(result).toEqual({
      uuid: mockUuid
    })
  })

  it('should handle errors when UUID generation fails', async () => {
    const mockError = new Error('UUID generation failed')
    mockUuidv4.mockImplementation(() => {
      throw mockError
    })

    const tool = generateUuid()
    const result = await tool.execute!(
      {},
      { toolCallId: 'test-call-id', messages: [] }
    )

    expect(mockUuidv4).toHaveBeenCalledTimes(1)
    expect(result).toBe('Error generating UUID: Error: UUID generation failed')
  })
})
