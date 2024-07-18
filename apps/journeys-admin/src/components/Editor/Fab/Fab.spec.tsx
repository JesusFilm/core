import useMediaQuery from '@mui/material/useMediaQuery'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import {
  ActiveContent,
  EditorProvider,
  EditorState
} from '@core/journeys/ui/EditorProvider'
import {
  ActiveCanvasDetailsDrawer,
  ActiveSlide
} from '@core/journeys/ui/EditorProvider/EditorProvider'
import { TreeBlock } from '@core/journeys/ui/block'

import { GetJourney_journey_blocks_StepBlock as StepBlock } from '../../../../__generated__/GetJourney'
import { TestEditorState } from '../../../libs/TestEditorState'

import { Fab } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: jest.fn()
}))

describe('Fab', () => {
  const state: EditorState = {
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

      render(
        <EditorProvider initialState={disabledState}>
          <Fab variant="canvas" />
        </EditorProvider>
      )

      expect(screen.getByRole('button', { name: 'Add Block' })).toBeDisabled()
    })

    it('should handle add', () => {
      render(
        <EditorProvider initialState={state}>
          <TestEditorState />
          <Fab variant="canvas" />
        </EditorProvider>
      )
      fireEvent.click(screen.getByRole('button', { name: 'Add Block' }))
      expect(
        screen.getByText('activeCanvasDetailsDrawer: 2')
      ).toBeInTheDocument()
    })

    it('should handle add block', () => {
      const selectedStep = {
        id: 'step1.id',
        __typename: 'StepBlock',
        children: []
      } as unknown as TreeBlock<StepBlock>
      render(
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
      fireEvent.click(screen.getByRole('button', { name: 'Add Block' }))
      expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
      expect(
        screen.getByText('activeCanvasDetailsDrawer: 2')
      ).toBeInTheDocument()
      expect(screen.getByText('selectedBlock: step1.id')).toBeInTheDocument()
    })
  })

  describe('smDown', () => {
    beforeEach(() =>
      (useMediaQuery as jest.Mock).mockImplementation(() => false)
    )

    it('should handle add', async () => {
      render(
        <EditorProvider initialState={state}>
          <TestEditorState />
          <Fab variant="mobile" />
        </EditorProvider>
      )
      expect(screen.getByText('activeSlide: 1')).toBeInTheDocument()
      const fab = screen.getByTestId('Fab')
      fireEvent.click(fab)
      await waitFor(() => {
        expect(fab).not.toBeVisible()
      })
      expect(screen.getByText('activeSlide: 2')).toBeInTheDocument()
    })
  })
})
