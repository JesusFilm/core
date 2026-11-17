import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'
import { auth } from '@core/yoga/firebaseClient'

import { prepareCardChatGate } from './mcpContentFeatures'

vi.mock('@core/shared/ui/getLaunchDarklyClient', () => ({
  getLaunchDarklyClient: vi.fn()
}))
vi.mock('@core/yoga/firebaseClient', () => ({ auth: { getUser: vi.fn() } }))

describe('current mounted Card chat eligibility', () => {
  it('uses current Admin identity targeting and reads live flag state after preparation', async () => {
    vi.mocked(auth.getUser).mockResolvedValue({
      uid: 'alice',
      email: 'alice@example.test',
      displayName: 'Alice'
    } as Awaited<ReturnType<typeof auth.getUser>>)
    let enabled = true
    const allFlagsState = vi.fn(async () => ({
      toJSON: () => ({ aiChatEditor: enabled })
    }))
    vi.mocked(getLaunchDarklyClient).mockResolvedValue({
      allFlagsState
    } as unknown as Awaited<ReturnType<typeof getLaunchDarklyClient>>)
    const check = await prepareCardChatGate('alice')
    expect(getLaunchDarklyClient).toHaveBeenCalledWith({
      key: 'alice',
      email: 'alice@example.test',
      firstName: 'Alice'
    })
    expect(await check()).toBe(true)
    enabled = false
    expect(await check()).toBe(false)
  })

  it('fails closed when current identity or flag configuration is unavailable', async () => {
    vi.mocked(auth.getUser).mockRejectedValueOnce(
      new Error('Controlled identity outage')
    )
    expect(await (await prepareCardChatGate('alice'))()).toBe(false)
    vi.mocked(auth.getUser).mockResolvedValue({ uid: 'alice' } as Awaited<
      ReturnType<typeof auth.getUser>
    >)
    vi.mocked(getLaunchDarklyClient).mockResolvedValue({
      allFlagsState: async () => ({ toJSON: () => ({}) })
    } as unknown as Awaited<ReturnType<typeof getLaunchDarklyClient>>)
    expect(await (await prepareCardChatGate('alice'))()).toBe(false)
  })
})
