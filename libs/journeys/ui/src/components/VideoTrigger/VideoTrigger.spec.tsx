import { act, render } from '@testing-library/react'
import type Player from 'video.js/dist/types/player'

import { TreeBlock, blockHistoryVar, treeBlocksVar } from '../../libs/block'
import { JourneyProvider } from '../../libs/JourneyProvider'
import { journey } from '../../libs/JourneyProvider/JourneyProvider.mock'

import { VideoTrigger } from './VideoTrigger'

const { plausible } = vi.hoisted(() => ({ plausible: vi.fn() }))
vi.mock('next-plausible', () => ({ usePlausible: () => plausible }))

describe('private preview video actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    blockHistoryVar([])
    treeBlocksVar([])
  })

  it.each(['external', 'internal'] as const)(
    'handles an %s trigger without analytics or external delivery',
    (kind) => {
      const start: TreeBlock = {
        id: 'start',
        __typename: 'StepBlock',
        parentBlockId: null,
        parentOrder: 0,
        locked: false,
        nextBlockId: 'target',
        slug: null,
        children: []
      }
      const target: TreeBlock = {
        ...start,
        id: 'target',
        nextBlockId: null
      }
      blockHistoryVar([start])
      treeBlocksVar([start, target])
      const listeners = new Map<string, () => void>()
      const pause = vi.fn()
      const player = {
        on: (event: string, handler: () => void) =>
          listeners.set(event, handler),
        off: (event: string) => listeners.delete(event),
        currentTime: () => 5,
        scrubbing: () => false,
        pause
      } as unknown as Player
      const open = vi.spyOn(window, 'open').mockImplementation(() => null)
      const action =
        kind === 'internal'
          ? {
              __typename: 'NavigateToBlockAction' as const,
              parentBlockId: 'trigger',
              gtmEventName: null,
              blockId: 'target'
            }
          : {
              __typename: 'LinkAction' as const,
              parentBlockId: 'trigger',
              gtmEventName: null,
              url: 'https://example.com',
              customizable: false,
              parentStepId: null
            }
      render(
        <JourneyProvider value={{ journey, renderMode: 'preview' }}>
          <VideoTrigger
            blockId="trigger"
            triggerStart={3}
            triggerAction={action}
            player={player}
          />
        </JourneyProvider>
      )
      expect(listeners.has('timeupdate')).toBe(true)
      act(() => listeners.get('timeupdate')?.())
      expect(pause).toHaveBeenCalledOnce()
      expect(blockHistoryVar().at(-1)?.id).toBe(
        kind === 'internal' ? 'target' : 'start'
      )
      expect(plausible).not.toHaveBeenCalled()
      expect(open).not.toHaveBeenCalled()
      open.mockRestore()
    }
  )
})
