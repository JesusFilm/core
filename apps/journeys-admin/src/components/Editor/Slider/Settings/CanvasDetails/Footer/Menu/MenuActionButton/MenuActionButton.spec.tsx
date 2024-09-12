import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { TestEditorState } from '../../../../../../../../libs/TestEditorState'
import { CommandRedoItem } from '../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../Toolbar/Items/CommandUndoItem'

import { menuCard, menuStep, menuTypography } from './data'
import { mockUseMenuBlockCreateMutation } from './useMenuBlockCreateMutation/useMenuBlockCreateMutation.mock'
import { mockUseMenuBlockDeleteMutation } from './useMenuBlockDeleteMutation/useMenuBlockDeleteMutation.mock'
import { mockUseMenuBlockRestoreMutation } from './useMenuBlockRestoreMutation/useMenuBlockRestoreMutation.mock'

import { MenuActionButton } from '.'

jest.mock('uuid', () => ({
  __esModule: true,
  v4: jest.fn()
}))

const mockUuidv4 = uuidv4 as jest.MockedFunction<typeof uuidv4>

describe('MenuActionButton', () => {
  describe('Journey without menu', () => {
    it('should render with create menu', () => {
      render(
        <MockedProvider>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <MenuActionButton />
          </JourneyProvider>
        </MockedProvider>
      )

      expect(
        screen.getByRole('button', { name: 'Create Menu Card' })
      ).toBeInTheDocument()
    })

    it('should create menu when clicked', async () => {
      mockUuidv4.mockReturnValueOnce('step.id')
      mockUuidv4.mockReturnValueOnce('card.id')
      mockUuidv4.mockReturnValueOnce('typography.id')

      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journey-id': {
          blocks: [],
          id: 'journey-id',
          __typename: 'Journey'
        }
      })

      render(
        <MockedProvider mocks={[mockUseMenuBlockCreateMutation]} cache={cache}>
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider>
              <MenuActionButton />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      fireEvent.click(screen.getByRole('button', { name: 'Create Menu Card' }))
      await waitFor(() =>
        expect(mockUseMenuBlockCreateMutation.result).toHaveBeenCalled()
      )
      expect(cache.extract()['Journey:journey-id']?.blocks).toEqual([
        { __ref: 'StepBlock:step.id' },
        { __ref: 'CardBlock:card.id' },
        { __ref: 'TypographyBlock:typography.id' }
      ])
    })

    it('should handle undo menu card creation', async () => {
      mockUuidv4.mockReturnValueOnce(menuStep.id)
      mockUuidv4.mockReturnValueOnce(menuCard.id)
      mockUuidv4.mockReturnValueOnce(menuTypography.id)

      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journey-id': {
          blocks: [],
          id: 'journey-id',
          __typename: 'Journey'
        }
      })

      render(
        <MockedProvider
          mocks={[
            mockUseMenuBlockCreateMutation,
            mockUseMenuBlockDeleteMutation
          ]}
          cache={cache}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider>
              <MenuActionButton />
              <CommandUndoItem variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      fireEvent.click(screen.getByRole('button', { name: 'Create Menu Card' }))
      await waitFor(() =>
        expect(mockUseMenuBlockCreateMutation.result).toHaveBeenCalled()
      )
      expect(cache.extract()['Journey:journey-id']?.blocks).toEqual([
        { __ref: 'StepBlock:step.id' },
        { __ref: 'CardBlock:card.id' },
        { __ref: 'TypographyBlock:typography.id' }
      ])

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() =>
        expect(mockUseMenuBlockDeleteMutation.result).toHaveBeenCalled()
      )
      expect(cache.extract()['Journey:journey-id']?.blocks).toEqual([])
    })

    it('should handle undo/redo menu card creation', async () => {
      mockUuidv4.mockReturnValueOnce(menuStep.id)
      mockUuidv4.mockReturnValueOnce(menuCard.id)
      mockUuidv4.mockReturnValueOnce(menuTypography.id)

      const cache = new InMemoryCache()
      cache.restore({
        'Journey:journey-id': {
          blocks: [],
          id: 'journey-id',
          __typename: 'Journey'
        }
      })

      render(
        <MockedProvider
          mocks={[
            mockUseMenuBlockCreateMutation,
            mockUseMenuBlockDeleteMutation,
            mockUseMenuBlockRestoreMutation
          ]}
          cache={cache}
        >
          <JourneyProvider value={{ journey: defaultJourney }}>
            <EditorProvider>
              <MenuActionButton />
              <CommandUndoItem variant="button" />
              <CommandRedoItem variant="button" />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      fireEvent.click(screen.getByRole('button', { name: 'Create Menu Card' }))
      await waitFor(() =>
        expect(mockUseMenuBlockCreateMutation.result).toHaveBeenCalled()
      )
      expect(cache.extract()['Journey:journey-id']?.blocks).toEqual([
        { __ref: 'StepBlock:step.id' },
        { __ref: 'CardBlock:card.id' },
        { __ref: 'TypographyBlock:typography.id' }
      ])

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() =>
        expect(mockUseMenuBlockDeleteMutation.result).toHaveBeenCalled()
      )
      expect(cache.extract()['Journey:journey-id']?.blocks).toEqual([])

      fireEvent.click(screen.getByRole('button', { name: 'Redo' }))
      await waitFor(() =>
        expect(mockUseMenuBlockRestoreMutation.result).toHaveBeenCalled()
      )
      expect(cache.extract()['Journey:journey-id']?.blocks).toEqual([
        { __ref: 'StepBlock:step.id' }
      ])
    })
  })

  describe('Journey with menu', () => {
    it('should render with edit menu', () => {
      render(
        <MockedProvider>
          <JourneyProvider
            value={{
              journey: {
                ...defaultJourney,
                menuStepBlock: menuStep
              }
            }}
          >
            <MenuActionButton />
          </JourneyProvider>
        </MockedProvider>
      )

      expect(
        screen.getByRole('button', { name: 'Edit Menu Card' })
      ).toBeInTheDocument()
    })

    it('should focus menu card when clicked', () => {
      render(
        <MockedProvider mocks={[]}>
          <JourneyProvider
            value={{
              journey: {
                ...defaultJourney,
                menuStepBlock: menuStep
              }
            }}
          >
            <EditorProvider initialState={{ selectedStepId: 'empty' }}>
              <MenuActionButton />
              <TestEditorState />
            </EditorProvider>
          </JourneyProvider>
        </MockedProvider>
      )

      expect(screen.getByText('selectedStepId: empty')).toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: 'Edit Menu Card' }))
      expect(screen.getByText('selectedStepId: step.id')).toBeInTheDocument()
    })
  })
})
