import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, waitFor } from '@testing-library/react'

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

import { TestEditorState } from '../../../libs/TestEditorState'

import { Fab } from './Fab'

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

  const editState: EditorState = {
    ...state,
    activeFab: ActiveFab.Edit
  }

  describe('smUp', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => true)
    )

    it('should render fab add state', () => {
      const { getByTestId } = render(
        <EditorProvider initialState={state}>
          <Fab variant="canvas" />
        </EditorProvider>
      )
      expect(getByTestId('Plus2Icon')).toBeInTheDocument()
      expect(getByTestId('Fab')).toHaveTextContent('Add Block')
    })

    it('should toggle fab edit and save states', () => {
      const { getByTestId, getByText } = render(
        <EditorProvider initialState={editState}>
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

    it('should set active content if nullish', () => {
      const { getByText } = render(
        <EditorProvider initialState={{ ...state, activeContent: undefined }}>
          <TestEditorState />
          <Fab variant="canvas" />
        </EditorProvider>
      )
      expect(getByText('activeContent: canvas')).toBeInTheDocument()
    })

    it('should dispatch on click edit action', () => {
      const { getByText, getByTestId } = render(
        <EditorProvider
          initialState={{
            ...state,
            activeSlide: ActiveSlide.JourneyFlow,
            activeFab: ActiveFab.Edit
          }}
        >
          <TestEditorState />
          <Fab variant="canvas" />
        </EditorProvider>
      )
      expect(getByText('activeSlide: 0')).toBeInTheDocument()
      expect(getByText('activeFab: Edit')).toBeInTheDocument()

      fireEvent.click(getByTestId('Fab'))
      expect(getByText('activeSlide: 1')).toBeInTheDocument()
      expect(getByText('activeFab: Add')).toBeInTheDocument()
    })
  })

  describe('smDown', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

    it('should toggle mobile fab edit and save states', () => {
      const { getByTestId, getByText } = render(
        <EditorProvider initialState={editState}>
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

    it('should dispatch on click add action for mobile', async () => {
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
        expect(getByText('activeSlide: 2')).toBeInTheDocument()
        expect(fab).not.toBeVisible()
      })
    })
  })
})
