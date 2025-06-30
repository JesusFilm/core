import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { act, renderHook } from '@testing-library/react'

import { ThemeMode, ThemeName } from '../../../__generated__/globalTypes'

import { stepAndCardBlockCreateMock } from './useStepAndCardBlockCreateMutation.mock'

import { useStepAndCardBlockCreateMutation } from '.'

describe('useStepAndCardBlockCreateMutation', () => {
  it('should create step and card block', async () => {
    const mockResult = jest
      .fn()
      .mockReturnValue(stepAndCardBlockCreateMock.result)

    const { result } = renderHook(() => useStepAndCardBlockCreateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider
          mocks={[{ ...stepAndCardBlockCreateMock, result: mockResult }]}
        >
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0]({
        variables: {
          stepBlockCreateInput: {
            id: 'newStep.id',
            journeyId: 'journey-id',
            x: -200,
            y: 38
          },
          cardBlockCreateInput: {
            id: 'newCard.id',
            journeyId: 'journey-id',
            parentBlockId: 'newStep.id',
            themeMode: ThemeMode.dark,
            themeName: ThemeName.base
          }
        }
      })
      expect(mockResult).toHaveBeenCalled()
    })
  })

  it('should update the cache', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journey-id': {
        id: 'journey-id',
        __typename: 'Journey',
        blocks: []
      }
    })

    const { result } = renderHook(() => useStepAndCardBlockCreateMutation(), {
      wrapper: ({ children }) => (
        <MockedProvider cache={cache} mocks={[stepAndCardBlockCreateMock]}>
          {children}
        </MockedProvider>
      )
    })

    await act(async () => {
      await result.current[0]({
        variables: {
          stepBlockCreateInput: {
            id: 'newStep.id',
            journeyId: 'journey-id',
            x: -200,
            y: 38
          },
          cardBlockCreateInput: {
            id: 'newCard.id',
            journeyId: 'journey-id',
            parentBlockId: 'newStep.id',
            themeMode: ThemeMode.dark,
            themeName: ThemeName.base
          }
        }
      })

      expect(cache.extract()['StepBlock:newStep.id']).toEqual({
        __typename: 'StepBlock',
        id: 'newStep.id',
        locked: false,
        nextBlockId: null,
        parentBlockId: null,
        parentOrder: null,
        x: -200,
        y: 38,
        slug: null
      })
      expect(cache.extract()['CardBlock:newCard.id']).toEqual({
        __typename: 'CardBlock',
        id: 'newCard.id',
        backgroundColor: null,
        coverBlockId: null,
        fullscreen: false,
        backdropBlur: null,
        parentBlockId: 'newStep.id',
        parentOrder: 0,
        themeMode: ThemeMode.dark,
        themeName: ThemeName.base
      })
    })
  })
})
