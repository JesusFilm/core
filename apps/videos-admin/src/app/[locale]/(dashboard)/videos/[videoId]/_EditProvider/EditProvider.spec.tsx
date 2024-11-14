import { render, renderHook, screen, waitFor } from '@testing-library/react'

import { EditProvider, EditState, reducer, useEdit } from './EditProvider'
import { TestEditProvider } from './TestEditProvider'
import { ReactNode } from 'react'

describe('EditProvider', () => {
  const state: EditState = {
    isEdit: false
  }

  describe('SetEditStateAction', () => {
    it('should set isEdit', async () => {
      expect(
        reducer(state, { type: 'SetEditStateAction', isEdit: true })
      ).toEqual({ isEdit: true })
    })
  })

  describe('EditProvider', () => {
    it('isEdit should be false by default', () => {
      render(
        <EditProvider>
          <TestEditProvider />
        </EditProvider>
      )

      expect(screen.getByText('isEdit: false')).toBeInTheDocument()
    })

    it('should throw error when not wrapped inside `UserProvider`', () => {
      expect(() => render(<TestEditProvider />)).toThrow(
        'The useEdit hook must be used within an EditProvider context'
      )
    })
  })
})
