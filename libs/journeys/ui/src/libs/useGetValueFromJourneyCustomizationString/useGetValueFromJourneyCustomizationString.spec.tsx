import { renderHook } from '@testing-library/react'

import { JourneyProvider } from '../JourneyProvider'
import { JourneyFields as Journey } from '../JourneyProvider/__generated__/JourneyFields'

import { useGetValueFromJourneyCustomizationString } from './useGetValueFromJourneyCustomizationString'

describe('useGetValueFromJourneyCustomizationString', () => {
  it('returns input if admin variant and template is true', () => {
    const journey = {
      template: true,
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

  it('prefers defaultValue for default variant (end-user rendering)', () => {
    const journey = {
      template: false,
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

    expect(result.current).toBe('Anonymous')

    rerender({ label: '{{ title }}' })
    expect(result.current).toBe('Child of God')

    rerender({ label: '{{ unknown }}' })
    expect(result.current).toBe('{{ unknown }}')
  })

  it('prefers value for admin variant on non-template journey', () => {
    const journey = {
      template: false,
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
        initialProps: { label: '{{ name }}' },
        wrapper: ({ children }) => (
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            {children}
          </JourneyProvider>
        )
      }
    )

    expect(result.current).toBe('Alice')
  })

  it('replaces custom fields within mixed strings using defaultValue for default variant', () => {
    const journey = {
      template: false,
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

    expect(result.current).toBe('Hello Anonymous!')
  })

  it('supports multiple custom fields using defaultValue for default variant', () => {
    const journey = {
      template: false,
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

    expect(result.current).toBe('Hello J D!')

    rerender({ label: '{{ first }} & {{ first }}' })
    expect(result.current).toBe('J & J')
  })
})
