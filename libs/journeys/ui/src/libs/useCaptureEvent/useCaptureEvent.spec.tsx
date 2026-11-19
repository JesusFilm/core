import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client'
import { RetryLink } from '@apollo/client/link/retry'
import { ApolloProvider } from '@apollo/client/react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { Observable } from 'rxjs'

import {
  BlockEventLabel,
  CaptureEventTrigger
} from '../../../__generated__/globalTypes'
import { fireCaptureEvent } from '../plausibleHelpers'

import { CaptureEventInput, useCaptureEvent } from './useCaptureEvent'

const mappings = [
  [
    BlockEventLabel.decisionForChrist,
    'ChristDecision',
    'christDecisionCapture'
  ],
  [
    BlockEventLabel.gospelPresentationStart,
    'GospelStart',
    'gospelStartCapture'
  ],
  [
    BlockEventLabel.gospelPresentationComplete,
    'GospelComplete',
    'gospelCompleteCapture'
  ],
  [BlockEventLabel.prayerRequest, 'PrayerRequest', 'prayerRequestCapture'],
  [BlockEventLabel.rsvp, 'Rsvp', 'rsvpCapture'],
  [
    BlockEventLabel.specialVideoStart,
    'SpecialVideoStart',
    'specialVideoStartCapture'
  ],
  [
    BlockEventLabel.specialVideoComplete,
    'SpecialVideoComplete',
    'specialVideoCompleteCapture'
  ],
  [BlockEventLabel.custom1, 'Custom1', 'custom1Capture'],
  [BlockEventLabel.custom2, 'Custom2', 'custom2Capture'],
  [BlockEventLabel.custom3, 'Custom3', 'custom3Capture']
] as const

/** Mounts the sender with a request recorder and optional retry or failure paths. */
function setup({ retry = false, fail = false } = {}) {
  const requests: {
    name: string
    input: CaptureEventInput & { id: string }
  }[] = []
  const transport = new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        requests.push({
          name: operation.operationName ?? '',
          input: operation.variables.input
        })
        if (fail || (retry && requests.length === 1)) {
          observer.error(new Error('capture unavailable'))
          return
        }
        const name = operation.operationName ?? ''
        observer.next({
          data: {
            [name[0].toLowerCase() + name.slice(1)]: {
              id: operation.variables.input.id,
              __typename: name.replace(/Create$/, '')
            }
          }
        })
        observer.complete()
      })
  )
  const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: retry
      ? ApolloLink.from([
          new RetryLink({
            attempts: { max: 2 },
            delay: { initial: 1, jitter: false }
          }),
          transport
        ])
      : transport
  })
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ApolloProvider client={client}>{children}</ApolloProvider>
  )
  return { ...renderHook(() => useCaptureEvent(), { wrapper }), requests }
}

const input = {
  blockId: 'tagged-block',
  stepId: 'step',
  trigger: CaptureEventTrigger.buttonClick
}

function capture(
  send: ReturnType<typeof useCaptureEvent>,
  eventLabel: BlockEventLabel | null | undefined,
  plausible = vi.fn()
) {
  fireCaptureEvent(plausible, eventLabel, {
    u: 'https://example.com/journey/step',
    input: { id: 'interaction-uuid', blockId: input.blockId },
    ...input,
    capture: { send, trigger: input.trigger }
  })
  return plausible
}

describe('capture event delivery', () => {
  it.each(mappings)(
    'pairs %s with exactly one matching mutation and Plausible goal',
    async (tag, name, identity) => {
      const { result, requests, rerender } = setup()
      const plausible = capture(result.current, tag)
      await waitFor(() => expect(requests).toHaveLength(1))
      expect(requests[0]).toEqual({
        name: `${name}CaptureEventCreate`,
        input: { ...input, id: expect.stringMatching(/^[0-9a-f-]{36}$/) }
      })
      expect(requests[0].input.id).not.toBe('interaction-uuid')
      expect(plausible).toHaveBeenCalledTimes(1)
      expect(plausible).toHaveBeenCalledWith(
        identity,
        expect.objectContaining({
          props: expect.objectContaining({ id: 'interaction-uuid' })
        })
      )
      const send = result.current
      rerender()
      expect(result.current).toBe(send)
      expect(requests).toHaveLength(1)
    }
  )

  it.each([
    null,
    undefined,
    BlockEventLabel.share,
    BlockEventLabel.inviteFriend
  ])('does not deliver unsupported tag %s', (tag) => {
    const { result, requests } = setup()
    const plausible = capture(result.current, tag)
    expect(plausible).not.toHaveBeenCalled()
    expect(requests).toHaveLength(0)
  })

  it('retains its UUID on an Apollo retry and allocates another for a new action', async () => {
    const { result, requests } = setup({ retry: true })
    capture(result.current, BlockEventLabel.custom1)
    await waitFor(() => expect(requests).toHaveLength(2))
    expect(requests[1]).toEqual(requests[0])
    capture(result.current, BlockEventLabel.custom1)
    await waitFor(() => expect(requests).toHaveLength(3))
    expect(requests[2].input.id).not.toBe(requests[0].input.id)
  })

  it('preserves Plausible and returns normally when the backend fails', async () => {
    const { result, requests } = setup({ fail: true })
    const plausible = vi.fn()
    await act(async () => {
      expect(() =>
        capture(result.current, BlockEventLabel.custom1, plausible)
      ).not.toThrow()
    })
    expect(requests).toHaveLength(1)
    expect(plausible).toHaveBeenCalledTimes(1)
  })

  it('does not send an invalid request without the containing step', () => {
    const { result, requests } = setup()
    result.current(BlockEventLabel.custom1, { ...input, stepId: '' })
    expect(requests).toHaveLength(0)
  })
})
