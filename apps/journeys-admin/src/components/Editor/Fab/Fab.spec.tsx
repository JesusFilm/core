import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { TreeBlock } from '@core/journeys/ui/block'
import {
  ActiveContent,
  ActiveFab,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'
import {
  ActiveCanvasDetailsDrawer,
  ActiveSlide
} from '@core/journeys/ui/EditorProvider/EditorProvider'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourney'
import { TestEditorState } from '../../../libs/TestEditorState'
import '../../../../test/i18n'

import { Fab } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('Fab', () => {
  const state: EditorState = {
    activeFab: ActiveFab.Add,
    activeSlide: ActiveSlide.Content,
    activeContent: ActiveContent.Canvas,
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
  }

  describe('smUp', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )

    it('should be disabled', () => {
      const step = {
        id: 'step1.id',
        __typename: 'StepBlock',
        name: 'Step 1',
        blocks: []
      } as unknown as TreeBlock<StepBlock>
      const selectedStep = {
        ...step,
        children: [
          {
            id: 'card1.id',
            __typename: 'CardBlock',
            coverBlockId: 'anotherVideo.id',
            children: [
              {
                id: 'video1.id',
                __typename: 'VideoBlock',
                children: []
              }
            ]
          }
        ]
      } as unknown as TreeBlock<StepBlock>
      const disabledState = {
        ...state,
        steps: [step],
        selectedStep
      }

      const { getByRole } = render(
        <EditorProvider initialState={disabledState}>
          <Fab variant="canvas" />
        </EditorProvider>
      )

      expect(getByRole('button', { name: 'Add Block' })).toBeDisabled()
    })

    it('should handle add', () => {
      const { getByRole, getByText } = render(
        <EditorProvider initialState={state}>
          <TestEditorState />
          <Fab variant="canvas" />
        </EditorProvider>
      )
      expect(getByText('activeFab: Add')).toBeInTheDocument()
      fireEvent.click(getByRole('button', { name: 'Add Block' }))
      expect(getByText('activeCanvasDetailsDrawer: 2')).toBeInTheDocument()
    })

    it('should handle add block', () => {
      const selectedStep = {
        id: 'step1.id',
        __typename: 'StepBlock',
        children: []
      } as unknown as TreeBlock<StepBlock>
      const { getByRole, getByText } = render(
        <EditorProvider
          initialState={{
            ...state,
            activeSlide: ActiveSlide.Drawer,
            activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.AddBlock,
            selectedStep
          }}
        >
          <TestEditorState />
          <Fab variant="canvas" />
        </EditorProvider>
      )
      expect(getByText('activeFab: Add')).toBeInTheDocument()
      fireEvent.click(getByRole('button', { name: 'Add Block' }))
      expect(getByText('activeSlide: 1')).toBeInTheDocument()
      expect(getByText('activeCanvasDetailsDrawer: 2')).toBeInTheDocument()
      expect(getByText('selectedBlock: step1.id')).toBeInTheDocument()
    })

    it('should handle edit block', () => {
      const selectedStep = {
        id: 'step1.id',
        __typename: 'StepBlock',
        children: []
      } as unknown as TreeBlock<StepBlock>
      const { getByText, getByTestId } = render(
        <EditorProvider
          initialState={{
            ...state,
            activeSlide: ActiveSlide.JourneyFlow,
            activeFab: ActiveFab.Edit,
            selectedStep
          }}
        >
          <TestEditorState />
          <Fab variant="canvas" />
        </EditorProvider>
      )
      expect(getByText('activeSlide: 0')).toBeInTheDocument()
      expect(getByText('activeFab: Edit')).toBeInTheDocument()

      fireEvent.click(getByTestId('Fab'))
      expect(getByText('selectedBlock: step1.id')).toBeInTheDocument()
      expect(getByText('activeFab: Add')).toBeInTheDocument()
      expect(
        getByText('selectedAttributeId: step1.id-next-block')
      ).toBeInTheDocument()
      expect(getByText('activeSlide: 1')).toBeInTheDocument()
    })

    it('should handle edit social', () => {
      const { getByText, getByRole } = render(
        <EditorProvider
          initialState={{
            ...state,
            activeSlide: ActiveSlide.JourneyFlow,
            activeContent: ActiveContent.Social,
            activeFab: ActiveFab.Edit
          }}
        >
          <TestEditorState />
          <Fab variant="social" />
        </EditorProvider>
      )

      fireEvent.click(getByRole('button', { name: 'Edit' }))
      expect(getByText('activeSlide: 1')).toBeInTheDocument()
    })

    it('should update Fab text on edit', () => {
      const { getByTestId, getByText } = render(
        <EditorProvider
          initialState={{
            ...state,
            activeFab: ActiveFab.Edit
          }}
        >
          <TestEditorState />
          <Fab variant="canvas" />
        </EditorProvider>
      )
      const fab = getByTestId('Fab')
      expect(fab).toHaveTextContent('Edit')
      expect(getByText('activeFab: Edit')).toBeInTheDocument()

      fireEvent.click(fab)
      expect(fab).toHaveTextContent('Done')
      expect(getByText('activeFab: Save')).toBeInTheDocument()
    })

    it('should handle save', () => {
      const { getByText, getByRole } = render(
        <EditorProvider
          initialState={{
            ...state,
            activeFab: ActiveFab.Save
          }}
        >
          <TestEditorState />
          <Fab variant="canvas" />
        </EditorProvider>
      )
      fireEvent.click(getByRole('button', { name: 'Done' }))
      expect(getByText('activeFab: Edit')).toBeInTheDocument()
    })

    it('should set active content if nullish', () => {
      const { getByText } = render(
        <EditorProvider initialState={{ ...state, activeContent: undefined }}>
          <TestEditorState />
          <Fab variant="canvas" />
        </EditorProvider>
      )
      expect(getByText('activeContent: canvas')).toBeInTheDocument()
    })
  })

  describe('smDown', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

    it('should update Fab on edit', () => {
      const { getByTestId, getByText } = render(
        <EditorProvider
          initialState={{
            ...state,
            activeFab: ActiveFab.Edit
          }}
        >
          <TestEditorState />
          <Fab variant="mobile" />
        </EditorProvider>
      )
      const fab = getByTestId('Fab')
      expect(fab).not.toHaveTextContent('Edit')
      expect(getByTestId('Edit2Icon')).toBeInTheDocument()
      expect(getByText('activeFab: Edit')).toBeInTheDocument()

      fireEvent.click(fab)
      expect(fab).not.toHaveTextContent('Done')
      expect(getByTestId('CheckContainedIcon')).toBeInTheDocument()
      expect(getByText('activeFab: Save')).toBeInTheDocument()
    })

    it('should handle add', async () => {
      const { getByText, getByTestId } = render(
        <EditorProvider initialState={state}>
          <TestEditorState />
          <Fab variant="mobile" />
        </EditorProvider>
      )
      expect(getByText('activeSlide: 1')).toBeInTheDocument()
      expect(getByText('activeFab: Add')).toBeInTheDocument()

      const fab = getByTestId('Fab')
      fireEvent.click(fab)
      await waitFor(() => {
        expect(fab).not.toBeVisible()
      })
      expect(getByText('activeSlide: 2')).toBeInTheDocument()
    })
  })
})
