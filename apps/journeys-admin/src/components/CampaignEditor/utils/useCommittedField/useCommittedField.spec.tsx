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
