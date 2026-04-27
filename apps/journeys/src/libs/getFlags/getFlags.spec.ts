import { LDClient } from '@launchdarkly/node-server-sdk'

import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'

import { getFlags } from './getFlags'

jest.mock('uuid', () => ({
  v4: () => 'mock-uuid'
}))

jest.mock('@core/shared/ui/getLaunchDarklyClient')

const mockGetLaunchDarklyClient = getLaunchDarklyClient as jest.MockedFunction<
  typeof getLaunchDarklyClient
>

describe('getFlags', () => {
  const mockAllFlagsState = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetLaunchDarklyClient.mockResolvedValue({
      allFlagsState: mockAllFlagsState
    } as unknown as LDClient)
  })

  it('should call allFlagsState with anonymous user and return flags', async () => {
    mockAllFlagsState.mockResolvedValue({
      toJSON: () => ({ apologistChat: true, otherFlag: false })
    })

    const result = await getFlags()

    expect(mockGetLaunchDarklyClient).toHaveBeenCalled()
    expect(mockAllFlagsState).toHaveBeenCalledWith({
      key: 'mock-uuid',
      anonymous: true
    })
    expect(result).toEqual({ apologistChat: true, otherFlag: false })
  })
})
