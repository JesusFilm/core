import {
  ReactElement,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef
} from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { CampaignPageKind } from '../../../../../__generated__/globalTypes'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { useCommandFailure } from '../useCommandFailure'

import {
  CampaignFlushContext,
  CampaignFlushTarget,
  campaignFlushContext
} from './campaignFlushContext'

/** Where a Command was made: what its undo and redo return to before they run. */
export interface CampaignCommandFocus {
  pageKind: CampaignPageKind
  regionId?: string
  selectedBlockId?: string
  selectedRegionId?: string
  previewLanguageId: string
}

export interface CampaignCommandStepContext {
  /** Spread into the step's request `context`: flushes the `flush` subtree's pending text first. */
  flushContext: CampaignFlushContext
}

/** One async write of a Command; a rejection is a refusal. */
export type CampaignCommandStep = (
  context: CampaignCommandStepContext
) => Promise<unknown>

export interface CampaignCommandSpec {
  /** Passed to `CommandProvider`: successive Commands with one id are kept as the latest. */
  id?: string
  execute: CampaignCommandStep
  undo: CampaignCommandStep
  /** Defaults to `execute`. */
  redo?: CampaignCommandStep
  /** Per-step focus, over the snapshot taken when the Command is added. */
  focus?: {
    execute?: Partial<CampaignCommandFocus>
    undo?: Partial<CampaignCommandFocus>
    redo?: Partial<CampaignCommandFocus>
  }
  /** The block or region whose subtree's pending text is flushed before each step. */
  flush?: CampaignFlushTarget
}

export interface CampaignCommandContextValue {
  /**
   * Add a Command and run its execute. Resolves once the execute lands;
   * rejects when the API refuses it, for the caller to show where the edit
   * was made.
   */
  addCampaignCommand: (spec: CampaignCommandSpec) => Promise<void>
}

const CampaignCommandContext = createContext<
  CampaignCommandContextValue | undefined
>(undefined)

type StepName = 'execute' | 'undo' | 'redo'

/**
 * The lifecycle every campaign Command shares, above `CommandProvider`, so
 * the concrete Commands supply only their steps:
 * - focus: the page, region, selection and Preview Language are snapshotted
 *   when the Command is added; undo and redo dispatch the step's override,
 *   else the snapshot, before the step runs. The first execute refocuses only
 *   with an override, and goes back to the snapshot when it is refused.
 * - order: one queue for the whole editor; every step waits for the previous
 *   step's settled promise, whichever Command it belongs to.
 * - refusal: a refused first execute rejects the promise
 *   `addCampaignCommand` returns; a refused undo or redo goes to the error
 *   snackbar. An undo whose execute was refused sends nothing, and a later
 *   redo runs the execute again.
 * - flush: each step gets the `flush` subtree's pending text as a request
 *   context, so a structural write never overtakes a debounced keystroke.
 */
export function CampaignCommandProvider({
  children
}: {
  children: ReactNode
}): ReactElement {
  const { add } = useCommand()
  const { campaign, state, dispatch } = useCampaignEditor()
  const reportFailure = useCommandFailure()
  const latest = useRef({ add, campaign, state, dispatch, reportFailure })
  latest.current = { add, campaign, state, dispatch, reportFailure }
  const queue = useRef<{ tail: Promise<void>; inFlight: number }>({
    tail: Promise.resolve(),
    inFlight: 0
  })

  const enqueue = useCallback(
    async (step: () => Promise<void>): Promise<void> => {
      const current = queue.current
      // Nothing in flight: run at once, so the step's optimistic write shows
      // in the same tick as its focus.
      const run =
        current.inFlight === 0
          ? step()
          : current.tail.then(async () => await step())
      current.inFlight++
      const settled = run.then(
        () => undefined,
        () => undefined
      )
      current.tail = settled
      void settled.then(() => {
        current.inFlight--
      })
      await run
    },
    []
  )

  const addCampaignCommand = useCallback(
    async (spec: CampaignCommandSpec): Promise<void> => {
      const { state: editorState } = latest.current
      const snapshot: CampaignCommandFocus = {
        pageKind: editorState.pageKind,
        regionId: editorState.regionId,
        selectedBlockId: editorState.selectedBlockId,
        selectedRegionId: editorState.selectedRegionId,
        previewLanguageId: editorState.previewLanguageId
      }
      let executed = false

      function focus(target: CampaignCommandFocus): void {
        const { previewLanguageId, ...selection } = target
        latest.current.dispatch({ type: 'SetEditorFocusAction', ...selection })
        latest.current.dispatch({
          type: 'SetPreviewLanguageAction',
          previewLanguageId
        })
      }

      async function run(name: StepName): Promise<void> {
        await enqueue(async () => {
          const flushContext = campaignFlushContext(
            latest.current.campaign.blocks,
            spec.flush
          )
          if (name === 'undo') {
            if (!executed) return
            await spec.undo({ flushContext })
            return
          }
          if (name === 'redo' && executed && spec.redo != null) {
            await spec.redo({ flushContext })
            return
          }
          try {
            await spec.execute({ flushContext })
            executed = true
          } catch (error) {
            executed = false
            throw error
          }
        })
      }

      function replay(name: 'undo' | 'redo'): void {
        focus({ ...snapshot, ...spec.focus?.[name] })
        void run(name).catch((error: unknown) =>
          latest.current.reportFailure(error)
        )
      }

      let first: Promise<void> = Promise.resolve()
      latest.current.add({
        id: spec.id,
        parameters: { execute: {}, undo: {}, redo: {} },
        execute() {
          if (spec.focus?.execute != null)
            focus({ ...snapshot, ...spec.focus.execute })
          first = run('execute')
        },
        undo() {
          replay('undo')
        },
        redo() {
          replay('redo')
        }
      })
      try {
        await first
      } catch (error) {
        if (spec.focus?.execute != null) focus(snapshot)
        throw error
      }
    },
    [enqueue]
  )

  const value = useMemo(() => ({ addCampaignCommand }), [addCampaignCommand])

  return (
    <CampaignCommandContext.Provider value={value}>
      {children}
    </CampaignCommandContext.Provider>
  )
}

/** The Campaign Command module: see {@link CampaignCommandProvider}. */
export function useCampaignCommand(): CampaignCommandContextValue {
  const context = useContext(CampaignCommandContext)
  if (context === undefined)
    throw new Error(
      'useCampaignCommand must be used within a CampaignCommandProvider'
    )
  return context
}
