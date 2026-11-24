import { CombinedGraphQLErrors } from '@apollo/client'
import { act, renderHook, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'

import { CommittedFieldOptions, useCommittedField } from './useCommittedField'

function renderField(options: Partial<CommittedFieldOptions> = {}) {
  const save = vi.fn(async () => await Promise.resolve())
  const rendered = renderHook(
    (props: CommittedFieldOptions) => useCommittedField(props),
    { initialProps: { committed: 'Europe', save, ...options } }
  )
  return { ...rendered, save }
}

function refusal(message: string): CombinedGraphQLErrors {
  return new CombinedGraphQLErrors({
    errors: [
      new GraphQLError(message, {
        extensions: { code: 'BAD_USER_INPUT', field: 'name' }
      })
    ]
  })
}

describe('useCommittedField', () => {
  it('ignores a refusal from the previous Preview Language', async () => {
    let rejectSave: (error: unknown) => void = () => undefined
    const pending = new Promise<void>((_, reject) => {
      rejectSave = reject
    })
    const save = vi.fn(() => pending)
    const onRefused = vi.fn(() => 'French save refused')
    const { result, rerender } = renderField({
      committed: 'Europe',
      resetKey: 'fr',
      save,
      onRefused
    })

    act(() => result.current.onChange('Europe en français'))
    act(() => result.current.onBlur())
    rerender({ committed: 'English value', resetKey: 'en', save, onRefused })

    await act(async () => {
      rejectSave(new Error('French save refused'))
      await pending.catch(() => undefined)
    })

    expect(result.current.value).toBe('English value')
    expect(result.current.error).toBeUndefined()
    expect(onRefused).not.toHaveBeenCalled()
  })

  it('releases the old save on reset and ignores its completion during a new save', async () => {
    let resolveOld: () => void = () => undefined
    let resolveNew: () => void = () => undefined
    const oldPending = new Promise<void>((resolve) => {
      resolveOld = resolve
    })
    const newPending = new Promise<void>((resolve) => {
      resolveNew = resolve
    })
    const save = vi
      .fn()
      .mockReturnValueOnce(oldPending)
      .mockReturnValueOnce(newPending)
    const { result, rerender } = renderField({
      committed: 'French',
      resetKey: 'fr',
      save
    })
    act(() => result.current.onChange('French draft'))
    act(() => result.current.onBlur())
    rerender({ committed: 'English', resetKey: 'en', save })
    rerender({ committed: 'Updated English', resetKey: 'en', save })
    expect(result.current.value).toBe('Updated English')

    act(() => result.current.onChange('English draft'))
    act(() => result.current.onBlur())
    rerender({ committed: 'English server value', resetKey: 'en', save })
    await act(async () => {
      resolveOld()
      await oldPending
    })
    expect(result.current.value).toBe('English draft')

    await act(async () => {
      resolveNew()
      await newPending
    })
    expect(result.current.value).toBe('English server value')
  })

  it('saves what was typed, trimmed', async () => {
    const { result, save } = renderField()

    act(() => result.current.onChange('  Western Europe '))
    act(() => result.current.onBlur())

    expect(save).toHaveBeenCalledWith('Western Europe')
    expect(result.current.value).toBe('Western Europe')
    await waitFor(() => expect(result.current.error).toBeUndefined())
  })

  it('does not save a value that is unchanged once trimmed', () => {
    const { result, save } = renderField()

    act(() => result.current.onChange(' Europe  '))
    act(() => result.current.onBlur())

    expect(save).not.toHaveBeenCalled()
    expect(result.current.value).toBe('Europe')
  })

  it('shows the pre-check’s message instead of saving', () => {
    const { result, save } = renderField({
      validate: (value) => (value === '' ? 'Name is required' : undefined)
    })

    act(() => result.current.onChange('   '))
    act(() => result.current.onBlur())

    expect(save).not.toHaveBeenCalled()
    expect(result.current.error).toBe('Name is required')
  })

  it('shows the API’s field error verbatim and keeps the refused value until the author types', async () => {
    const save = vi.fn(
      async () =>
        await Promise.reject(refusal('name must be at most 60 characters'))
    )
    const { result, rerender } = renderField({ save })

    act(() => result.current.onChange('Europe!'))
    act(() => result.current.onBlur())

    await waitFor(() =>
      expect(result.current.error).toBe('name must be at most 60 characters')
    )
    // The rollback restores the stored value; the field keeps the refused one.
    rerender({ committed: 'Europe', save })
    expect(result.current.value).toBe('Europe!')

    act(() => result.current.onChange('Europe?'))
    expect(result.current.error).toBeUndefined()
    expect(result.current.value).toBe('Europe?')
  })

  it('goes back to the stored value after a refusal reported elsewhere', async () => {
    const save = vi.fn(
      async () => await Promise.reject(new Error('Network down'))
    )
    const onRefused = vi.fn(() => undefined)
    const { result } = renderField({ save, onRefused })

    act(() => result.current.onChange('Western Europe'))
    act(() => result.current.onBlur())

    await waitFor(() => expect(result.current.value).toBe('Europe'))
    expect(onRefused).toHaveBeenCalled()
    expect(result.current.error).toBeUndefined()
  })

  it('follows the stored value, and drops the draft and the error on a reset', () => {
    const { result, rerender, save } = renderField({
      validate: () => 'Nope'
    })

    rerender({ committed: 'Europa', save, validate: () => 'Nope' })
    expect(result.current.value).toBe('Europa')

    act(() => result.current.onChange('Draft'))
    act(() => result.current.onBlur())
    expect(result.current.error).toBe('Nope')

    rerender({
      committed: 'Europa',
      save,
      validate: () => 'Nope',
      resetKey: 'fr'
    })
    expect(result.current.value).toBe('Europa')
    expect(result.current.error).toBeUndefined()
  })
})
