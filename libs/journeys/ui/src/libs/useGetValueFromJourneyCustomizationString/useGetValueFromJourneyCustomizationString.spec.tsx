import { renderHook } from '@testing-library/react'

import { JourneyProvider } from '../JourneyProvider'
import { JourneyFields as Journey } from '../JourneyProvider/__generated__/JourneyFields'

import { useGetValueFromJourneyCustomizationString } from './useGetValueFromJourneyCustomizationString'

describe('useGetValueFromJourneyCustomizationString', () => {
  it('returns input if admin variant', () => {
    const journey = {
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: '1',
          journeyId: 'journeyId',
          key: 'name',
          value: 'Alice',
          defaultValue: 'Anonymous'
        }
      ]
    } as unknown as Journey

    const { result, rerender } = renderHook(
      ({ label }: { label: string }) =>
        useGetValueFromJourneyCustomizationString(label),
      {
        initialProps: { label: '{{ name }}' },
        wrapper: ({ children }) => (
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            {children}
          </JourneyProvider>
        )
      }
    )

    expect(result.current).toBe('{{ name }}')

    rerender({ label: 'Plain' })
    expect(result.current).toBe('Plain')
  })

  it('resolves value from journey customization fields for default variant', () => {
    const journey = {
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: '1',
          journeyId: 'journeyId',
          key: 'name',
          value: 'Alice',
          defaultValue: 'Anonymous'
        },
        {
          __typename: 'JourneyCustomizationField',
          id: '2',
          journeyId: 'journeyId',
          key: 'title',
          value: null,
          defaultValue: 'Child of God'
        }
      ]
    } as unknown as Journey

    const { result, rerender } = renderHook(
      ({ label }: { label: string }) =>
        useGetValueFromJourneyCustomizationString(label),
      {
        initialProps: { label: '{{ name }}' },
        wrapper: ({ children }) => (
          <JourneyProvider value={{ journey, variant: 'default' }}>
            {children}
          </JourneyProvider>
        )
      }
    )

    expect(result.current).toBe('Alice')

    rerender({ label: '{{ title }}' })
    expect(result.current).toBe('Child of God')

    rerender({ label: '{{ unknown }}' })
    expect(result.current).toBe('{{ unknown }}')
  })

  it('replaces custom fields within mixed strings and leaves non-custom-field text intact', () => {
    const journey = {
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: '1',
          journeyId: 'journeyId',
          key: 'name',
          value: 'Alice',
          defaultValue: 'Anonymous'
        }
      ]
    } as unknown as Journey

    const { result } = renderHook(
      ({ label }: { label: string }) =>
        useGetValueFromJourneyCustomizationString(label),
      {
        initialProps: { label: 'Hello {{ name }}!' },
        wrapper: ({ children }) => (
          <JourneyProvider value={{ journey, variant: 'default' }}>
            {children}
          </JourneyProvider>
        )
      }
    )

    expect(result.current).toBe('Hello Alice!')
  })

  it('supports multiple custom fields in one string and repeated keys', () => {
    const journey = {
      journeyCustomizationFields: [
        {
          __typename: 'JourneyCustomizationField',
          id: '1',
          journeyId: 'journeyId',
          key: 'first',
          value: 'John',
          defaultValue: 'J'
        },
        {
          __typename: 'JourneyCustomizationField',
          id: '2',
          journeyId: 'journeyId',
          key: 'last',
          value: 'Doe',
          defaultValue: 'D'
        }
      ]
    } as unknown as Journey

    const { result, rerender } = renderHook(
      ({ label }: { label: string }) =>
        useGetValueFromJourneyCustomizationString(label),
      {
        initialProps: { label: 'Hello {{ first }} {{ last }}!' },
        wrapper: ({ children }) => (
          <JourneyProvider value={{ journey, variant: 'default' }}>
            {children}
          </JourneyProvider>
        )
      }
    )

    expect(result.current).toBe('Hello John Doe!')

    rerender({ label: '{{ first }} & {{ first }}' })
    expect(result.current).toBe('John & John')
  })
})
