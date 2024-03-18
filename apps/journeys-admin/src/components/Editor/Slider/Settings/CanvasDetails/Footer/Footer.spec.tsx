import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import {
  ActiveContent,
  ActiveFab,
  EditorProvider,
  EditorState,
  useEditor
} from '@core/journeys/ui/EditorProvider'
import { act } from 'react-dom/test-utils'
import {
  ActiveCanvasDetailsDrawer,
  ActiveSlide
} from '@core/journeys/ui/EditorProvider/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import {
  ChatPlatform,
  ThemeMode,
  ThemeName
} from '../../../../../../../__generated__/globalTypes'
import { TestEditorState } from '../../../../../../libs/TestEditorState'

import { Footer } from './Footer'

const mockUseEditor = useEditor as jest.MockedFunction<typeof useEditor>

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('Footer', () => {
  const state: EditorState = {
    steps: [],
    activeFab: ActiveFab.Add,
    activeSlide: ActiveSlide.JourneyFlow,
    activeContent: ActiveContent.Canvas,
    activeCanvasDetailsDrawer: ActiveCanvasDetailsDrawer.Properties
  }

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should display Footer attributes', async () => {
    const { getByText, getByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={state}>
            <TestEditorState />
            <Footer />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByText('Hosted By')).toBeInTheDocument()
    expect(getByText('Chat Widget')).toBeInTheDocument()
  })

  it('should render the components', async () => {
    const { getByText, queryByTestId } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={state}>
            <TestEditorState />
            <Footer />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    await act(async () => {
      fireEvent.click(getByText('Chat Widget'))
    })

    expect(queryByTestId('ChatComponent')).toBeInTheDocument()
    expect(queryByTestId('HostComponent')).not.toBeInTheDocument()
  })

  it('should switch tabs', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <EditorProvider initialState={state}>
            <TestEditorState />
            <Footer />
          </EditorProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    expect(getByRole('tab', { name: 'Hosted By' })).toBeInTheDocument()
    expect(getByRole('tab', { name: 'Chat Widget' })).toBeInTheDocument()

    fireEvent.click(getByRole('tab', { name: 'Chat Widget' }))
    expect(getByRole('tab', { name: 'Chat Widget' })).toHaveAttribute(
      'aria-selected',
      'true'
    )

    fireEvent.click(getByRole('tab', { name: 'Hosted By' }))
    expect(getByRole('tab', { name: 'Hosted By' })).toHaveAttribute(
      'aria-selected',
      'true'
    )
  })
})
