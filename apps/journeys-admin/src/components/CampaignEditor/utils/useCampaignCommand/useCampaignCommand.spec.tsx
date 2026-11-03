import { act, renderHook, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { ReactElement, ReactNode } from 'react'

import { CommandProvider, useCommand } from '@core/journeys/ui/CommandProvider'

import { CampaignPageKind } from '../../../../../__generated__/globalTypes'
import {
  CampaignEditorProvider,
  CampaignEditorState,
  useCampaignEditor
} from '../../CampaignEditorProvider'
import { campaign, campaignWithRegions, eurLine, eurRegion } from '../../data'

import {
  campaignFlushContext,
  textDebounceKey,
  textDebounceKeyPrefix
} from './campaignFlushContext'
import {
  CampaignCommandProvider,
  CampaignCommandStep,
  useCampaignCommand
} from './useCampaignCommand'

interface Deferred {
  promise: Promise<unknown>
  resolve: () => void
  reject: (error: unknown) => void
}

function deferred(): Deferred {
  let resolve: () => void = () => undefined
  let reject: (error: unknown) => void = () => undefined
  const promise = new Promise<unknown>((resolvePromise, rejectPromise) => {
    resolve = () => resolvePromise(undefined)
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

/** A step that resolves at once and records each call. */
function landing(): ReturnType<typeof vi.fn<CampaignCommandStep>> {
  return vi.fn<CampaignCommandStep>(async () => undefined)
}

const initialState: Partial<CampaignEditorState> = {
  pageKind: CampaignPageKind.regionTemplate,
  regionId: 'eurRegionId',
  selectedBlockId: 'regionHeaderId',
  previewLanguageId: '496'
}

function renderModule(campaignProp = campaign) {
  function Wrapper({ children }: { children: ReactNode }): ReactElement {
    return (
      <SnackbarProvider>
        <CommandProvider>
          <CampaignEditorProvider
            campaign={campaignProp}
            initialState={initialState}
          >
            <CampaignCommandProvider>{children}</CampaignCommandProvider>
          </CampaignEditorProvider>
        </CommandProvider>
      </SnackbarProvider>
    )
  }
  return renderHook(
    () => ({
      ...useCampaignCommand(),
      ...useCommand(),
      editor: useCampaignEditor()
    }),
    { wrapper: Wrapper }
  )
}

type Rendered = ReturnType<typeof renderModule>['result']

/** Somewhere else: another page, nothing selected, the default language. */
function moveAway(result: Rendered): void {
  act(() => {
    result.current.editor.dispatch({
      type: 'SetEditorFocusAction',
      pageKind: CampaignPageKind.landing,
      selectedBlockId: undefined
    })
    result.current.editor.dispatch({
      type: 'SetPreviewLanguageAction',
      previewLanguageId: '529'
    })
  })
}

function focusOf(result: Rendered): Partial<CampaignEditorState> {
  const { pageKind, regionId, selectedBlockId, previewLanguageId } =
    result.current.editor.state
  return { pageKind, regionId, selectedBlockId, previewLanguageId }
}

describe('useCampaignCommand', () => {
  it('runs the first execute without refocusing, and returns undo and redo to the page, selection and Preview Language it was made in', async () => {
    const { result } = renderModule()
    const execute = landing()
    const undo = landing()

    await act(async () => {
      await result.current.addCampaignCommand({ execute, undo })
    })
    expect(execute).toHaveBeenCalledTimes(1)
    moveAway(result)
    expect(focusOf(result)).toMatchObject({
      pageKind: CampaignPageKind.landing,
      previewLanguageId: '529'
    })

    act(() => result.current.undo())

    expect(focusOf(result)).toEqual(initialState)
    await waitFor(() => expect(undo).toHaveBeenCalledTimes(1))

    moveAway(result)
    act(() => result.current.redo())

    expect(focusOf(result)).toEqual(initialState)
    await waitFor(() => expect(execute).toHaveBeenCalledTimes(2))
  })

  it('lets a per-step focus override win over the snapshot', async () => {
    const { result } = renderModule()

    // A delete: execute selects the parent, undo selects the block.
    await act(async () => {
      await result.current.addCampaignCommand({
        focus: {
          execute: { selectedBlockId: 'regionId' },
          undo: { selectedBlockId: 'regionHeaderId' }
        },
        execute: landing(),
        undo: landing()
      })
    })
    expect(result.current.editor.state.selectedBlockId).toBe('regionId')
    moveAway(result)

    act(() => result.current.undo())

    expect(focusOf(result)).toEqual(initialState)
    act(() => result.current.redo())
    expect(result.current.editor.state.selectedBlockId).toBe('regionHeaderId')
  })

  it('returns to the snapshot when a first execute with a focus override is refused', async () => {
    const { result } = renderModule()

    await act(async () => {
      await result.current
        .addCampaignCommand({
          focus: { execute: { selectedBlockId: 'newBlockId' } },
          execute: async () => await Promise.reject(new Error('Refused')),
          undo: landing()
        })
        .catch(() => undefined)
    })

    expect(focusOf(result)).toEqual(initialState)
  })

  it('makes every step wait for the one in flight, including a step of another Command', async () => {
    const { result } = renderModule()
    const first = deferred()
    const secondExecute = landing()
    const secondUndo = landing()

    act(() => {
      void result.current.addCampaignCommand({
        execute: async () => await first.promise,
        undo: landing()
      })
    })
    act(() => {
      void result.current.addCampaignCommand({
        execute: secondExecute,
        undo: secondUndo
      })
    })
    act(() => result.current.undo())

    await act(async () => await Promise.resolve())
    expect(secondExecute).not.toHaveBeenCalled()
    expect(secondUndo).not.toHaveBeenCalled()

    await act(async () => first.resolve())

    await waitFor(() => expect(secondUndo).toHaveBeenCalledTimes(1))
    expect(secondExecute).toHaveBeenCalledTimes(1)
    expect(secondExecute.mock.invocationCallOrder[0]).toBeLessThan(
      secondUndo.mock.invocationCallOrder[0]
    )
  })

  it('sends nothing for an undo whose execute was refused, even when pressed while it was in flight, and runs the execute again on redo', async () => {
    const { result } = renderModule()
    const flight = deferred()
    const execute = vi
      .fn<CampaignCommandStep>()
      .mockImplementationOnce(async () => await flight.promise)
      .mockImplementation(async () => undefined)
    const undo = landing()
    const redo = landing()
    let first: Promise<void> = Promise.resolve()

    act(() => {
      first = result.current.addCampaignCommand({ execute, undo, redo })
    })
    act(() => result.current.undo())
    await act(async () => {
      flight.reject(new Error('Refused'))
      await first.catch(() => undefined)
    })

    await expect(first).rejects.toThrow('Refused')
    expect(undo).not.toHaveBeenCalled()

    act(() => result.current.redo())

    await waitFor(() => expect(execute).toHaveBeenCalledTimes(2))
    expect(redo).not.toHaveBeenCalled()
  })

  it('rejects the returned promise on a refused first execute, and reports a refused undo or redo in the snackbar', async () => {
    const { result } = renderModule()

    let refusal: unknown
    await act(async () => {
      await result.current
        .addCampaignCommand({
          execute: async () =>
            await Promise.reject(new Error('First execute refused')),
          undo: landing()
        })
        .catch((error: unknown) => {
          refusal = error
        })
    })
    expect(refusal).toEqual(new Error('First execute refused'))
    expect(screen.queryByText('First execute refused')).not.toBeInTheDocument()

    await act(async () => {
      await result.current.addCampaignCommand({
        execute: landing(),
        undo: async () => await Promise.reject(new Error('Undo refused'))
      })
    })
    act(() => result.current.undo())

    expect(await screen.findByText('Undo refused')).toBeInTheDocument()
  })

  it('passes each step the flush context of the subtree it names', async () => {
    const { result } = renderModule()
    const hero = campaign.blocks.find((block) => block.id === 'heroId')!
    const execute = landing()
    const undo = landing()

    await act(async () => {
      await result.current.addCampaignCommand({ flush: hero, execute, undo })
    })
    act(() => result.current.undo())
    await waitFor(() => expect(undo).toHaveBeenCalled())

    const flushContext = {
      debounceFlushPrefix: [
        'CampaignHeroBlock:heroId:',
        'CampaignButtonBlock:heroButtonId:'
      ]
    }
    expect(execute).toHaveBeenCalledWith({ flushContext })
    expect(undo).toHaveBeenCalledWith({ flushContext })
  })

  it('passes an empty flush context to a Command that names no subtree', async () => {
    const { result } = renderModule()
    const execute = landing()

    await act(async () => {
      await result.current.addCampaignCommand({ execute, undo: landing() })
    })

    expect(execute).toHaveBeenCalledWith({ flushContext: {} })
  })
})

describe('campaignFlushContext', () => {
  it('keys a field’s debounce by typename, block and field, and by language for a translation', () => {
    const hero = { __typename: 'CampaignHeroBlock', id: 'heroId' }
    expect(textDebounceKey(hero, 'title')).toBe(
      'CampaignHeroBlock:heroId:title'
    )
    expect(textDebounceKey(hero, 'title', '496')).toBe(
      'CampaignHeroBlock:heroId:title:496'
    )
    expect(textDebounceKeyPrefix(hero)).toBe('CampaignHeroBlock:heroId:')
  })

  it('flushes a block and everything it owns', () => {
    const hero = campaign.blocks.find((block) => block.id === 'heroId')!
    expect(campaignFlushContext(campaign.blocks, hero)).toEqual({
      debounceFlushPrefix: [
        'CampaignHeroBlock:heroId:',
        'CampaignButtonBlock:heroButtonId:'
      ]
    })
  })

  it('flushes a deleted block’s own keys even once it has left the cache', () => {
    expect(
      campaignFlushContext([], {
        __typename: 'CampaignHeroBlock',
        id: 'heroId'
      })
    ).toEqual({ debounceFlushPrefix: ['CampaignHeroBlock:heroId:'] })
  })

  it('flushes a region’s Region Lines', () => {
    expect(campaignFlushContext(campaignWithRegions.blocks, eurRegion)).toEqual(
      {
        debounceFlushPrefix: [textDebounceKeyPrefix(eurLine)]
      }
    )
  })

  it('is empty without a target', () => {
    expect(campaignFlushContext(campaign.blocks)).toEqual({})
  })
})
