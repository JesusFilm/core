import { MockedProvider } from '@apollo/client/testing'
import {
  act,
  fireEvent,
  renderHook,
  screen,
  waitFor
} from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { GetJourney_journey as Journey } from '../../../../../../../../../__generated__/GetJourney'
import { getJourneySettingsUpdateMock } from '../../../../../../../../libs/useJourneyUpdateMutation/useJourneyUpdateMutation.mock'
import { CommandRedoItem } from '../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../Toolbar/Items/CommandUndoItem'

import { useToggleJourneyProperty } from './useToggleJourneyProperty'

describe('useToggleJourneyProperty', () => {
  it('should return true when property is true', () => {
    const journey = { showLogo: true } as unknown as Journey

    const { result } = renderHook(() => useToggleJourneyProperty('showLogo'), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[]}>
          <JourneyProvider value={{ journey }}>{children}</JourneyProvider>
        </MockedProvider>
      )
    })

    expect(result.current[0]).toBe(true)
  })

  it('should return false when property is false', () => {
    const journey = { showLogo: false } as unknown as Journey

    const { result } = renderHook(() => useToggleJourneyProperty('showLogo'), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[]}>
          <JourneyProvider value={{ journey }}>{children}</JourneyProvider>
        </MockedProvider>
      )
    })

    expect(result.current[0]).toBe(false)
  })

  it('should return false when property is null', () => {
    const journey = { showLogo: null } as unknown as Journey

    const { result } = renderHook(() => useToggleJourneyProperty('showLogo'), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[]}>
          <JourneyProvider value={{ journey }}>{children}</JourneyProvider>
        </MockedProvider>
      )
    })

    expect(result.current[0]).toBe(false)
  })

  it('should update journey property', async () => {
    const mockUpdate = getJourneySettingsUpdateMock({
      showLogo: true
    })

    const { result } = renderHook(() => useToggleJourneyProperty('showLogo'), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[mockUpdate]}>
          <JourneyProvider
            value={{ journey: { ...defaultJourney, showLogo: null } }}
          >
            <EditorProvider>{children}</EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(() => result.current[1](true))

    await waitFor(() => {
      expect(mockUpdate.result).toHaveBeenCalled()
    })
  })

  it('should handle undo/redo', async () => {
    const mockUpdate = getJourneySettingsUpdateMock({
      showLogo: true
    })
    const mockUpdateUndo = getJourneySettingsUpdateMock({
      showLogo: false
    })
    const mockUpdateRedo = getJourneySettingsUpdateMock({
      showLogo: true
    })

    const { result } = renderHook(() => useToggleJourneyProperty('showLogo'), {
      wrapper: ({ children }) => (
        <MockedProvider mocks={[mockUpdate, mockUpdateUndo, mockUpdateRedo]}>
          <JourneyProvider
            value={{ journey: { ...defaultJourney, showLogo: null } }}
          >
            <EditorProvider>
              {children}
              <CommandUndoItem variant="button" />
              <CommandRedoItem variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )
    })

    await act(() => result.current[1](true))

    await waitFor(() => {
      expect(mockUpdate.result).toHaveBeenCalled()
    })

    await act(() =>
      fireEvent.click(screen.getByRole('button', { name: /undo/i }))
    )

    await waitFor(() => {
      expect(mockUpdateUndo.result).toHaveBeenCalled()
    })

    await act(() =>
      fireEvent.click(screen.getByRole('button', { name: /redo/i }))
    )

    await waitFor(() => {
      expect(mockUpdateRedo.result).toHaveBeenCalled()
    })
  })
})
