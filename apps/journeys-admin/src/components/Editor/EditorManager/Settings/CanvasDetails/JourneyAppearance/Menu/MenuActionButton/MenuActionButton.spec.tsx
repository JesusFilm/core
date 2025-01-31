import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { v4 as uuidv4 } from 'uuid'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { defaultJourney } from '@core/journeys/ui/TemplateView/data'

import { TestEditorState } from '../../../../../../../../libs/TestEditorState'
import { mockUseMenuBlockCreateMutation } from '../../../../../../../../libs/useMenuBlockCreateMutation/useMenuBlockCreateMutation.mock'
import { mockUseMenuBlockDeleteMutation } from '../../../../../../../../libs/useMenuBlockDeleteMutation/useMenuBlockDeleteMutation.mock'
import { mockUseMenuBlockRestoreMutation } from '../../../../../../../../libs/useMenuBlockRestoreMutation/useMenuBlockRestoreMutation.mock'
import { CommandRedoItem } from '../../../../../../Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../../../../Toolbar/Items/CommandUndoItem'

import {
  mockMenuButton1,
  mockMenuButton2,
  mockMenuButton3,
  mockMenuCard,
  mockMenuHeading,
  mockMenuStep,
  mockMenuSubHeading
} from './data'

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
      mockUuidv4.mockReturnValueOnce(mockMenuStep.id)
      mockUuidv4.mockReturnValueOnce(mockMenuCard.id)
      mockUuidv4.mockReturnValueOnce(mockMenuHeading.id)
      mockUuidv4.mockReturnValueOnce(mockMenuSubHeading.id)
      mockUuidv4.mockReturnValueOnce(mockMenuButton1.id)
      mockUuidv4.mockReturnValueOnce(mockMenuButton2.id)
      mockUuidv4.mockReturnValueOnce(mockMenuButton3.id)

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
        { __ref: 'TypographyBlock:heading.id' },
        { __ref: 'TypographyBlock:subHeading.id' },
        { __ref: 'ButtonBlock:button1.id' },
        { __ref: 'ButtonBlock:button2.id' },
        { __ref: 'ButtonBlock:button3.id' }
      ])
    })

    it('should handle undo menu card creation', async () => {
      mockUuidv4.mockReturnValueOnce(mockMenuStep.id)
      mockUuidv4.mockReturnValueOnce(mockMenuCard.id)
      mockUuidv4.mockReturnValueOnce(mockMenuHeading.id)
      mockUuidv4.mockReturnValueOnce(mockMenuSubHeading.id)
      mockUuidv4.mockReturnValueOnce(mockMenuButton1.id)
      mockUuidv4.mockReturnValueOnce(mockMenuButton2.id)
      mockUuidv4.mockReturnValueOnce(mockMenuButton3.id)

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
        { __ref: 'TypographyBlock:heading.id' },
        { __ref: 'TypographyBlock:subHeading.id' },
        { __ref: 'ButtonBlock:button1.id' },
        { __ref: 'ButtonBlock:button2.id' },
        { __ref: 'ButtonBlock:button3.id' }
      ])

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }))
      await waitFor(() =>
        expect(mockUseMenuBlockDeleteMutation.result).toHaveBeenCalled()
      )
      expect(cache.extract()['Journey:journey-id']?.blocks).toEqual([])
    })

    it('should handle undo/redo menu card creation', async () => {
      mockUuidv4.mockReturnValueOnce(mockMenuStep.id)
      mockUuidv4.mockReturnValueOnce(mockMenuCard.id)
      mockUuidv4.mockReturnValueOnce(mockMenuHeading.id)
      mockUuidv4.mockReturnValueOnce(mockMenuSubHeading.id)
      mockUuidv4.mockReturnValueOnce(mockMenuButton1.id)
      mockUuidv4.mockReturnValueOnce(mockMenuButton2.id)
      mockUuidv4.mockReturnValueOnce(mockMenuButton3.id)

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
        { __ref: 'TypographyBlock:heading.id' },
        { __ref: 'TypographyBlock:subHeading.id' },
        { __ref: 'ButtonBlock:button1.id' },
        { __ref: 'ButtonBlock:button2.id' },
        { __ref: 'ButtonBlock:button3.id' }
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
                menuStepBlock: mockMenuStep
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
                menuStepBlock: mockMenuStep
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
