import { render } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import {
  ActiveCanvasDetailsDrawer,
  ActiveContent,
  ActiveFab,
  ActiveSlide,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider/EditorProvider'
import { useBreakpoints } from '@core/shared/ui/useBreakpoints'

import { Fab } from './Fab'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('@core/journeys/ui/EditorProvider', () => {
  const originalModule = jest.requireActual('@core/journeys/ui/EditorProvider')
  return {
    __esModule: true,
    ...originalModule,
    useEditor: jest.fn()
  }
})

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

const state: EditorState = {
  activeFab: ActiveFab.Add,
  activeSlide: ActiveSlide.JourneyFlow,
  activeContent: ActiveContent.Social,
  activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
}

const dispatch = jest.fn()

describe('Desktop', () => {
  beforeEach(() => {
    const useBreakpointsMock = useBreakpoints as jest.Mock
    useBreakpointsMock.mockReturnValue({
      xs: false,
      sm: true
    })
  })

  beforeEach(() => {
    mockUseEditor.mockReturnValue({
      state,
      dispatch
    })
  })

  it('renders fab add state', () => {
    const { getByTestId } = render(
      <EditorProvider
        initialState={{
          activeSlide: ActiveSlide.Content,
          activeFab: ActiveFab.Add
        }}
      >
        <Fab />
      </EditorProvider>
    )
    expect(getByTestId('edit2Icon')).toBeInTheDocument()
    expect(getByTestId('Fab')).toHaveTextContent('Add')
  })
})
