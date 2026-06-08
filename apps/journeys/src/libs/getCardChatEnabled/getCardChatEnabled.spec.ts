import { IdType } from '../../../__generated__/globalTypes'

import { getCardChatEnabled } from './getCardChatEnabled'

const { mockQuery, mockLoggerWarn } = vi.hoisted(() => ({
  mockQuery: vi.fn(),
  mockLoggerWarn: vi.fn()
}))

vi.mock('../apolloClient', () => ({
  createApolloClient: () => ({ query: mockQuery })
}))

vi.mock('../logger', () => ({
  logger: { warn: mockLoggerWarn, error: vi.fn(), info: vi.fn() }
}))

function journeyWithBlocks(blocks: unknown[]): unknown {
  return { data: { journey: { id: 'journey-1', blocks } } }
}

const enabledCard = {
  __typename: 'CardBlock',
  id: 'card-1',
  showAssistant: true
}

describe('getCardChatEnabled', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns true when the card exists and showAssistant is true', async () => {
    mockQuery.mockResolvedValue(journeyWithBlocks([enabledCard]))

    await expect(
      getCardChatEnabled({ journeyId: 'journey-1', cardId: 'card-1' })
    ).resolves.toBe(true)
  })

  it('queries the journey by databaseId with no-cache so the toggle is read fresh', async () => {
    mockQuery.mockResolvedValue(journeyWithBlocks([enabledCard]))

    await getCardChatEnabled({ journeyId: 'journey-1', cardId: 'card-1' })

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: expect.objectContaining({
          id: 'journey-1',
          idType: IdType.databaseId
        }),
        fetchPolicy: 'no-cache'
      })
    )
  })

  it('returns false when the card exists but showAssistant is false', async () => {
    mockQuery.mockResolvedValue(
      journeyWithBlocks([
        { __typename: 'CardBlock', id: 'card-1', showAssistant: false }
      ])
    )

    await expect(
      getCardChatEnabled({ journeyId: 'journey-1', cardId: 'card-1' })
    ).resolves.toBe(false)
  })

  it('returns false when showAssistant is null', async () => {
    mockQuery.mockResolvedValue(
      journeyWithBlocks([
        { __typename: 'CardBlock', id: 'card-1', showAssistant: null }
      ])
    )

    await expect(
      getCardChatEnabled({ journeyId: 'journey-1', cardId: 'card-1' })
    ).resolves.toBe(false)
  })

  it('returns false when the card is not part of the journey', async () => {
    mockQuery.mockResolvedValue(
      journeyWithBlocks([
        { __typename: 'CardBlock', id: 'a-different-card', showAssistant: true }
      ])
    )

    await expect(
      getCardChatEnabled({ journeyId: 'journey-1', cardId: 'card-1' })
    ).resolves.toBe(false)
  })

  it('returns false (and does not query) when journeyId is missing', async () => {
    await expect(
      getCardChatEnabled({ journeyId: undefined, cardId: 'card-1' })
    ).resolves.toBe(false)
    expect(mockQuery).not.toHaveBeenCalled()
  })

  it('returns false when the journey is not found (definitive negative)', async () => {
    mockQuery.mockRejectedValue(new Error('journey not found'))

    await expect(
      getCardChatEnabled({ journeyId: 'journey-1', cardId: 'card-1' })
    ).resolves.toBe(false)
    expect(mockLoggerWarn).not.toHaveBeenCalled()
  })

  it('fails open (returns true) and logs on an infrastructure error', async () => {
    mockQuery.mockRejectedValue(new Error('gateway exploded'))

    await expect(
      getCardChatEnabled({ journeyId: 'journey-1', cardId: 'card-1' })
    ).resolves.toBe(true)
    expect(mockLoggerWarn).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'chat_card_lookup_error' }),
      expect.any(String)
    )
  })
})
